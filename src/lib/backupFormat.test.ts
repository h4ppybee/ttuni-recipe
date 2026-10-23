import { describe, expect, it } from 'vitest';
import { makeRecipe } from '../test/fixtures';
import { BACKUP_APP, BACKUP_VERSION, planMerge, validateBackup } from './backupFormat';

const photo = { id: 'p1', full: 'data:image/jpeg;base64,AAAA', thumb: 'data:image/jpeg;base64,AAAA' };

function file(overrides: Record<string, unknown> = {}) {
  return {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: 1,
    recipes: [makeRecipe({ id: 'r1', photoId: 'p1' })],
    photos: [photo],
    ...overrides,
  };
}

describe('validateBackup', () => {
  it('올바른 파일을 통과시킨다', () => {
    const result = validateBackup(file());
    expect(result.ok).toBe(true);
  });

  it('app이나 version이 다르면 not-backup', () => {
    expect(validateBackup({ hello: 1 })).toEqual({ ok: false, reason: 'not-backup' });
    expect(validateBackup(file({ version: 2 }))).toEqual({ ok: false, reason: 'not-backup' });
    expect(validateBackup('text')).toEqual({ ok: false, reason: 'not-backup' });
  });

  it('레시피 필드 타입이 틀리면 corrupted', () => {
    const bad = file({ recipes: [{ ...makeRecipe(), steps: 'x' }] });
    expect(validateBackup(bad)).toEqual({ ok: false, reason: 'corrupted' });
  });

  it('참조한 사진이 없으면 corrupted', () => {
    expect(validateBackup(file({ photos: [] }))).toEqual({ ok: false, reason: 'corrupted' });
  });

  it('사진 값이 이미지 data URL이 아니면 corrupted', () => {
    expect(validateBackup(file({ photos: [{ ...photo, full: 'http://x' }] }))).toEqual({
      ok: false,
      reason: 'corrupted',
    });
  });

  it('base64가 아닌 data URL(svg 등)이면 corrupted', () => {
    expect(
      validateBackup(file({ photos: [{ ...photo, full: 'data:image/svg+xml,<svg/>' }] })),
    ).toEqual({ ok: false, reason: 'corrupted' });
  });

  it('사진 id가 빈 문자열이면 corrupted', () => {
    expect(validateBackup(file({ photos: [{ ...photo, id: '' }] }))).toEqual({
      ok: false,
      reason: 'corrupted',
    });
  });

  it('레시피 id가 중복되면 corrupted', () => {
    const recipes = [makeRecipe({ id: 'dup', photoId: 'p1' }), makeRecipe({ id: 'dup' })];
    expect(validateBackup(file({ recipes }))).toEqual({ ok: false, reason: 'corrupted' });
  });

  it('사진 id가 중복되면 corrupted', () => {
    const photos = [photo, { ...photo }];
    expect(validateBackup(file({ photos }))).toEqual({ ok: false, reason: 'corrupted' });
  });

  it('재료에 group이 문자열이면 통과한다(예전 백업은 group 없이도 통과)', () => {
    const recipe = {
      ...makeRecipe({ id: 'r1', photoId: 'p1' }),
      ingredients: [{ name: '간장', amount: '1큰술', group: '양념장' }],
    };
    const result = validateBackup(file({ recipes: [recipe] }));
    expect(result.ok).toBe(true);
  });

  it('재료의 group이 문자열이 아니면 corrupted', () => {
    const recipe = {
      ...makeRecipe({ id: 'r1', photoId: 'p1' }),
      ingredients: [{ name: '간장', amount: '1큰술', group: 123 }],
    };
    expect(validateBackup(file({ recipes: [recipe] }))).toEqual({ ok: false, reason: 'corrupted' });
  });

  it('즐겨찾기(favorite: true)는 통과하고 결과에도 남는다, 없으면 키가 없다', () => {
    const fav = makeRecipe({ id: 'r1', favorite: true });
    const plain = makeRecipe({ id: 'r2' });
    const result = validateBackup(file({ recipes: [fav, plain], photos: [] }));
    if (!result.ok) {
      throw new Error('통과해야 해요');
    }
    expect(result.data.recipes[0].favorite).toBe(true);
    expect('favorite' in result.data.recipes[1]).toBe(false);
  });

  it('favorite이 true가 아닌 값이면 corrupted', () => {
    for (const favorite of [false, 'yes', 1]) {
      const recipe = { ...makeRecipe({ id: 'r1' }), favorite };
      expect(validateBackup(file({ recipes: [recipe], photos: [] }))).toEqual({ ok: false, reason: 'corrupted' });
    }
  });

  it('재료를 다시 정리하고 ingredientNames는 파일 값을 버리고 다시 계산한다', () => {
    const recipe = {
      ...makeRecipe({ id: 'r1' }),
      ingredients: [{ name: ' 대파 ', amount: '1대' }, { name: '', amount: '2개' }],
      ingredientNames: ['거짓말'],
    };
    const result = validateBackup(file({ recipes: [recipe], photos: [] }));
    if (!result.ok) {
      throw new Error('통과해야 해요');
    }
    expect(result.data.recipes[0].ingredients).toEqual([{ name: '대파', amount: '1대' }]);
    expect(result.data.recipes[0].ingredientNames).toEqual(['대파']);
  });
});

describe('planMerge', () => {
  it('없는 레시피는 추가, 더 최근이면 갱신, 같거나 오래되면 그대로', () => {
    const existing = [
      makeRecipe({ id: 'same', updatedAt: 5 }),
      makeRecipe({ id: 'old', updatedAt: 5, photoId: 'oldPhoto' }),
      makeRecipe({ id: 'mine-newer', updatedAt: 9 }),
    ];
    const incoming = [
      makeRecipe({ id: 'new', updatedAt: 1 }),
      makeRecipe({ id: 'same', updatedAt: 5 }),
      makeRecipe({ id: 'old', updatedAt: 7, photoId: 'newPhoto' }),
      makeRecipe({ id: 'mine-newer', updatedAt: 3 }),
    ];
    const plan = planMerge(existing, incoming);
    expect(plan.toPut.map((r) => r.id)).toEqual(['new', 'old']);
    expect(plan.photoIdsToDelete).toEqual(['oldPhoto']);
    expect(plan.counts).toEqual({ added: 1, updated: 1, unchanged: 2 });
  });

  it('갱신해도 사진 id가 같으면 지우지 않는다', () => {
    const plan = planMerge(
      [makeRecipe({ id: 'a', updatedAt: 1, photoId: 'p' })],
      [makeRecipe({ id: 'a', updatedAt: 2, photoId: 'p' })],
    );
    expect(plan.photoIdsToDelete).toEqual([]);
  });
});
