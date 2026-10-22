import type { RecipeDraft } from '../types';
import { normalizeIngredients } from './normalizeIngredients';

export interface DraftErrors {
  name?: string;
  ingredients?: string;
  steps?: string;
}

export function validateDraft(draft: RecipeDraft): DraftErrors {
  const errors: DraftErrors = {};
  if (draft.name.trim() === '') {
    errors.name = '레시피 이름을 적어 주세요.';
  }
  if (normalizeIngredients(draft.ingredients).length === 0) {
    errors.ingredients = '재료를 1개 이상 적어 주세요.';
  }
  if (!draft.steps.some((step) => step.trim() !== '')) {
    errors.steps = '만드는 방법을 1단계 이상 적어 주세요.';
  }
  return errors;
}

export function hasErrors(errors: DraftErrors): boolean {
  return Object.keys(errors).length > 0;
}
