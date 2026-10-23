import { useLiveQuery } from 'dexie-react-hooks';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { IngredientGroups } from '../components/IngredientGroups';
import { LinkifiedText } from '../components/LinkifiedText';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Dialog } from '../components/ui/Dialog';
import { EmptyState } from '../components/ui/EmptyState';
import { IconButton } from '../components/ui/IconButton';
import { useToast } from '../components/ui/toastContext';
import { TopBar } from '../components/ui/TopBar';
import { recipeRepo } from '../db/recipeRepo';
import { usePhotoUrl } from '../hooks/usePhotoUrl';

export function RecipeDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const recipe = useLiveQuery(async () => (await recipeRepo.get(id)) ?? null, [id]);
  const photoUrl = usePhotoUrl(recipe?.photoId, 'full');
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (recipe === undefined) {
    return <TopBar back />;
  }
  if (recipe === null) {
    return (
      <>
        <TopBar back />
        <EmptyState message="레시피를 찾을 수 없어요." actionLabel="목록으로 가기" onAction={() => navigate('/', { replace: true })} />
      </>
    );
  }

  const remove = async () => {
    const targetId = recipe.id;
    setConfirmOpen(false);
    navigate('/', { replace: true });
    try {
      await recipeRepo.remove(targetId);
      toast('레시피를 삭제했어요.');
    } catch {
      toast('삭제하지 못했어요. 잠시 후 다시 시도해 주세요.');
    }
  };

  return (
    <>
      <TopBar
        back
        right={
          <IconButton label="레시피 수정하기" onClick={() => navigate(`/recipes/${recipe.id}/edit`)}>
            <Pencil size={22} strokeWidth={2} />
          </IconButton>
        }
      />
      <div className="flex flex-col gap-6 px-4 pb-10">
        {photoUrl && <img src={photoUrl} alt={recipe.name} className="aspect-[4/3] w-full rounded-card object-cover" />}
        <h1 className="text-title-lg text-ink">{recipe.name}</h1>

        <section>
          <h2 className="mb-3 text-title-md text-ink">재료</h2>
          <Card>
            <IngredientGroups items={recipe.ingredients} />
          </Card>
        </section>

        <section>
          <h2 className="mb-3 text-title-md text-ink">만드는 방법</h2>
          <ol className="flex flex-col gap-5">
            {recipe.steps.map((step, index) => (
              <li key={index} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-pill bg-primary-surface text-caption-strong text-primary-text">
                  {index + 1}
                </span>
                <p className="whitespace-pre-wrap text-body-lg text-body">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        {recipe.memo && (
          <section>
            <h2 className="mb-3 text-title-md text-ink">메모</h2>
            <Card>
              <LinkifiedText text={recipe.memo} />
            </Card>
          </section>
        )}

        <Button variant="weak" block onClick={() => setConfirmOpen(true)}>
          삭제하기
        </Button>
      </div>
      <Dialog
        open={confirmOpen}
        title="이 레시피를 삭제할까요?"
        description="삭제하면 되돌릴 수 없어요."
        confirmLabel="삭제하기"
        onConfirm={remove}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  );
}
