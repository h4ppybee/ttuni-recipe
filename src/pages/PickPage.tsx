import { useLiveQuery } from 'dexie-react-hooks';
import { RotateCw } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { PickResultCard } from '../components/PickResultCard';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { EmptyState } from '../components/ui/EmptyState';
import { TextField } from '../components/ui/TextField';
import { useToast } from '../components/ui/toastContext';
import { TopBar } from '../components/ui/TopBar';
import { usePullToReset } from '../hooks/usePullToReset';
import { recipeRepo } from '../db/recipeRepo';
import { pickRandom } from '../lib/pickRandom';
import { getPickSelection, setPickSelection } from '../lib/prefs';
import type { Recipe } from '../types';

type PickState = { kind: 'idle' } | { kind: 'none' } | { kind: 'picked'; recipe: Recipe; seq: number };

export function PickPage() {
  const navigate = useNavigate();
  const toast = useToast();
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

  // 화면 맨 위에서 아래로 당겼다 놓으면 고른 재료와 결과를 초기화한다(선택 해제 버튼 대신).
  // 모션은 항상 보여주고, 실제로 지운 게 있을 때만 토스트를 띄운다.
  const hasSomethingToReset = effective.length > 0 || state.kind !== 'idle' || filter !== '';
  const { indicatorRef: pullIndicatorRef, iconRef: pullIconRef } = usePullToReset(() => {
    setSelected([]);
    setFilter('');
    setState({ kind: 'idle' });
    if (hasSomethingToReset) {
      toast('선택을 초기화했어요.');
    }
  }, true);

  const visibleNames = useMemo(() => {
    const q = filter.trim();
    return (names ?? []).filter((n) => q === '' || n.includes(q));
  }, [names, filter]);

  if (names === undefined) {
    return <TopBar title="오저뭐?" />;
  }
  if (names.length === 0) {
    return (
      <>
        <TopBar title="오저뭐?" />
        <EmptyState message="먼저 레시피를 저장해 주세요." actionLabel="새 레시피 만들기" onAction={() => navigate('/recipes/new')} />
      </>
    );
  }

  const toggle = (name: string) => {
    setSelected(effective.includes(name) ? effective.filter((n) => n !== name) : [...effective, name]);
    setState({ kind: 'idle' });
  };

  const draw = async (excludeId?: string) => {
    let candidates: Recipe[];
    try {
      candidates = await recipeRepo.findCandidates(effective);
    } catch {
      toast('레시피를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
      return;
    }
    const recipe = pickRandom(candidates, excludeId);
    seqRef.current += 1;
    setState(recipe ? { kind: 'picked', recipe, seq: seqRef.current } : { kind: 'none' });
  };

  return (
    <>
      <TopBar title="오저뭐?" />
      <div
        ref={pullIndicatorRef}
        aria-hidden
        className="flex items-center justify-center overflow-hidden text-muted"
        style={{ height: 0, opacity: 0 }}
      >
        <span ref={pullIconRef} className="inline-flex">
          <RotateCw size={22} strokeWidth={2} />
        </span>
      </div>
      <div className="flex flex-col gap-4 px-4">
        <p className="text-body-md text-body-soft">가지고 있는 재료를 골라 주세요.</p>
        <TextField value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="재료 찾기" aria-label="재료 찾기" />
        <div className="flex flex-wrap gap-2">
          {visibleNames.map((name) => (
            <Chip key={name} label={name} selected={effective.includes(name)} onClick={() => toggle(name)} />
          ))}
        </div>
        <Button block disabled={effective.length === 0} onClick={() => draw()}>
          메뉴 추천 뽑기
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
