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

    async listIngredientNames(): Promise<string[]> {
      const keys = await db.recipes.orderBy('ingredientNames').uniqueKeys();
      return keys.map(String).sort((a, b) => a.localeCompare(b, 'ko'));
    },

    async findCandidates(selected: string[]): Promise<Recipe[]> {
      if (selected.length === 0) {
        return [];
      }
      return db.recipes.where('ingredientNames').anyOf(selected).distinct().toArray();
    },
  };
}

export type RecipeRepo = ReturnType<typeof createRecipeRepo>;

export const recipeRepo = createRecipeRepo(defaultDb);
