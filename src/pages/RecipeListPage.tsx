import { useLiveQuery } from 'dexie-react-hooks';
import { Search, Star, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { RecipeCard } from '../components/RecipeCard';
import { SwipeRow } from '../components/SwipeRow';
import { Dialog } from '../components/ui/Dialog';
import { EmptyState } from '../components/ui/EmptyState';
import { Fab } from '../components/ui/Fab';
import { IconButton } from '../components/ui/IconButton';
import { fieldClass } from '../components/ui/TextField';
import { useToast } from '../components/ui/toastContext';
import { TopBar } from '../components/ui/TopBar';
import { recipeRepo } from '../db/recipeRepo';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useToggleFavorite } from '../hooks/useToggleFavorite';
import { cx } from '../lib/cx';
import { splitFavorites } from '../lib/favorites';
import { searchRecipes } from '../lib/search';
import type { Recipe } from '../types';

export function RecipeListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const recipes = useLiveQuery(() => recipeRepo.listAll(), []);
  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query, 150);
  const results = useMemo(() => searchRecipes(recipes ?? [], debounced), [recipes, debounced]);
  const { favorites, others } = useMemo(() => splitFavorites(results), [results]);
  const toggleFavorite = useToggleFavorite();
  const [openId, setOpenId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const goNew = () => navigate('/recipes/new');

  useEffect(() => {
    if (openId === null) {
      return;
    }
    const closeOnScroll = () => setOpenId(null);
    window.addEventListener('scroll', closeOnScroll, { passive: true });
    return () => window.removeEventListener('scroll', closeOnScroll);
  }, [openId]);

  const confirmDelete = async () => {
    const id = deleteTargetId;
    setDeleteTargetId(null);
    setOpenId(null);
    if (!id) {
      return;
    }
    try {
      await recipeRepo.remove(id);
      toast('레시피를 삭제했어요.');
    } catch {
      toast('삭제하지 못했어요. 잠시 후 다시 시도해 주세요.');
    }
  };

  const renderRow = (recipe: Recipe) => (
    <li key={recipe.id}>
      <SwipeRow
        open={openId === recipe.id}
        onOpenChange={(open) => setOpenId(open ? recipe.id : null)}
        actions={[
          {
            key: 'favorite',
            label: recipe.favorite ? '즐겨찾기에서 빼기' : '즐겨찾기에 추가하기',
            icon: <Star size={22} strokeWidth={2} fill={recipe.favorite ? 'currentColor' : 'none'} />,
            tone: 'neutral',
            onPress: () => void toggleFavorite(recipe),
          },
          {
            key: 'delete',
            label: '삭제',
            icon: <Trash2 size={22} strokeWidth={2} />,
            tone: 'danger',
            onPress: () => setDeleteTargetId(recipe.id),
          },
        ]}
      >
        <RecipeCard
          recipe={recipe}
          onClick={() => {
            // 다른 카드가 열려 있을 때 이 카드를 탭하면 상세로 가지 않고 먼저 닫는다(iOS 관례).
            if (openId !== null && openId !== recipe.id) {
              setOpenId(null);
              return;
            }
            navigate(`/recipes/${recipe.id}`);
          }}
        />
      </SwipeRow>
    </li>
  );

  if (recipes === undefined) {
    return <TopBar title="뚜니레시피" />;
  }

  return (
    <>
      <TopBar title="뚜니레시피" />
      <div className="px-4">
        <div className="relative mb-4">
          <Search size={20} strokeWidth={2} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="레시피 이름이나 재료로 찾아보세요"
            aria-label="레시피 검색"
            className={cx(fieldClass, 'h-12 py-0 pl-11 pr-12 [&::-webkit-search-cancel-button]:appearance-none')}
          />
          {query && (
            <IconButton label="검색어 지우기" className="absolute right-1 top-1/2 -translate-y-1/2" onClick={() => setQuery('')}>
              <X size={20} strokeWidth={2} />
            </IconButton>
          )}
        </div>

        {recipes.length === 0 && (
          <EmptyState message="아직 저장한 레시피가 없어요. 첫 레시피를 저장해 보세요." actionLabel="레시피 저장하기" onAction={goNew} />
        )}
        {recipes.length > 0 && results.length === 0 && (
          <EmptyState message="찾는 레시피가 없어요." actionLabel="새 레시피 만들기" onAction={goNew} />
        )}
        {results.length > 0 && favorites.length === 0 && <ul className="flex flex-col gap-3 pb-20">{others.map(renderRow)}</ul>}
        {favorites.length > 0 && (
          <div className="flex flex-col gap-6 pb-20">
            <section>
              <h2 className="mb-2 text-body-strong text-body-soft">즐겨찾기</h2>
              <ul className="flex flex-col gap-3">{favorites.map(renderRow)}</ul>
            </section>
            {others.length > 0 && (
              <section>
                <h2 className="mb-2 text-body-strong text-body-soft">전체</h2>
                <ul className="flex flex-col gap-3">{others.map(renderRow)}</ul>
              </section>
            )}
          </div>
        )}
      </div>
      <Fab label="새 레시피 만들기" onClick={goNew} />
      <Dialog
        open={deleteTargetId !== null}
        title="이 레시피를 삭제할까요?"
        description="삭제하면 되돌릴 수 없어요."
        confirmLabel="삭제하기"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTargetId(null)}
      />
    </>
  );
}
