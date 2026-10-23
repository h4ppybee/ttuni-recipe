import { useToast } from '../components/ui/toastContext';
import { recipeRepo } from '../db/recipeRepo';
import type { Recipe } from '../types';

/** 즐겨찾기를 뒤집고 결과를 토스트로 알린다. 목록 스와이프와 상세 화면이 같이 쓴다. */
export function useToggleFavorite() {
  const toast = useToast();
  return async (recipe: Recipe) => {
    const on = !recipe.favorite;
    try {
      await recipeRepo.setFavorite(recipe.id, on);
      toast(on ? '즐겨찾기에 추가했어요.' : '즐겨찾기에서 뺐어요.');
    } catch {
      toast('바꾸지 못했어요. 잠시 후 다시 시도해 주세요.');
    }
  };
}
