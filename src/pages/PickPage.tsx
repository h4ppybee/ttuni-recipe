import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { PickResultCard } from '../components/PickResultCard';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { EmptyState } from '../components/ui/EmptyState';
import { TextField } from '../components/ui/TextField';
import { TopBar } from '../components/ui/TopBar';
import { recipeRepo } from '../db/recipeRepo';
import { pickRandom } from '../lib/pickRandom';
import { getPickSelection, setPickSelection } from '../lib/prefs';
import type { Recipe } from '../types';

type PickState = { kind: 'idle' } | { kind: 'none' } | { kind: 'picked'; recipe: Recipe; seq: number };

export function PickPage() {
  const navigate = useNavigate();
  const names = useLiveQuery(() => recipeRepo.listIngredientNames(), []);
  const [selected, setSelected] = useState<string[]>(getPickSelection);
  const [filter, setFilter] = useState('');
  const [state, setState] = useState<PickState>({ kind: 'idle' });
  const seqRef = useRef(0);

  // 이제 어떤 레시피에도 없는 재료는 화면에 표시하거나 뽑기에 쓰지 않는다.
  const effective = useMemo(() => (names ? selected.filter((n) => names.includes(n)) : selected), [names, selected]);

  useEffect(() => {
    setPickSelection(effective);
  }, [effective]);

  const visibleNames = useMemo(() => {
    const q = filter.trim();
    return (names ?? []).filter((n) => q === '' || n.includes(q));
  }, [names, filter]);

  if (names === undefined) {
    return <TopBar title="오늘 저녁 뭐?" />;
  }
  if (names.length === 0) {
    return (
      <>
        <TopBar title="오늘 저녁 뭐?" />
        <EmptyState message="먼저 레시피를 저장해 주세요." actionLabel="새 레시피 만들기" onAction={() => navigate('/recipes/new')} />
      </>
    );
  }

  const toggle = (name: string) => {
    setSelected(effective.includes(name) ? effective.filter((n) => n !== name) : [...effective, name]);
    setState({ kind: 'idle' });
  };

  const draw = async (excludeId?: string) => {
    const candidates = await recipeRepo.findCandidates(effective);
    const recipe = pickRandom(candidates, excludeId);
    seqRef.current += 1;
    setState(recipe ? { kind: 'picked', recipe, seq: seqRef.current } : { kind: 'none' });
  };

  return (
    <>
      <TopBar title="오늘 저녁 뭐?" />
      <div className="flex flex-col gap-4 px-4">
        <p className="text-body-md text-body-soft">가지고 있는 재료를 골라 주세요.</p>
        <TextField value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="재료 찾기" aria-label="재료 찾기" />
        <div className="flex flex-wrap gap-2">
          {visibleNames.map((name) => (
            <Chip key={name} label={name} selected={effective.includes(name)} onClick={() => toggle(name)} />
          ))}
        </div>
        {effective.length > 0 && (
          <Button
            variant="text"
            className="self-start px-0"
            onClick={() => {
              setSelected([]);
              setState({ kind: 'idle' });
            }}
          >
            선택 해제
          </Button>
        )}
        <Button block disabled={effective.length === 0} onClick={() => draw()}>
          오늘 저녁 뭐?
        </Button>
        {effective.length === 0 && <p className="text-center text-caption text-muted">재료를 1개 이상 골라 주세요.</p>}
        {state.kind === 'none' && (
          <p className="text-center text-body-md text-body-soft">
            고른 재료로 만들 수 있는 레시피가 없어요. 다른 재료도 골라 보세요.
          </p>
        )}
        {state.kind === 'picked' && (
          <PickResultCard
            key={state.seq}
            recipe={state.recipe}
            selected={effective}
            onRetry={() => draw(state.recipe.id)}
            onOpen={() => navigate(`/recipes/${state.recipe.id}`)}
          />
        )}
      </div>
    </>
  );
}
