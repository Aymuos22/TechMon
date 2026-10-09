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
  cursor: { file: true, plate: '#ffffff', ink: 'brand' },
  copilot: { file: true, plate: '#0d1117', ink: 'brand' },
  svelte: { file: true, plate: '#ffffff', ink: 'brand' },
  flask: { file: true, plate: '#ffffff', ink: 'brand' },
  graphql: { file: true, plate: '#ffffff', ink: 'brand' },
  prisma: { file: true, plate: '#ffffff', ink: 'brand' },
  vercel: { file: true, plate: '#ffffff', ink: 'brand' },
  ruby: { file: true, plate: '#ffffff', ink: 'brand' },
  rails: { file: true, plate: '#ffffff', ink: 'brand' },
  php: { file: true, plate: '#ffffff', ink: 'brand' },
  laravel: { file: true, plate: '#ffffff', ink: 'brand' },
  csharp: { file: true, plate: '#ffffff', ink: 'brand' },
  dotnet: { file: true, plate: '#ffffff', ink: 'brand' },
  kotlin: { file: true, plate: '#ffffff', ink: 'brand' },
  swift: { file: true, plate: '#ffffff', ink: 'brand' },
  elixir: { file: true, plate: '#ffffff', ink: 'brand' },
  phoenix: { file: true, plate: '#ffffff', ink: 'brand' },
  mysql: { file: true, plate: '#ffffff', ink: 'brand' },
  sqlite: { file: true, plate: '#ffffff', ink: 'brand' },
  supabase: { file: true, plate: '#ffffff', ink: 'brand' },
  firebase: { file: true, plate: '#ffffff', ink: 'brand' },
  cloudflare: { file: true, plate: '#ffffff', ink: 'brand' },
  nginx: { file: true, plate: '#ffffff', ink: 'brand' },
  prometheus: { file: true, plate: '#ffffff', ink: 'brand' },
  grafana: { file: true, plate: '#ffffff', ink: 'brand' },
  jenkins: { file: true, plate: '#ffffff', ink: 'brand' },
  github_actions: { file: true, plate: '#ffffff', ink: 'brand' },
  tailwind: { file: true, plate: '#ffffff', ink: 'brand' },
  wordpress: { file: true, plate: '#ffffff', ink: 'brand' },
  bun: { file: true, plate: '#1f1611', ink: 'brand' },
  deno: { file: true, plate: '#ffffff', ink: 'brand' },
  nestjs: { file: true, plate: '#ffffff', ink: 'brand' },
  nuxt: { file: true, plate: '#ffffff', ink: 'brand' },
  astro: { file: true, plate: '#ffffff', ink: 'brand' },
  sveltekit: { file: true, plate: '#ffffff', ink: 'brand' },
  pulumi: { file: true, plate: '#ffffff', ink: 'brand' },
  opentelemetry: { file: true, plate: '#ffffff', ink: 'brand' },
  vite: { file: true, plate: '#ffffff', ink: 'brand' },
  webpack: { file: true, plate: '#ffffff', ink: 'brand' },
  rollup: { file: true, plate: '#ffffff', ink: 'brand' },
  esbuild: { file: true, plate: '#ffffff', ink: 'brand' },
  playwright: { file: true, plate: '#ffffff', ink: 'brand' },
  cypress: { file: true, plate: '#ffffff', ink: 'brand' },
  storybook: { file: true, plate: '#ffffff', ink: 'brand' },
  electron: { file: true, plate: '#ffffff', ink: 'brand' },
  react_native: { file: true, plate: '#ffffff', ink: 'brand' },
  flutter: { file: true, plate: '#ffffff', ink: 'brand' },
  dart: { file: true, plate: '#ffffff', ink: 'brand' },
  scala: { file: true, plate: '#ffffff', ink: 'brand' },
  hadoop: { file: true, plate: '#ffffff', ink: 'brand' },
  spark: { file: true, plate: '#ffffff', ink: 'brand' },
  snowflake: { file: true, plate: '#ffffff', ink: 'brand' },
  databricks: { file: true, plate: '#ffffff', ink: 'brand' },
  airflow: { file: true, plate: '#ffffff', ink: 'brand' },
  dbt: { file: true, plate: '#ffffff', ink: 'brand' },
  elasticsearch: { file: true, plate: '#ffffff', ink: 'brand' },
  clickhouse: { file: true, plate: '#ffffff', ink: 'brand' },
  cassandra: { file: true, plate: '#ffffff', ink: 'brand' },
  dynamodb: { file: true, plate: '#ffffff', ink: 'brand' },
  cockroachdb: { file: true, plate: '#ffffff', ink: 'brand' },
  ansible: { file: true, plate: '#ffffff', ink: 'brand' },
  helm: { file: true, plate: '#ffffff', ink: 'brand' },
  argocd: { file: true, plate: '#ffffff', ink: 'brand' },
  gitlab_ci: { file: true, plate: '#ffffff', ink: 'brand' },
  circleci: { file: true, plate: '#ffffff', ink: 'brand' },
  datadog: { file: true, plate: '#ffffff', ink: 'brand' },
  sentry: { file: true, plate: '#ffffff', ink: 'brand' },
  vault: { file: true, plate: '#ffffff', ink: 'brand' },
  consul: { file: true, plate: '#ffffff', ink: 'brand' },
  istio: { file: true, plate: '#ffffff', ink: 'brand' },
  envoy: { file: true, plate: '#ffffff', ink: 'brand' },
  grpc: { file: true, plate: '#ffffff', ink: 'brand' },
  trpc: { file: true, plate: '#ffffff', ink: 'brand' },
  apollo: { file: true, plate: '#ffffff', ink: 'brand' },
  hasura: { file: true, plate: '#ffffff', ink: 'brand' },
  huggingface: { file: true, plate: '#ffffff', ink: 'brand' },
  scikit_learn: { file: true, plate: '#ffffff', ink: 'brand' },
  pandas: { file: true, plate: '#ffffff', ink: 'brand' },
  numpy: { file: true, plate: '#ffffff', ink: 'brand' },
  jupyter: { file: true, plate: '#ffffff', ink: 'brand' },
  mlflow: { file: true, plate: '#ffffff', ink: 'brand' },
  ray: { file: true, plate: '#ffffff', ink: 'brand' },
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
