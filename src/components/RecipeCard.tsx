import { Star } from 'lucide-react';
import type { KeyboardEvent } from 'react';
import type { Recipe } from '../types';
import { Card } from './ui/Card';
import { RecipeThumb } from './RecipeThumb';

export function RecipeCard({ recipe, onClick }: { recipe: Recipe; onClick: () => void }) {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter') {
      return;
    }
    onClick();
  };

  return (
    <Card pressable role="link" tabIndex={0} onClick={onClick} onKeyDown={handleKeyDown}>
      <div className="flex items-center gap-3">
        <RecipeThumb photoId={recipe.photoId} />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1">
            <p className="truncate text-title-sm text-ink">{recipe.name}</p>
            {recipe.favorite && (
              <Star size={16} strokeWidth={2} fill="currentColor" className="shrink-0 text-primary" aria-label="즐겨찾기" role="img" />
            )}
          </div>
          <p className="mt-1 truncate text-caption text-muted">{recipe.ingredientNames.join(' · ')}</p>
        </div>
      </div>
    </Card>
  );
}
