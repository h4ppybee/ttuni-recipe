interface IngredientChipProps {
  name: string;
  amount: string;
}

export function IngredientChip({ name, amount }: IngredientChipProps) {
  return (
    <span className="inline-flex max-w-full items-baseline gap-1 rounded-pill bg-surface-strong px-[14px] py-2 [overflow-wrap:anywhere]">
      <span className="text-body-strong text-ink">{name}</span>
      {amount && <span className="text-body-md text-body-soft">{amount}</span>}
    </span>
  );
}
