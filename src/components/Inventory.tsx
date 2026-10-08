import { useMemo, useState } from 'react';
import type { Inventory } from '../types/item';
import type { ItemType } from '../types/item';
import { getItem } from '../data/items';

interface Props {
  inventory: Inventory;
  onUse: (itemId: string) => void;
  onDiscard: (itemId: string) => void;
  onClose: () => void;
}

const CATEGORIES: Array<ItemType | 'all'> = [
  'all',
  'healing',
  'upgrade',
  'scanner',
  'battle',
  'quest',
  'key',
];

export function Inventory({ inventory, onUse, onDiscard, onClose }: Props) {
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>('all');
  const [selected, setSelected] = useState<string | null>(inventory[0]?.itemId ?? null);

  const filtered = useMemo(() => {
    return inventory.filter((slot) => {
      const item = getItem(slot.itemId);
      return cat === 'all' || item.type === cat;
    });
  }, [inventory, cat]);

  const selectedItem = selected ? getItem(selected) : null;

  return (
    <div className="overlay-panel inventory-panel">
      <header>
        <h2>Inventory</h2>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </header>
      <div className="category-tabs">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            className={cat === c ? 'active' : ''}
            onClick={() => setCat(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="split-view">
        <ul className="item-list">
          {filtered.length === 0 && <li className="empty">No items</li>}
          {filtered.map((slot) => {
            const item = getItem(slot.itemId);
            return (
              <li key={slot.itemId}>
                <button
                  type="button"
                  className={selected === slot.itemId ? 'selected' : ''}
                  onClick={() => setSelected(slot.itemId)}
                >
                  {item.name} ×{slot.quantity}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="item-detail">
          {selectedItem ? (
            <>
              <h3>{selectedItem.name}</h3>
              <p>{selectedItem.description}</p>
              <p className="meta">Type: {selectedItem.type}</p>
              <div className="row-actions">
                {selectedItem.usableInField && (
                  <button type="button" onClick={() => onUse(selectedItem.id)}>
                    Use
                  </button>
                )}
                <button type="button" onClick={() => onDiscard(selectedItem.id)}>
                  Discard
                </button>
              </div>
            </>
          ) : (
            <p>Select an item</p>
          )}
        </div>
      </div>
    </div>
  );
}
