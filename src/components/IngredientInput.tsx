import { useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { pieceAt, replacePieceName, suggestIngredientNames } from '../lib/ingredientCaret';
import { parseIngredients, parsePiece } from '../lib/parseIngredients';
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
  const suggestions = useMemo(
    () => suggestIngredientNames(knownNames, parsePiece(pieceAt(value, caret).piece).name),
    [knownNames, value, caret],
  );

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
        rows={3}
        value={value}
        placeholder="대파 1대, 양파 1개, 간장 200ml"
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
        <ul className="mt-2 divide-y divide-hairline">
          {parsed.map((item, index) => (
            <li key={`${item.name}-${index}`} className="flex justify-between gap-4 py-2">
              <span className="text-body-strong text-ink">{item.name}</span>
              <span className="text-body-md text-muted">{item.amount}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
