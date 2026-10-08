/** Local Simple Icons brand SVGs under /public/logos */
const LOGO_IDS = new Set([
  'python',
  'java',
  'javascript',
  'typescript',
  'cpp',
  'go',
  'rust',
  'html',
  'css',
  'react',
  'angular',
  'vue',
  'nextjs',
  'node',
  'express',
  'spring_boot',
  'fastapi',
  'django',
  'postgresql',
  'mongodb',
  'redis',
  'aws',
  'azure',
  'gcp',
  'docker',
  'kubernetes',
  'terraform',
  'kafka',
  'rabbitmq',
  'pytorch',
  'tensorflow',
  'langchain',
  'langgraph',
]);

/** Near-black logos — need a light plate */
const DARK_LOGOS = new Set(['nextjs', 'express', 'kafka', 'aws', 'django', 'langchain', 'langgraph']);

/**
 * Light / bright logos that vanish on white battle plates
 * (JS yellow is the main starter culprit).
 */
const BRIGHT_LOGOS = new Set(['javascript']);

/** Preferred solid plate colors (brand-accurate where it matters) */
const PLATE_COLORS: Record<string, string> = {
  javascript: '#323330',
  python: '#ffffff',
  java: '#ffffff',
  typescript: '#ffffff',
  react: '#20232a',
  nextjs: '#ffffff',
  express: '#ffffff',
  kafka: '#ffffff',
  aws: '#ffffff',
  django: '#ffffff',
};

export function hasTechLogo(technologyId: string): boolean {
  return LOGO_IDS.has(technologyId);
}

export function getTechLogoUrl(technologyId: string): string | null {
  if (!hasTechLogo(technologyId)) return null;
  return `/logos/${technologyId}.svg`;
}

export function techLogoNeedsLightPlate(technologyId: string): boolean {
  return DARK_LOGOS.has(technologyId);
}

export function techLogoNeedsDarkPlate(technologyId: string): boolean {
  return BRIGHT_LOGOS.has(technologyId);
}

/** Background plate behind the SVG so the mark stays readable */
export function getTechLogoPlate(technologyId: string, _brandColor?: string): string {
  if (PLATE_COLORS[technologyId]) return PLATE_COLORS[technologyId];
  if (DARK_LOGOS.has(technologyId)) return '#f4f4f4';
  if (BRIGHT_LOGOS.has(technologyId)) return '#1a1a1a';
  return '#ffffff';
}
