import type { Ingredient, Recipe } from '../types';
import { buildIngredientNames, normalizeIngredients } from './normalizeIngredients';

export const BACKUP_APP = 'ttuni-recipe';
export const BACKUP_VERSION = 1;

export interface BackupPhoto {
  id: string;
  full: string;
  thumb: string;
}

export interface BackupFile {
  app: typeof BACKUP_APP;
  version: typeof BACKUP_VERSION;
  exportedAt: number;
  recipes: Recipe[];
  photos: BackupPhoto[];
}

export type ValidateResult = { ok: true; data: BackupFile } | { ok: false; reason: 'not-backup' | 'corrupted' };

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string';
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isImageDataUrl = (v: unknown) => isStr(v) && v.startsWith('data:image/');

function isIngredient(v: unknown): v is Ingredient {
  return isObj(v) && isStr(v.name) && isStr(v.amount);
}

function toRecipe(v: unknown): Recipe | undefined {
  if (!isObj(v)) {
    return undefined;
  }
  const { id, name, ingredients, steps, memo, photoId, createdAt, updatedAt } = v;
  if (!isStr(id) || id === '' || !isStr(name) || !isStr(memo) || !isNum(createdAt) || !isNum(updatedAt)) {
    return undefined;
  }
  if (!Array.isArray(ingredients) || !ingredients.every(isIngredient)) {
    return undefined;
  }
  if (!Array.isArray(steps) || !steps.every(isStr)) {
    return undefined;
  }
  if (photoId !== undefined && !isStr(photoId)) {
    return undefined;
  }
  const normalized = normalizeIngredients(ingredients);
  return {
    id,
    name,
    ingredients: normalized,
    ingredientNames: buildIngredientNames(normalized),
    steps,
    memo,
    photoId,
    createdAt,
    updatedAt,
  };
}

function isBackupPhoto(v: unknown): v is BackupPhoto {
  return isObj(v) && isStr(v.id) && isImageDataUrl(v.full) && isImageDataUrl(v.thumb);
}

export function validateBackup(json: unknown): ValidateResult {
  if (!isObj(json) || json.app !== BACKUP_APP || json.version !== BACKUP_VERSION) {
    return { ok: false, reason: 'not-backup' };
  }
  if (!isNum(json.exportedAt) || !Array.isArray(json.recipes) || !Array.isArray(json.photos)) {
    return { ok: false, reason: 'corrupted' };
  }
  if (!json.photos.every(isBackupPhoto)) {
    return { ok: false, reason: 'corrupted' };
  }
  const recipes = json.recipes.map(toRecipe);
  if (recipes.some((r) => r === undefined)) {
    return { ok: false, reason: 'corrupted' };
  }
  const validRecipes = recipes as Recipe[];
  const photoIds = new Set(json.photos.map((p) => p.id));
  if (validRecipes.some((r) => r.photoId !== undefined && !photoIds.has(r.photoId))) {
    return { ok: false, reason: 'corrupted' };
  }
  return {
    ok: true,
    data: {
      app: BACKUP_APP,
      version: BACKUP_VERSION,
      exportedAt: json.exportedAt,
      recipes: validRecipes,
      photos: json.photos,
    },
  };
}

export interface MergePlan {
  toPut: Recipe[];
  photoIdsToDelete: string[];
  counts: { added: number; updated: number; unchanged: number };
}

export function planMerge(
  existing: Pick<Recipe, 'id' | 'updatedAt' | 'photoId'>[],
  incoming: Recipe[],
): MergePlan {
  const byId = new Map(existing.map((r) => [r.id, r]));
  const plan: MergePlan = { toPut: [], photoIdsToDelete: [], counts: { added: 0, updated: 0, unchanged: 0 } };
  for (const recipe of incoming) {
    const current = byId.get(recipe.id);
    if (!current) {
      plan.toPut.push(recipe);
      plan.counts.added += 1;
      continue;
    }
    if (recipe.updatedAt <= current.updatedAt) {
      plan.counts.unchanged += 1;
      continue;
    }
    plan.toPut.push(recipe);
    plan.counts.updated += 1;
    if (current.photoId && current.photoId !== recipe.photoId) {
      plan.photoIdsToDelete.push(current.photoId);
    }
  }
  return plan;
}
