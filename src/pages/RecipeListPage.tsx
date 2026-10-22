import { useLiveQuery } from 'dexie-react-hooks';
import { Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { RecipeCard } from '../components/RecipeCard';
import { EmptyState } from '../components/ui/EmptyState';
import { Fab } from '../components/ui/Fab';
import { IconButton } from '../components/ui/IconButton';
import { fieldClass } from '../components/ui/TextField';
import { TopBar } from '../components/ui/TopBar';
import { recipeRepo } from '../db/recipeRepo';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { cx } from '../lib/cx';
import { searchRecipes } from '../lib/search';

export function RecipeListPage() {
  const navigate = useNavigate();
  const recipes = useLiveQuery(() => recipeRepo.listAll(), []);
  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query, 150);
  const results = useMemo(() => searchRecipes(recipes ?? [], debounced), [recipes, debounced]);
  const goNew = () => navigate('/recipes/new');

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
        {results.length > 0 && (
          <ul className="flex flex-col gap-3 pb-20">
            {results.map((recipe) => (
              <li key={recipe.id}>
                <RecipeCard recipe={recipe} onClick={() => navigate(`/recipes/${recipe.id}`)} />
              </li>
            ))}
          </ul>
        )}
      </div>
      <Fab label="새 레시피 만들기" onClick={goNew} />
    </>
  );
}
