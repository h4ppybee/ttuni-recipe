import { BACKUP_APP, BACKUP_VERSION, planMerge, validateBackup, type MergePlan } from '../lib/backupFormat';
import { blobToDataUrl, dataUrlToBlob } from '../lib/dataUrl';
import { yyyymmdd } from '../lib/date';
import type { Photo } from '../types';
import { db as defaultDb, type TtuniDB } from './schema';

export type ImportResult = { ok: true; counts: MergePlan['counts'] } | { ok: false; reason: 'not-backup' | 'corrupted' };

export async function buildBackupBlob(db: TtuniDB): Promise<{ blob: Blob; fileName: string }> {
  // recipes/photos를 하나의 읽기 트랜잭션 안에서 함께 읽어 둘 사이에 다른 쓰기가 끼어들지 않게 한다.
  const { recipes, photos } = await db.transaction('r', db.recipes, db.photos, async () => ({
    recipes: await db.recipes.toArray(),
    photos: await db.photos.toArray(),
  }));
  // base64 변환은 트랜잭션 밖에서 한다(큰 문자열 하나를 만들지 않도록 조각 배열로 모은다, spec 8절).
  const parts: string[] = [
    `{"app":${JSON.stringify(BACKUP_APP)},"version":${BACKUP_VERSION},"exportedAt":${Date.now()},`,
    `"recipes":${JSON.stringify(recipes)},"photos":[`,
  ];
  for (let i = 0; i < photos.length; i += 1) {
    const photo = photos[i];
    const entry = {
      id: photo.id,
      full: await blobToDataUrl(photo.full),
      thumb: await blobToDataUrl(photo.thumb),
    };
    parts.push((i === 0 ? '' : ',') + JSON.stringify(entry));
  }
  parts.push(']}');
  return {
    blob: new Blob(parts, { type: 'application/json' }),
    fileName: `ttuni-recipe-backup-${yyyymmdd(new Date())}.json`,
  };
}

export async function importBackup(db: TtuniDB, text: string): Promise<ImportResult> {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, reason: 'corrupted' };
  }
  const validated = validateBackup(json);
  if (!validated.ok) {
    return validated;
  }
  const existing = await db.recipes.toArray();
  const plan = planMerge(existing, validated.data.recipes);
  const neededPhotoIds = new Set(plan.toPut.map((r) => r.photoId).filter((id): id is string => Boolean(id)));

  // data URL → Blob 변환은 트랜잭션 전에 끝낸다.
  let photos: Photo[];
  try {
    photos = validated.data.photos
      .filter((p) => neededPhotoIds.has(p.id))
      .map((p) => ({ id: p.id, full: dataUrlToBlob(p.full), thumb: dataUrlToBlob(p.thumb) }));
  } catch {
    return { ok: false, reason: 'corrupted' };
  }

  await db.transaction('rw', db.recipes, db.photos, async () => {
    await db.photos.bulkDelete(plan.photoIdsToDelete);
    await db.photos.bulkPut(photos);
    await db.recipes.bulkPut(plan.toPut);
  });
  return { ok: true, counts: plan.counts };
}

// UI는 이 객체만 쓴다(Dexie 직접 사용 금지, spec 10절).
export const backupService = {
  build: () => buildBackupBlob(defaultDb),
  restore: (text: string) => importBackup(defaultDb, text),
};
