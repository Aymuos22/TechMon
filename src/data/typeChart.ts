import type { TechnologyType } from '../types/technology';

/** Rows = attacker type, columns = defender type. 2 = super, 0.5 = resist, 0 = immune-ish, 1 = normal */
const TYPE_ORDER: TechnologyType[] = [
  'frontend',
  'backend',
  'language',
  'database',
  'cloud',
  'devops',
  'ai',
  'messaging',
];

/**
 * Software-themed type chart:
 * Frontend beats Backend (UI drives API contract), resisted by Database (state is king)
 * Backend beats Database (query power), resisted by DevOps (ops owns deploy)
 * Database beats Messaging (source of truth), resisted by AI (unstructured data)
 * Cloud beats Frontend (CDN/edge), resisted by Language (vendor lock concerns)
 * DevOps beats Cloud (infra as code), resisted by Messaging (async chaos)
 * AI beats Language (automates code), resisted by Frontend (UX still human)
 * Messaging beats DevOps (event-driven scale), resisted by Backend (sync needs)
 * Language beats AI (foundational control), resisted by Cloud (runtime abstraction)
 */
const CHART: Record<TechnologyType, Partial<Record<TechnologyType, number>>> = {
  frontend: { backend: 2, database: 0.5, cloud: 0.5, ai: 2 },
  backend: { database: 2, devops: 0.5, frontend: 0.5, messaging: 2 },
  language: { ai: 2, cloud: 0.5, frontend: 2, devops: 0.5 },
  database: { messaging: 2, ai: 0.5, backend: 0.5, language: 2 },
  cloud: { frontend: 2, language: 0.5, devops: 0.5, database: 2 },
  devops: { cloud: 2, messaging: 0.5, backend: 2, ai: 0.5 },
  ai: { language: 2, frontend: 0.5, database: 2, messaging: 0.5 },
  messaging: { devops: 2, backend: 0.5, ai: 2, cloud: 0.5 },
};

export function getTypeEffectiveness(
  attackType: TechnologyType,
  defenderTypes: TechnologyType[],
): number {
  let multiplier = 1;
  for (const def of defenderTypes) {
    const value = CHART[attackType][def];
    if (value !== undefined) {
      multiplier *= value;
    }
  }
  return multiplier;
}

export function getEffectivenessLabel(multiplier: number): string {
  if (multiplier >= 2) return 'Super effective!';
  if (multiplier > 1) return 'Effective!';
  if (multiplier === 0) return 'No effect...';
  if (multiplier < 1) return 'Not very effective...';
  return '';
}

export function getWeaknesses(types: TechnologyType[]): TechnologyType[] {
  const weaknesses: TechnologyType[] = [];
  for (const atk of TYPE_ORDER) {
    if (getTypeEffectiveness(atk, types) >= 2) {
      weaknesses.push(atk);
    }
  }
  return weaknesses;
}

export { TYPE_ORDER };
