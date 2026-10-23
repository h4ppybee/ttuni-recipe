import { groupIngredients } from '../lib/parseIngredients';
import type { Ingredient } from '../types';
import { IngredientChip } from './IngredientChip';

interface IngredientGroupsProps {
  items: Ingredient[];
}

export function IngredientGroups({ items }: IngredientGroupsProps) {
  return (
    <div className="flex flex-col gap-4">
      {groupIngredients(items).map(({ group, items: groupItems }) => (
        <div key={group || '__none__'}>
          {group && <h3 className="mb-2 text-body-strong text-body-soft">{group}</h3>}
          <div className="flex flex-wrap gap-2">
            {groupItems.map((item, index) => (
              <IngredientChip key={`${item.name}-${index}`} name={item.name} amount={item.amount} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
