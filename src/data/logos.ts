/**
 * Local brand logos under /public/logos/{id}.svg
 * Multi-color marks keep their own colors; monochrome marks use brand plates.
 */

export type LogoInk = 'brand' | 'light' | 'dark';

export interface LogoMeta {
  /** Has a file under /public/logos */
  file: boolean;
  /** Background plate behind the mark */
  plate: string;
  /**
   * brand = multi-color SVG as-is
   * light = force white glyph (dark plate)
   * dark = force black glyph (bright plate)
   */
  ink: LogoInk;
}

const LOGO_META: Record<string, LogoMeta> = {
  // Multi-color / custom marks
  python: { file: true, plate: '#1a1a2e', ink: 'brand' },
  html: { file: true, plate: '#fff5f0', ink: 'brand' },
  css: { file: true, plate: '#f0f7ff', ink: 'brand' },
  javascript: { file: true, plate: '#323330', ink: 'brand' },
  typescript: { file: true, plate: '#1e3a5f', ink: 'brand' },
  langgraph: { file: true, plate: '#0f1f1f', ink: 'brand' },
  cobol: { file: true, plate: '#003d6b', ink: 'brand' },
  mainframe: { file: true, plate: '#0d2a3d', ink: 'brand' },

  // Monochrome Simple Icons — brand fill on plate
  java: { file: true, plate: '#3d5a73', ink: 'brand' },
  react: { file: true, plate: '#20232a', ink: 'brand' },
  angular: { file: true, plate: '#ffffff', ink: 'brand' },
  vue: { file: true, plate: '#ffffff', ink: 'brand' },
  node: { file: true, plate: '#ffffff', ink: 'brand' },
  nextjs: { file: true, plate: '#ffffff', ink: 'brand' },
  express: { file: true, plate: '#ffffff', ink: 'brand' },
  spring_boot: { file: true, plate: '#ffffff', ink: 'brand' },
  fastapi: { file: true, plate: '#ffffff', ink: 'brand' },
  django: { file: true, plate: '#f4f4f4', ink: 'brand' },
  postgresql: { file: true, plate: '#ffffff', ink: 'brand' },
  mongodb: { file: true, plate: '#ffffff', ink: 'brand' },
  redis: { file: true, plate: '#ffffff', ink: 'brand' },
  aws: { file: true, plate: '#ffffff', ink: 'brand' },
  azure: { file: true, plate: '#ffffff', ink: 'brand' },
  gcp: { file: true, plate: '#ffffff', ink: 'brand' },
  docker: { file: true, plate: '#ffffff', ink: 'brand' },
  kubernetes: { file: true, plate: '#ffffff', ink: 'brand' },
  terraform: { file: true, plate: '#ffffff', ink: 'brand' },
  kafka: { file: true, plate: '#ffffff', ink: 'brand' },
  rabbitmq: { file: true, plate: '#ffffff', ink: 'brand' },
  pytorch: { file: true, plate: '#ffffff', ink: 'brand' },
  tensorflow: { file: true, plate: '#ffffff', ink: 'brand' },
  langchain: { file: true, plate: '#f4f4f4', ink: 'brand' },
  go: { file: true, plate: '#ffffff', ink: 'brand' },
  rust: { file: true, plate: '#f4f4f4', ink: 'brand' },
  cpp: { file: true, plate: '#ffffff', ink: 'brand' },
  salesforce: { file: true, plate: '#ffffff', ink: 'brand' },
  claude: { file: true, plate: '#1a1510', ink: 'brand' },
  openai_codex: { file: true, plate: '#ffffff', ink: 'brand' },
};

const DEFAULT_META: LogoMeta = { file: false, plate: '#ffffff', ink: 'brand' };

export function getLogoMeta(technologyId: string, fallbackColor?: string): LogoMeta {
  const meta = LOGO_META[technologyId];
  if (meta) return meta;
  return {
    ...DEFAULT_META,
    plate: fallbackColor ?? '#555555',
  };
}

export function hasTechLogo(technologyId: string): boolean {
  return LOGO_META[technologyId]?.file === true;
}

export function getTechLogoUrl(technologyId: string): string | null {
  if (!hasTechLogo(technologyId)) return null;
  // Cache-bust so updated SVGs show after reload
  return `/logos/${technologyId}.svg?v=4`;
}

export function techLogoNeedsLightPlate(technologyId: string): boolean {
  const plate = getLogoMeta(technologyId).plate.toLowerCase();
  return plate === '#ffffff' || plate === '#f4f4f4' || plate.startsWith('#f');
}

export function techLogoNeedsDarkPlate(technologyId: string): boolean {
  return !techLogoNeedsLightPlate(technologyId);
}

export function getTechLogoPlate(technologyId: string, brandColor?: string): string {
  return getLogoMeta(technologyId, brandColor).plate;
}
