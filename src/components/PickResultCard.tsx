import { usePhotoUrl } from '../hooks/usePhotoUrl';
import type { Recipe } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Chip } from './ui/Chip';

interface PickResultCardProps {
  recipe: Recipe;
  selected: string[];
  onRetry: () => void;
  onOpen: () => void;
}

export function PickResultCard({ recipe, selected, onRetry, onOpen }: PickResultCardProps) {
  const photoUrl = usePhotoUrl(recipe.photoId, 'full');
  return (
    <Card className="animate-[pick-in_200ms_ease-out] motion-reduce:animate-[fade-in_200ms_ease-out]">
      {photoUrl && <img src={photoUrl} alt={recipe.name} className="mb-4 aspect-[4/3] w-full rounded-control object-cover" />}
      <p className="text-title-md text-ink">{recipe.name}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {recipe.ingredientNames.map((name) => (
          <Chip key={name} label={name} selected={selected.includes(name)} />
        ))}
      </div>
      <div className="mt-5 flex gap-2">
        <Button variant="secondary" block onClick={onRetry}>
          다시 뽑기
        </Button>
        <Button block onClick={onOpen}>
          레시피 보기
        </Button>
      </div>
    </Card>
  );
}
