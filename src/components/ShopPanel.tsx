import { SHOPS, getItem } from '../data/items';
import { useState } from 'react';

interface Props {
  shopId: string;
  money: number;
  onBuy: (itemId: string) => void;
  onClose: () => void;
}

export function ShopPanel({ shopId, money, onBuy, onClose }: Props) {
  const shop = SHOPS[shopId];
  const [selected, setSelected] = useState(0);
  if (!shop) return null;

  const items = shop.itemIds.map((id) => getItem(id));
  const current = items[selected];

  return (
    <div className="overlay-panel shop-panel firered-mart">
      <div className="mart-money">
        <span>MONEY</span>
        <strong>₿{money.toLocaleString()}</strong>
      </div>

      <div className="mart-layout">
        <div className="mart-list-box">
          <ul className="item-list mart-items">
            {items.map((item, i) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={i === selected ? 'selected' : ''}
                  disabled={money < item.price}
                  onMouseEnter={() => setSelected(i)}
                  onFocus={() => setSelected(i)}
                  onClick={() => onBuy(item.id)}
                >
                  <span className="mart-cursor">{i === selected ? '▶' : ''}</span>
                  <span className="mart-name">{item.name}</span>
                  <strong>₿{item.price}</strong>
                </button>
              </li>
            ))}
            <li>
              <button type="button" className="mart-cancel" onClick={onClose}>
                <span className="mart-cursor" />
                <span className="mart-name">CANCEL</span>
              </button>
            </li>
          </ul>
        </div>

        <div className="mart-desc-box">
          {current ? (
            <>
              <h3>{current.name}</h3>
              <p>{current.description}</p>
              <p className="mart-hint">
                {money < current.price ? 'Not enough Credits.' : 'A to buy · B / CANCEL to leave'}
              </p>
            </>
          ) : (
            <p>Come again!</p>
          )}
        </div>
      </div>
    </div>
  );
}
