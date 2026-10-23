import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildBackupBlob, importBackup } from './backup';
import { createRecipeRepo, type RecipeRepo } from './recipeRepo';
import { TtuniDB } from './schema';

const draft = (name: string) => ({
  name,
  ingredients: [{ name: '계란', amount: '2개' }],
  steps: ['끓인다'],
  memo: '',
});

describe('backup', () => {
  let db: TtuniDB;
  let repo: RecipeRepo;

  beforeEach(() => {
    db = new TtuniDB(`test-${crypto.randomUUID()}`);
    repo = createRecipeRepo(db);
  });

  it('만든 백업을 빈 DB에 불러오면 레시피와 사진이 그대로 들어온다', async () => {
    await repo.save({
      draft: draft('계란국'),
      photo: { kind: 'replace', full: new Blob(['F'], { type: 'image/jpeg' }), thumb: new Blob(['T'], { type: 'image/jpeg' }) },
    });
    await repo.save({ draft: draft('계란말이'), photo: { kind: 'keep' } });
    // backupService는 defaultDb(싱글턴)에 묶여 있어 이 테스트의 격리된 db와는 맞지 않으므로
    // 다른 테스트들과 같은 패턴으로 buildBackupBlob(db)를 직접 쓴다.
    const { blob, fileName } = await buildBackupBlob(db);
    expect(fileName).toMatch(/^ttuni-recipe-backup-\d{8}\.json$/);

    const target = new TtuniDB(`test-${crypto.randomUUID()}`);
    const result = await importBackup(target, await blob.text());
    expect(result).toEqual({ ok: true, counts: { added: 2, updated: 0, unchanged: 0 } });
    expect(await target.recipes.count()).toBe(2);
    const photo = (await target.photos.toArray())[0];
    expect(await photo.full.text()).toBe('F');
    expect(photo.full.type).toBe('image/jpeg');
  });

  it('즐겨찾기는 내보냈다가 빈 DB로 불러와도 유지된다', async () => {
    const id = await repo.save({ draft: draft('계란국'), photo: { kind: 'keep' } });
    await repo.save({ draft: draft('계란말이'), photo: { kind: 'keep' } });
    await repo.setFavorite(id, true);
    const { blob } = await buildBackupBlob(db);

    const target = new TtuniDB(`test-${crypto.randomUUID()}`);
    await importBackup(target, await blob.text());
    const restored = await target.recipes.toArray();
    expect(restored.filter((r) => r.favorite).map((r) => r.id)).toEqual([id]);
  });

  it('JSON이 아니면 corrupted, 다른 앱 파일이면 not-backup', async () => {
    expect(await importBackup(db, '{oops')).toEqual({ ok: false, reason: 'corrupted' });
    expect(await importBackup(db, '{"a":1}')).toEqual({ ok: false, reason: 'not-backup' });
  });

  it('저장 중 실패하면 기존 데이터는 그대로 남는다', async () => {
    const id = await repo.save({
      draft: draft('계란국'),
      photo: { kind: 'replace', full: new Blob(['old'], { type: 'image/jpeg' }), thumb: new Blob(['o'], { type: 'image/jpeg' }) },
    });
    const { blob } = await buildBackupBlob(db);
    const json = JSON.parse(await blob.text());
    json.recipes[0].updatedAt += 1000;
    json.recipes[0].photoId = json.photos[0].id = 'newPhoto';

    vi.spyOn(db.recipes, 'bulkPut').mockRejectedValueOnce(new Error('boom'));
    await expect(importBackup(db, JSON.stringify(json))).rejects.toThrow('boom');

    const recipe = await repo.get(id);
    expect(recipe?.photoId).not.toBe('newPhoto');
    expect(await db.photos.count()).toBe(1);
    expect(await (await db.photos.toArray())[0].full.text()).toBe('old');
  });
});
