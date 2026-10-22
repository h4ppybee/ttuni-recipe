export interface StepItem {
  key: string;
  text: string;
}

export function newStep(text = ''): StepItem {
  return { key: crypto.randomUUID(), text };
}
