import { ArrowDown, ArrowUp, X } from 'lucide-react';
import { newStep, type StepItem } from '../lib/steps';
import { Button } from './ui/Button';
import { FieldError, FieldLabel } from './ui/TextField';
import { IconButton } from './ui/IconButton';
import { TextArea } from './ui/TextArea';

interface StepEditorProps {
  steps: StepItem[];
  onChange: (next: StepItem[]) => void;
  error?: string;
}

export function StepEditor({ steps, onChange, error }: StepEditorProps) {
  const update = (index: number, text: string) => onChange(steps.map((s, i) => (i === index ? { ...s, text } : s)));
  const remove = (index: number) => onChange(steps.filter((_, i) => i !== index));
  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= steps.length) {
      return;
    }
    const next = [...steps];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div>
      <FieldLabel>만드는 방법</FieldLabel>
      <ol className="flex flex-col gap-3">
        {steps.map((step, index) => (
          <li key={step.key} className="flex gap-2">
            <span className="mt-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-pill bg-primary-surface text-caption-strong text-primary-text">
              {index + 1}
            </span>
            <div className="flex-1">
              <TextArea
                rows={2}
                value={step.text}
                aria-label={`${index + 1}단계`}
                onChange={(e) => update(index, e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <IconButton label="위로 옮기기" disabled={index === 0} onClick={() => move(index, -1)}>
                <ArrowUp size={20} strokeWidth={2} />
              </IconButton>
              <IconButton label="아래로 옮기기" disabled={index === steps.length - 1} onClick={() => move(index, 1)}>
                <ArrowDown size={20} strokeWidth={2} />
              </IconButton>
              <IconButton label="단계 지우기" disabled={steps.length === 1} onClick={() => remove(index)}>
                <X size={20} strokeWidth={2} />
              </IconButton>
            </div>
          </li>
        ))}
      </ol>
      <FieldError message={error} />
      <Button variant="secondary" block className="mt-3" onClick={() => onChange([...steps, newStep()])}>
        단계 추가하기
      </Button>
    </div>
  );
}
