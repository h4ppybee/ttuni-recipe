import type { Recipe } from '../types';
import { Card } from './ui/Card';
import { RecipeThumb } from './RecipeThumb';

export function RecipeCard({ recipe, onClick }: { recipe: Recipe; onClick: () => void }) {
  return (
    <Card pressable role="link" tabIndex={0} onClick={onClick} onKeyDown={(e) => e.key === 'Enter' && onClick()}>
      <div className="flex items-center gap-3">
        <RecipeThumb photoId={recipe.photoId} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-title-sm text-ink">{recipe.name}</p>
          <p className="mt-1 truncate text-caption text-muted">{recipe.ingredientNames.join(' · ')}</p>
        </div>
      </div>
    </Card>
  );
}
