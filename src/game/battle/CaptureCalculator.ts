import type { OwnedTechnology, Rarity } from '../../types/technology';
import { getTechnology } from '../../data/technologies';
import type { Inventory } from '../../types/item';

export type ScannerTier = 'none' | 'basic' | 'advanced' | 'quantum';

const RARITY_MOD: Record<Rarity, number> = {
  common: 1,
  uncommon: 0.75,
  rare: 0.45,
  legendary: 0.18,
};

const SCANNER_MOD: Record<ScannerTier, number> = {
  none: 0,
  basic: 1,
  advanced: 1.55,
  quantum: 2.25,
};

export function getScannerTier(inventory: Inventory): ScannerTier {
  if (inventory.some((i) => i.itemId === 'quantum_scanner' && i.quantity > 0)) {
    return 'quantum';
  }
  if (inventory.some((i) => i.itemId === 'advanced_scanner' && i.quantity > 0)) {
    return 'advanced';
  }
  if (inventory.some((i) => i.itemId === 'tech_scanner' && i.quantity > 0)) {
    return 'basic';
  }
  return 'none';
}

/**
 * Deterministic-feeling capture chance (0–1) influenced by HP, rarity,
 * scanner quality, and whether Analyze was used.
 */
export function calculateCaptureChance(
  enemy: OwnedTechnology,
  analyzed: boolean,
  scannerTier: ScannerTier,
): number {
  if (scannerTier === 'none') return 0;

  const def = getTechnology(enemy.definitionId);
  const hpRatio = enemy.maxHp <= 0 ? 1 : enemy.currentHp / enemy.maxHp;
  // Lower HP → easier registration
  const hpFactor = 1 - hpRatio * 0.72;
  const base = 0.18 + 0.52 * hpFactor;
  const analyzedBonus = analyzed ? 1.28 : 1;
  const levelPenalty = Math.max(0.55, 1 - (enemy.level - 5) * 0.02);

  const chance =
    base * RARITY_MOD[def.rarity] * SCANNER_MOD[scannerTier] * analyzedBonus * levelPenalty;

  return Math.max(0.02, Math.min(0.92, chance));
}

export function rollCapture(
  enemy: OwnedTechnology,
  analyzed: boolean,
  scannerTier: ScannerTier,
): { success: boolean; chance: number } {
  const chance = calculateCaptureChance(enemy, analyzed, scannerTier);
  return { success: Math.random() < chance, chance };
}
