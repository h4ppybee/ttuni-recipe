import { useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { pieceAt, replacePieceName, suggestIngredientNames } from '../lib/ingredientCaret';
import { parseIngredients, parsePiece } from '../lib/parseIngredients';
import { IngredientGroups } from './IngredientGroups';
import { Chip } from './ui/Chip';
import { TextArea } from './ui/TextArea';

interface IngredientInputProps {
  value: string;
  onChange: (next: string) => void;
  knownNames: string[];
  error?: string;
}

export function IngredientInput({ value, onChange, knownNames, error }: IngredientInputProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [caret, setCaret] = useState(0);
  const parsed = useMemo(() => parseIngredients(value), [value]);
  const currentPiece = useMemo(() => pieceAt(value, caret).piece, [value, caret]);
  const suggestions = useMemo(() => {
    if (currentPiece.trimStart().startsWith('[')) {
      return [];
    }
    return suggestIngredientNames(knownNames, parsePiece(currentPiece).name);
  }, [knownNames, currentPiece]);

  const syncCaret = () => setCaret(ref.current?.selectionStart ?? value.length);

  const choose = (name: string) => {
    const next = replacePieceName(value, caret, name);
    // 칩 탭 후에도 iOS 키보드가 내려가지 않도록, 상태 반영을 동기적으로 끝내고
    // 같은 핸들러 안에서 바로 포커스를 되돌린다(requestAnimationFrame 사용 금지).
    flushSync(() => {
      onChange(next.text);
      setCaret(next.caret);
    });
    ref.current?.focus();
    ref.current?.setSelectionRange(next.caret, next.caret);
  };

  return (
    <div>
      {suggestions.length > 0 && (
        <div className="-mx-4 mb-2 flex gap-2 overflow-x-auto px-4">
          {suggestions.map((name) => (
            <Chip key={name} label={name} onClick={() => choose(name)} />
          ))}
        </div>
      )}
      <TextArea
        ref={ref}
        label="재료"
        rows={4}
        value={value}
        placeholder={'Enter로 줄을 바꿔 한 줄에 하나씩 적어 주세요\n대파 1대\n[양념장]\n간장 3큰술'}
        onChange={(e) => {
          onChange(e.target.value);
          setCaret(e.target.selectionStart);
        }}
        onSelect={syncCaret}
        onKeyUp={syncCaret}
        onClick={syncCaret}
        error={error}
      />
      {parsed.length > 0 && (
        <div className="mt-3">
          <IngredientGroups items={parsed} />
        </div>
      )}
    </div>
  );
}
