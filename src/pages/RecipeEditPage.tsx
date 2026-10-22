import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useRef, useState } from 'react';
import { useBlocker, useNavigate, useParams } from 'react-router';
import { IngredientInput } from '../components/IngredientInput';
import { PhotoPicker } from '../components/PhotoPicker';
import { StepEditor } from '../components/StepEditor';
import { Button } from '../components/ui/Button';
import { Dialog } from '../components/ui/Dialog';
import { EmptyState } from '../components/ui/EmptyState';
import { TextArea } from '../components/ui/TextArea';
import { TextField } from '../components/ui/TextField';
import { useToast } from '../components/ui/toastContext';
import { TopBar } from '../components/ui/TopBar';
import { recipeRepo, type PhotoChange } from '../db/recipeRepo';
import { useBlobUrl, usePhotoUrl } from '../hooks/usePhotoUrl';
import { isQuotaError } from '../lib/errors';
import { hasInAppHistory } from '../lib/history';
import { makePhotoBlobs } from '../lib/image';
import { formatIngredients, parseIngredients } from '../lib/parseIngredients';
import { newStep, type StepItem } from '../lib/steps';
import { hasErrors, validateDraft, type DraftErrors } from '../lib/validateDraft';
import type { Recipe, RecipeDraft } from '../types';

export function RecipeEditPage() {
  const { id } = useParams();
  const recipe = useLiveQuery(async () => (id ? ((await recipeRepo.get(id)) ?? null) : null), [id]);

  if (id && recipe === undefined) {
    return <TopBar back />;
  }
  if (id && recipe === null) {
    return <NotFound />;
  }
  // 편집 중에는 DB 변경으로 폼이 다시 채워지지 않도록 key로 한 번만 초기화한다.
  return <RecipeForm key={id ?? 'new'} initial={recipe ?? undefined} />;
}

function NotFound() {
  const navigate = useNavigate();
  return (
    <>
      <TopBar back />
      <EmptyState message="레시피를 찾을 수 없어요." actionLabel="목록으로 가기" onAction={() => navigate('/', { replace: true })} />
    </>
  );
}

function RecipeForm({ initial }: { initial?: Recipe }) {
  const navigate = useNavigate();
  const toast = useToast();
  const knownNames = useLiveQuery(() => recipeRepo.listIngredientNames(), []) ?? [];

  const [name, setName] = useState(initial?.name ?? '');
  const [ingredientText, setIngredientText] = useState(initial ? formatIngredients(initial.ingredients) : '');
  const [steps, setSteps] = useState<StepItem[]>(() =>
    initial && initial.steps.length > 0 ? initial.steps.map((s) => newStep(s)) : [newStep()],
  );
  const [memo, setMemo] = useState(initial?.memo ?? '');
  const [photo, setPhoto] = useState<PhotoChange>({ kind: 'keep' });
  const [photoBusy, setPhotoBusy] = useState(false);
  const [errors, setErrors] = useState<DraftErrors>({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const leavingRef = useRef(false);

  const existingUrl = usePhotoUrl(photo.kind === 'keep' ? initial?.photoId : undefined, 'full');
  const replacedUrl = useBlobUrl(photo.kind === 'replace' ? photo.full : undefined);
  const previewUrl = photo.kind === 'replace' ? replacedUrl : existingUrl;

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty && !leavingRef.current && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (!dirty) {
      return;
    }
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const onNameChange = (v: string) => {
    setName(v);
    setDirty(true);
    setErrors((prev) => (prev.name ? { ...prev, name: undefined } : prev));
  };

  const onIngredientsChange = (v: string) => {
    setIngredientText(v);
    setDirty(true);
    setErrors((prev) => (prev.ingredients ? { ...prev, ingredients: undefined } : prev));
  };

  const onStepsChange = (v: StepItem[]) => {
    setSteps(v);
    setDirty(true);
    setErrors((prev) => (prev.steps ? { ...prev, steps: undefined } : prev));
  };

  const onMemoChange = (v: string) => {
    setMemo(v);
    setDirty(true);
  };

  const pickPhoto = async (file: File) => {
    setPhotoBusy(true);
    try {
      const blobs = await makePhotoBlobs(file);
      setPhoto({ kind: 'replace', ...blobs });
      setDirty(true);
    } catch {
      toast('사진을 불러오지 못했어요. 다른 사진을 골라 주세요.');
    } finally {
      setPhotoBusy(false);
    }
  };

  const save = async () => {
    const draft: RecipeDraft = {
      name,
      ingredients: parseIngredients(ingredientText),
      steps: steps.map((s) => s.text),
      memo,
    };
    const nextErrors = validateDraft(draft);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      return;
    }
    setSaving(true);
    try {
      const savedId = await recipeRepo.save({ id: initial?.id, draft, photo });
      leavingRef.current = true;
      setDirty(false);
      // 수정은 앱 안에서 들어온 히스토리가 있으면 되돌아가고, 그렇지 않으면 상세로 바꿔 들어간다(히스토리 중복 방지).
      if (initial && hasInAppHistory()) {
        navigate(-1);
      } else {
        navigate(`/recipes/${savedId}`, { replace: true });
      }
      toast('레시피를 저장했어요.');
      // 저장 성공 후에는 페이지가 이동으로 언마운트될 때까지 버튼을 계속 비활성 상태로 둔다(setSaving(false) 호출 안 함).
    } catch (error) {
      setSaving(false);
      if (isQuotaError(error)) {
        toast('저장 공간이 부족해요. 백업 후 오래된 사진을 정리해 주세요.');
        return;
      }
      toast('저장하지 못했어요. 잠시 후 다시 시도해 주세요.');
    }
  };

  return (
    <>
      <TopBar back title={initial ? '레시피 수정' : '새 레시피'} />
      <div className="flex flex-col gap-6 px-4 pb-32">
        <PhotoPicker
          previewUrl={previewUrl}
          busy={photoBusy}
          onPick={pickPhoto}
          onRemove={() => {
            setPhoto({ kind: 'remove' });
            setDirty(true);
          }}
        />
        <TextField label="이름" value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="토마토 달걀볶음" error={errors.name} />
        <IngredientInput value={ingredientText} onChange={onIngredientsChange} knownNames={knownNames} error={errors.ingredients} />
        <StepEditor steps={steps} onChange={onStepsChange} error={errors.steps} />
        <TextArea label="메모" rows={3} value={memo} onChange={(e) => onMemoChange(e.target.value)} placeholder="출처 링크나 팁을 적어 두세요" />
      </div>
      <div
        className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[480px] bg-canvas px-4 pt-3"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
      >
        <Button block onClick={save} disabled={saving || photoBusy}>
          저장하기
        </Button>
      </div>
      <Dialog
        open={blocker.state === 'blocked'}
        title="수정한 내용을 저장하지 않고 나갈까요?"
        confirmLabel="나가기"
        onConfirm={() => blocker.proceed?.()}
        onClose={() => blocker.reset?.()}
      />
    </>
  );
}
