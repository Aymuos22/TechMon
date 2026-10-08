import type { QuestDefinition } from '../types/quest';

export const quests: QuestDefinition[] = [
  {
    id: 'missing_api',
    name: 'The Missing API',
    description: 'An API has stopped responding. Inspect logs, identify the endpoint, fix config, and restart.',
    startDialogueId: 'quest_missing_api',
    steps: [
      { id: 'inspect_logs', description: 'Inspect the error logs on Pipeline Route', kind: 'inspect', targetId: 'route_logs' },
      { id: 'identify_endpoint', description: 'Identify the broken endpoint', kind: 'quiz', quizId: 'api_endpoint' },
      { id: 'fix_config', description: 'Fix the configuration', kind: 'quiz', quizId: 'api_config' },
      { id: 'restart_service', description: 'Restart the service at Code Center', kind: 'talk', targetId: 'nurse_byte' },
    ],
    reward: {
      xp: 80,
      money: 500,
      items: [{ itemId: 'api_key', quantity: 1 }, { itemId: 'debug_patch', quantity: 3 }],
    },
  },
  {
    id: 'database_migration',
    name: 'Database Migration',
    description: 'A migration failed in Stackhaven\'s Database District. Solve the SQL challenges.',
    startDialogueId: 'db_admin',
    steps: [
      { id: 'sql_select', description: 'Answer the SELECT challenge', kind: 'quiz', quizId: 'sql_select' },
      { id: 'sql_join', description: 'Answer the JOIN challenge', kind: 'quiz', quizId: 'sql_join' },
      { id: 'sql_migrate', description: 'Apply the migration fix', kind: 'quiz', quizId: 'sql_migrate' },
    ],
    reward: {
      xp: 120,
      money: 800,
      items: [{ itemId: 'refactor_token', quantity: 1 }],
    },
  },
  {
    id: 'production_outage',
    name: 'Production Outage',
    description: 'Stackhaven is down. Identify the root cause from system signals.',
    startDialogueId: 'quest_outage',
    steps: [
      { id: 'check_signals', description: 'Diagnose the outage root cause', kind: 'quiz', quizId: 'outage_cause' },
      { id: 'mitigate', description: 'Apply the mitigation', kind: 'quiz', quizId: 'outage_fix' },
    ],
    reward: {
      xp: 150,
      money: 1000,
      items: [{ itemId: 'cloud_credit', quantity: 2 }],
    },
  },
  {
    id: 'bug_hunter',
    name: 'Bug Hunter',
    description: 'Find 3 hidden bugs throughout the world.',
    startDialogueId: 'ai_researcher',
    steps: [
      { id: 'bug_1', description: 'Find bug #1 in Byteburg', kind: 'flag', targetId: 'bug_byteburg' },
      { id: 'bug_2', description: 'Find bug #2 on Pipeline Route', kind: 'flag', targetId: 'bug_route' },
      { id: 'bug_3', description: 'Find bug #3 in Stackhaven', kind: 'flag', targetId: 'bug_stackhaven' },
    ],
    reward: {
      xp: 100,
      money: 600,
      items: [{ itemId: 'architecture_token', quantity: 1 }],
    },
  },
];

export const questById: Record<string, QuestDefinition> = Object.fromEntries(
  quests.map((q) => [q.id, q]),
);

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const quizzes: Record<string, QuizQuestion> = {
  api_endpoint: {
    id: 'api_endpoint',
    question: 'Logs show 404 on which path?',
    options: ['/health', '/api/v2/checkout', '/static/app.js', '/admin'],
    correctIndex: 1,
    explanation: 'Checkout moved to /api/v2/checkout but clients still call v1.',
  },
  api_config: {
    id: 'api_config',
    question: 'What config fix restores the endpoint?',
    options: ['Disable TLS', 'Add reverse-proxy rewrite v1→v2', 'Drop the database', 'Restart DNS only'],
    correctIndex: 1,
    explanation: 'A rewrite rule bridges old clients to the new path.',
  },
  sql_select: {
    id: 'sql_select',
    question: 'Which query returns unique user emails?',
    options: ['SELECT email FROM users', 'SELECT DISTINCT email FROM users', 'SELECT UNIQUE email', 'GET emails'],
    correctIndex: 1,
    explanation: 'DISTINCT removes duplicates.',
  },
  sql_join: {
    id: 'sql_join',
    question: 'Join orders to users on user_id with?',
    options: [
      'FROM orders, users',
      'JOIN users ON orders.user_id = users.id',
      'MERGE users',
      'LINK orders.users',
    ],
    correctIndex: 1,
    explanation: 'Explicit JOIN ... ON is the clear approach.',
  },
  sql_migrate: {
    id: 'sql_migrate',
    question: 'A NOT NULL migration fails on existing NULLs. Fix?',
    options: [
      'Force NOT NULL anyway',
      'Backfill NULLs then apply NOT NULL',
      'Delete the table',
      'Ignore the error',
    ],
    correctIndex: 1,
    explanation: 'Backfill data before enforcing NOT NULL.',
  },
  outage_cause: {
    id: 'outage_cause',
    question: 'CPU normal, memory climbing, DB connections exhausted. Cause?',
    options: ['DDoS on CDN', 'Memory leak exhausting DB pool', 'DNS failure', 'CSS bug'],
    correctIndex: 1,
    explanation: 'Leaked connections starve the pool while memory grows.',
  },
  outage_fix: {
    id: 'outage_fix',
    question: 'Best immediate mitigation?',
    options: [
      'Buy more domains',
      'Restart service + cap pool + deploy leak fix',
      'Disable monitoring',
      'Rewrite in another language tonight',
    ],
    correctIndex: 1,
    explanation: 'Restore capacity, then ship the real fix.',
  },
};

