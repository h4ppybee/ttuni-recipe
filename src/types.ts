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
  // 즐겨찾기면 true, 아니면 필드를 두지 않는다(예전 레코드·백업 호환). 켜고 꺼도 updatedAt은 그대로.
  favorite?: true;
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
