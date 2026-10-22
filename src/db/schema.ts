import Dexie, { type EntityTable } from 'dexie';
import type { Photo, Recipe } from '../types';

export class TtuniDB extends Dexie {
  recipes!: EntityTable<Recipe, 'id'>;
  photos!: EntityTable<Photo, 'id'>;

  constructor(name = 'ttuni-recipe') {
    super(name);
    this.version(1).stores({
      recipes: 'id, *ingredientNames, updatedAt',
      photos: 'id',
    });
  }
}

export const db = new TtuniDB();
