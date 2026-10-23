export interface Ingredient {
  name: string;
  amount: string;
  group?: string;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  ingredientNames: string[];
  steps: string[];
  memo: string;
  photoId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Photo {
  id: string;
  full: Blob;
  thumb: Blob;
}

export interface RecipeDraft {
  name: string;
  ingredients: Ingredient[];
  steps: string[];
  memo: string;
}
