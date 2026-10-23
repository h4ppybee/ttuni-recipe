import { hasErrors, validateDraft } from '../lib/validateDraft';
import { buildIngredientNames, normalizeIngredients } from '../lib/normalizeIngredients';
import type { Photo, Recipe, RecipeDraft } from '../types';
import { db as defaultDb, type TtuniDB } from './schema';

export type PhotoChange = { kind: 'keep' } | { kind: 'remove' } | { kind: 'replace'; full: Blob; thumb: Blob };

export interface SaveInput {
  id?: string;
  draft: RecipeDraft;
  photo: PhotoChange;
}

export function createRecipeRepo(db: TtuniDB) {
  return {
    async save({ id, draft, photo }: SaveInput): Promise<string> {
      if (hasErrors(validateDraft(draft))) {
        throw new Error('INVALID_DRAFT');
      }
      const recipeId = id || crypto.randomUUID();
      const newPhotoId = photo.kind === 'replace' ? crypto.randomUUID() : undefined;
      const ingredients = normalizeIngredients(draft.ingredients);
      const now = Date.now();

      // 트랜잭션 안에서는 DB 작업만 한다(spec 5절 트랜잭션 원칙).
      await db.transaction('rw', db.recipes, db.photos, async () => {
        const existing = id ? await db.recipes.get(id) : undefined;
        if (id && !existing) {
          throw new Error('RECIPE_NOT_FOUND');
        }
        let photoId = existing?.photoId;
        if (photo.kind !== 'keep' && photoId) {
          await db.photos.delete(photoId);
          photoId = undefined;
        }
        if (photo.kind === 'replace' && newPhotoId) {
          await db.photos.add({ id: newPhotoId, full: photo.full, thumb: photo.thumb });
          photoId = newPhotoId;
        }
        await db.recipes.put({
          id: recipeId,
          name: draft.name.trim(),
          ingredients,
          ingredientNames: buildIngredientNames(ingredients),
          steps: draft.steps.map((s) => s.trim()).filter((s) => s !== ''),
          memo: draft.memo.trim(),
          photoId,
          ...(existing?.favorite ? { favorite: true as const } : {}),
          createdAt: existing?.createdAt ?? now,
          updatedAt: now,
        });
      });
      return recipeId;
    },

    async remove(id: string): Promise<void> {
      await db.transaction('rw', db.recipes, db.photos, async () => {
        const recipe = await db.recipes.get(id);
        if (!recipe) {
          return;
        }
        if (recipe.photoId) {
          await db.photos.delete(recipe.photoId);
        }
        await db.recipes.delete(id);
      });
    },

    // 즐겨찾기는 목록 순서(최근 수정순)를 흔들지 않도록 updatedAt을 바꾸지 않는다.
    async setFavorite(id: string, on: boolean): Promise<void> {
      await db.transaction('rw', db.recipes, async () => {
        const recipe = await db.recipes.get(id);
        if (!recipe) {
          return;
        }
        const { favorite: _favorite, ...rest } = recipe;
        await db.recipes.put(on ? { ...rest, favorite: true } : rest);
      });
    },

    get(id: string): Promise<Recipe | undefined> {
      return db.recipes.get(id);
    },

    getPhoto(id: string): Promise<Photo | undefined> {
      return db.photos.get(id);
    },

    listAll(): Promise<Recipe[]> {
      return db.recipes.toArray();
    },

    count(): Promise<number> {
      return db.recipes.count();
    },

    // 설정 화면에 보여줄 레시피 데이터 용량. 앱 파일·폰트 캐시는 빼고
    // 레시피 내용(JSON UTF-8 바이트)과 사진 Blob 크기만 더한다.
    async dataSize(): Promise<number> {
      const [recipes, photos] = await Promise.all([db.recipes.toArray(), db.photos.toArray()]);
      const encoder = new TextEncoder();
      const recipeBytes = recipes.reduce((sum, recipe) => sum + encoder.encode(JSON.stringify(recipe)).length, 0);
      const photoBytes = photos.reduce((sum, photo) => sum + photo.full.size + photo.thumb.size, 0);
      return recipeBytes + photoBytes;
    },

    // iOS Safari에서 인덱스 커서가 'UnknownError: Unable to open cursor'로 실패한 적이 있어
    // 커서(uniqueKeys, anyOf) 대신 getAll(toArray)로 읽고 메모리에서 계산한다. 개인용 규모라 충분하다.
    async listIngredientNames(): Promise<string[]> {
      const recipes = await db.recipes.toArray();
      const names = new Set(recipes.flatMap((recipe) => recipe.ingredientNames));
      return [...names].sort((a, b) => a.localeCompare(b, 'ko'));
    },

    async findCandidates(selected: string[]): Promise<Recipe[]> {
      if (selected.length === 0) {
        return [];
      }
      const wanted = new Set(selected);
      const recipes = await db.recipes.toArray();
      return recipes.filter((recipe) => recipe.ingredientNames.some((name) => wanted.has(name)));
    },
  };
}

export type RecipeRepo = ReturnType<typeof createRecipeRepo>;

export const recipeRepo = createRecipeRepo(defaultDb);