export const gymPuzzles: Record<
  string,
  { title: string; questions: QuizQuestion[]; battleDialogueId: string; winDialogueId: string }
> = {
  frontend: {
    title: 'Frontend Gym Challenges',
    battleDialogueId: 'maya_battle',
    winDialogueId: 'maya_win',
    questions: [
      {
        id: 'gym_html',
        question: 'HTML: Which attribute improves image accessibility?',
        options: ['src', 'alt', 'href', 'rel'],
        correctIndex: 1,
        explanation: 'alt describes the image for assistive tech.',
      },
      {
        id: 'gym_css',
        question: 'CSS: Flexbox main-axis alignment uses?',
        options: ['align-items', 'justify-content', 'float', 'z-index'],
        correctIndex: 1,
        explanation: 'justify-content aligns along the main axis.',
      },
      {
        id: 'gym_js',
        question: 'JS: typeof null === ?',
        options: ['"null"', '"object"', '"undefined"', '"number"'],
        correctIndex: 1,
        explanation: 'A historic quirk: typeof null is "object".',
      },
      {
        id: 'gym_react',
        question: 'React: Keys help reconcile lists by providing?',
        options: ['CSS classes', 'Stable identity', 'Network IDs', 'Binary heaps'],
        correctIndex: 1,
        explanation: 'Keys give list items stable identity.',
      },
    ],
  },
  production: {
    title: 'Production Gym Challenges',
    battleDialogueId: 'arjun_battle',
    winDialogueId: 'arjun_win',
    questions: [
      {
        id: 'gym_be',
        question: 'Backend: Idempotent HTTP method?',
        options: ['POST', 'PUT', 'CONNECT', 'PATCH always'],
        correctIndex: 1,
        explanation: 'PUT is idempotent by definition.',
      },
      {
        id: 'gym_db',
        question: 'Database: ACID "I" stands for?',
        options: ['Index', 'Isolation', 'Instance', 'Integrity only'],
        correctIndex: 1,
        explanation: 'Isolation is the I in ACID.',
      },
      {
        id: 'gym_docker',
        question: 'Docker: Images are built from?',
        options: ['Pods', 'Layers in a Dockerfile', 'Helm only', 'VMs'],
        correctIndex: 1,
        explanation: 'Docker images are layered filesystems.',
      },
      {
        id: 'gym_k8s',
        question: 'Kubernetes: A Service primarily provides?',
        options: ['GPU drivers', 'Stable networking to pods', 'CSS themes', 'Source control'],
        correctIndex: 1,
        explanation: 'Services expose a stable network endpoint.',
      },
    ],
  },
  devops: {
    title: 'DevOps Gym Challenges',
    battleDialogueId: 'helm_battle',
    winDialogueId: 'helm_win',
    questions: [
      {
        id: 'gym_ci',
        question: 'CI/CD: A canary deploy primarily?',
        options: ['Deletes prod', 'Rolls out to a small % first', 'Only runs locally', 'Renames branches'],
        correctIndex: 1,
        explanation: 'Canaries expose changes to a subset before full rollout.',
      },
      {
        id: 'gym_helm',
        question: 'Helm packages Kubernetes apps as?',
        options: ['JAR files', 'Charts', 'CSS modules', 'Punch cards'],
        correctIndex: 1,
        explanation: 'Helm charts package K8s manifests and values.',
      },
      {
        id: 'gym_tf',
        question: 'Terraform state mainly tracks?',
        options: ['CSS vars', 'Managed infrastructure resources', 'Git blame', 'Sprint points'],
        correctIndex: 1,
        explanation: 'State maps config to real cloud resources.',
      },
      {
        id: 'gym_sre',
        question: 'SRE: An SLO is typically?',
        options: ['A snack', 'A target reliability level', 'A CSS unit', 'A layoff memo'],
        correctIndex: 1,
        explanation: 'Service Level Objectives set reliability targets.',
      },
    ],
  },
  legacy: {
    title: 'Legacy Gym Challenges',
    battleDialogueId: 'cobol_battle',
    winDialogueId: 'cobol_win',
    questions: [
      {
        id: 'gym_cobol_q',
        question: 'COBOL is historically used for?',
        options: ['WebGL shaders', 'Business/data processing', 'iOS widgets', 'npm scripts'],
        correctIndex: 1,
        explanation: 'COBOL powered business data processing for decades.',
      },
      {
        id: 'gym_mf',
        question: 'Mainframes often excel at?',
        options: ['Browser CSS', 'High-volume transaction processing', 'Meme apps', 'Font kerning'],
        correctIndex: 1,
        explanation: 'Mainframes handle massive transactional workloads.',
      },
      {
        id: 'gym_jcl',
        question: 'On IBM z/OS, batch jobs are often described with?',
        options: ['JSX', 'JCL', 'GraphQL only', 'Tailwind'],
        correctIndex: 1,
        explanation: 'Job Control Language (JCL) describes batch jobs.',
      },
      {
        id: 'gym_legacy_risk',
        question: 'A common legacy risk is?',
        options: ['Too many GPUs', 'Knowledge loss / undocumented systems', 'Excess free time', 'Infinite RAM'],
        correctIndex: 1,
        explanation: 'Undocumented tribal knowledge is a classic legacy risk.',
      },
    ],
  },
  service: {
    title: 'Billing Gym Challenges',
    battleDialogueId: 'billing_battle',
    winDialogueId: 'billing_win',
    questions: [
      {
        id: 'gym_util',
        question: 'In services firms, "utilization" usually means?',
        options: ['GPU %', 'Billable time vs available time', 'CSS coverage', 'Pod restarts'],
        correctIndex: 1,
        explanation: 'Utilization tracks billable vs available hours.',
      },
      {
        id: 'gym_bench',
        question: 'Being "on the bench" typically means?',
        options: ['Gym membership', 'Awaiting client allocation', 'On-call primary', 'CTO track'],
        correctIndex: 1,
        explanation: 'Bench = waiting for a billable assignment.',
      },
      {
        id: 'gym_crm',
        question: 'Salesforce is primarily known as a?',
        options: ['Kernel', 'CRM platform', 'Assembler', 'Game engine'],
        correctIndex: 1,
        explanation: 'Salesforce is the flagship cloud CRM.',
      },
      {
        id: 'gym_change',
        question: 'A classic client delaying tactic is the?',
        options: ['Hotfix', 'Change request', 'Git rebase', 'Canary'],
        correctIndex: 1,
        explanation: 'Change requests can pause and re-scope work.',
      },
    ],
  },
  faang: {
    title: 'Leetcode Gym Challenges',
    battleDialogueId: 'leet_battle',
    winDialogueId: 'leet_win',
    questions: [
      {
        id: 'gym_big_o',
        question: 'Binary search typical time complexity?',
        options: ['O(n²)', 'O(log n)', 'O(n!)', 'O(1) always'],
        correctIndex: 1,
        explanation: 'Binary search is O(log n) on sorted data.',
      },
      {
        id: 'gym_hash',
        question: 'Average hash map lookup is?',
        options: ['O(n)', 'O(1)', 'O(n log n)', 'O(∞)'],
        correctIndex: 1,
        explanation: 'Average-case hash map lookup is O(1).',
      },
      {
        id: 'gym_sys',
        question: 'In system design, a load balancer mainly?',
        options: ['Writes CSS', 'Distributes traffic across instances', 'Compiles Java', 'Signs offer letters'],
        correctIndex: 1,
        explanation: 'Load balancers distribute incoming traffic.',
      },
      {
        id: 'gym_rating',
        question: 'If your contest rating is "low," interviewers often?',
        options: ['Celebrate', 'Probe fundamentals harder / pass', 'Give equity early', 'Skip DSA'],
        correctIndex: 1,
        explanation: 'Low ratings invite deeper fundamentals grilling (or a polite pass).',
      },
    ],
  },
};
