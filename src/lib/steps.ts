export interface StepItem {
  key: string;
  text: string;
}

export function newStep(text = ''): StepItem {
  return { key: crypto.randomUUID(), text };
}

export function insertStepAfter(steps: StepItem[], index: number): { steps: StepItem[]; inserted: StepItem } {
  const inserted = newStep();
  const next = [...steps];
  next.splice(index + 1, 0, inserted);
  return { steps: next, inserted };
}

export function isAddStepShortcut(e: { key: string; metaKey: boolean; ctrlKey: boolean; isComposing: boolean }): boolean {
  return e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !e.isComposing;
}
