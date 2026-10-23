import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRecipeRepo, type RecipeRepo } from './recipeRepo';
import { TtuniDB } from './schema';

const newDb = () => new TtuniDB(`test-${crypto.randomUUID()}`);

describe('fake-indexeddb 환경', () => {
  it('Blob을 저장하고 읽을 수 있다', async () => {
    const db = newDb();
    await db.photos.add({ id: 'x', full: new Blob(['abc'], { type: 'image/jpeg' }), thumb: new Blob(['a']) });
    const photo = await db.photos.get('x');
    expect(await photo?.full.text()).toBe('abc');
  });
});

const draft = (overrides: Partial<{ name: string; steps: string[]; memo: string }> = {}) => ({
  name: overrides.name ?? '계란국',
  ingredients: [
    { name: ' 계란 ', amount: '2개' },
    { name: '대파', amount: '' },
  ],
  steps: overrides.steps ?? ['물을 끓인다', '  ', '계란을 푼다'],
  memo: overrides.memo ?? '',
});
const blobs = () => ({ full: new Blob(['full']), thumb: new Blob(['thumb']) });

describe('recipeRepo', () => {
  let db: TtuniDB;
  let repo: RecipeRepo;

  beforeEach(() => {
    db = newDb();
    repo = createRecipeRepo(db);
  });

  it('새 레시피를 정리해서 저장하고 ingredientNames를 계산한다', async () => {
    const id = await repo.save({ draft: draft(), photo: { kind: 'keep' } });
    const saved = await repo.get(id);
    expect(saved?.ingredients).toEqual([
      { name: '계란', amount: '2개' },
      { name: '대파', amount: '' },
    ]);
    expect(saved?.ingredientNames).toEqual(['계란', '대파']);
    expect(saved?.steps).toEqual(['물을 끓인다', '계란을 푼다']);
    expect(saved?.createdAt).toBe(saved?.updatedAt);
  });

  it('입력이 잘못되면 저장하지 않고 오류를 던진다', async () => {
    await expect(repo.save({ draft: draft({ name: ' ' }), photo: { kind: 'keep' } })).rejects.toThrow('INVALID_DRAFT');
  });

  it('없는 id로 수정하면 오류를 던진다', async () => {
    await expect(repo.save({ id: 'nope', draft: draft(), photo: { kind: 'keep' } })).rejects.toThrow(
      'RECIPE_NOT_FOUND',
    );
  });

  it('id가 빈 문자열이면 새 레시피로 취급해 비어 있지 않은 id를 만든다', async () => {
    const id = await repo.save({ id: '', draft: draft(), photo: { kind: 'keep' } });
    expect(id).not.toBe('');
    expect(await repo.get(id)).toBeDefined();
  });

  it('사진을 바꾸면 이전 사진을 지우고, 빼면 사진 참조와 사진을 함께 지운다', async () => {
    const id = await repo.save({ draft: draft(), photo: { kind: 'replace', ...blobs() } });
    const first = (await repo.get(id))?.photoId;
    expect(first).toBeDefined();

    await repo.save({ id, draft: draft(), photo: { kind: 'replace', ...blobs() } });
    const second = (await repo.get(id))?.photoId;
    expect(second).not.toBe(first);
    expect(await db.photos.count()).toBe(1);

    await repo.save({ id, draft: draft(), photo: { kind: 'remove' } });
    expect((await repo.get(id))?.photoId).toBeUndefined();
    expect(await db.photos.count()).toBe(0);
  });

  it('수정해도 createdAt은 유지하고 updatedAt은 갱신한다', async () => {
    const id = await repo.save({ draft: draft(), photo: { kind: 'keep' } });
    const before = await repo.get(id);
    await new Promise((r) => setTimeout(r, 5));
    await repo.save({ id, draft: draft({ name: '대파 계란국' }), photo: { kind: 'keep' } });
    const after = await repo.get(id);
    expect(after?.createdAt).toBe(before?.createdAt);
    expect(after?.updatedAt).toBeGreaterThan(before?.updatedAt ?? 0);
  });

  it('레시피를 지우면 사진도 지운다', async () => {
    const id = await repo.save({ draft: draft(), photo: { kind: 'replace', ...blobs() } });
    await repo.remove(id);
    expect(await repo.get(id)).toBeUndefined();
    expect(await db.photos.count()).toBe(0);
  });

  it('지금 쓰이는 재료명 목록을 중복 없이 돌려준다', async () => {
    await repo.save({ draft: draft(), photo: { kind: 'keep' } });
    await repo.save({
      draft: { ...draft(), ingredients: [{ name: '대파', amount: '1대' }, { name: '두부', amount: '' }] },
      photo: { kind: 'keep' },
    });
    expect((await repo.listIngredientNames()).sort()).toEqual(['계란', '대파', '두부']);
  });

  it('재료명 목록을 한글 가나다순으로 정렬해서 돌려준다', async () => {
    await repo.save({
      draft: { ...draft(), ingredients: [{ name: '파', amount: '' }, { name: '감자', amount: '' }, { name: '양파', amount: '' }] },
      photo: { kind: 'keep' },
    });
    expect(await repo.listIngredientNames()).toEqual(['감자', '양파', '파']);
  });

  it('고른 재료가 하나라도 들어간 레시피를 후보로 돌려준다', async () => {
    const a = await repo.save({ draft: draft(), photo: { kind: 'keep' } });
    const b = await repo.save({
      draft: { ...draft(), ingredients: [{ name: '두부', amount: '' }] },
      photo: { kind: 'keep' },
    });
    expect((await repo.findCandidates(['계란', '대파'])).map((r) => r.id)).toEqual([a]);
    expect((await repo.findCandidates(['대파', '두부'])).map((r) => r.id).sort()).toEqual([a, b].sort());
    expect(await repo.findCandidates([])).toEqual([]);
  });

  // iOS Safari에서 인덱스 커서가 'UnknownError: Unable to open cursor'로 실패한 사례가 있어
  // 재료명 목록과 오저뭐 후보는 커서 없이(getAll) 읽어야 한다.
  describe('커서를 쓰지 않는다', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('listIngredientNames와 findCandidates가 인덱스 커서를 열지 않는다', async () => {
      await repo.save({ draft: draft(), photo: { kind: 'keep' } });
      const openCursor = vi.spyOn(IDBIndex.prototype, 'openCursor');
      const openKeyCursor = vi.spyOn(IDBIndex.prototype, 'openKeyCursor');

      expect(await repo.listIngredientNames()).toEqual(['계란', '대파']);
      expect(await repo.findCandidates(['대파'])).toHaveLength(1);

      expect(openCursor).not.toHaveBeenCalled();
      expect(openKeyCursor).not.toHaveBeenCalled();
    });
  });

  describe('dataSize', () => {
    it('레시피가 없으면 0', async () => {
      expect(await repo.dataSize()).toBe(0);
    });

    it('레시피 내용(UTF-8 바이트)과 사진 Blob 크기를 더한다', async () => {
      const id = await repo.save({
        draft: draft(),
        photo: { kind: 'replace', full: new Blob(['x'.repeat(1000)]), thumb: new Blob(['y'.repeat(100)]) },
      });
      const recipe = await repo.get(id);
      const recipeBytes = new TextEncoder().encode(JSON.stringify(recipe)).length;
      expect(await repo.dataSize()).toBe(recipeBytes + 1100);
    });
  });
});

