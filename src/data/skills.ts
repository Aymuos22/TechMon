import type { Skill } from '../types/technology';

export const skills: Skill[] = [
  // Python
  { id: 'dynamic_typing', name: 'Dynamic Typing', description: 'Flexible type strike.', type: 'language', power: 40, accuracy: 100, category: 'special' },
  { id: 'list_comprehension', name: 'List Comprehension', description: 'Compact data blast.', type: 'language', power: 55, accuracy: 95, category: 'special' },
  { id: 'asyncio', name: 'AsyncIO', description: 'Concurrent coroutine hit.', type: 'language', power: 70, accuracy: 90, category: 'special', effect: { kind: 'status', status: 'overloaded', chance: 20 } },
  { id: 'garbage_collection', name: 'Garbage Collection', description: 'Reclaim memory and heal.', type: 'language', power: 0, accuracy: 100, category: 'status', effect: { kind: 'heal', percent: 40 } },

  // Java
  { id: 'jvm_strike', name: 'JVM Strike', description: 'Bytecode punch.', type: 'language', power: 45, accuracy: 100, category: 'physical' },
  { id: 'multithreading', name: 'Multithreading', description: 'Parallel assault.', type: 'language', power: 65, accuracy: 90, category: 'physical', effect: { kind: 'status', status: 'overloaded', chance: 25 } },
  { id: 'spring_injection', name: 'Spring Injection', description: 'Dependency pierce.', type: 'backend', power: 75, accuracy: 85, category: 'special' },
  { id: 'java_gc', name: 'Heap Sweep', description: 'Clear memory leak.', type: 'language', power: 0, accuracy: 100, category: 'status', effect: { kind: 'heal', percent: 35 } },

  // JavaScript
  { id: 'event_loop', name: 'Event Loop', description: 'Queue-based strike.', type: 'language', power: 40, accuracy: 100, category: 'special' },
  { id: 'promise_chain', name: 'Promise Chain', description: 'Cascading async hit.', type: 'language', power: 60, accuracy: 90, category: 'special' },
  { id: 'callback_hell', name: 'Callback Hell', description: 'Confuse with nesting.', type: 'language', power: 30, accuracy: 85, category: 'status', effect: { kind: 'status', status: 'bugged', chance: 70 } },
  { id: 'async_await', name: 'Async Await', description: 'Clean async power.', type: 'language', power: 80, accuracy: 90, category: 'special' },

  // TypeScript / C++ / Go / Rust
  { id: 'static_check', name: 'Static Check', description: 'Type-safe strike.', type: 'language', power: 50, accuracy: 100, category: 'special' },
  { id: 'generics', name: 'Generics', description: 'Parameterized blast.', type: 'language', power: 70, accuracy: 95, category: 'special' },
  { id: 'pointer_strike', name: 'Pointer Strike', description: 'Low-level puncture.', type: 'language', power: 75, accuracy: 85, category: 'physical', effect: { kind: 'status', status: 'memory_leak', chance: 20 } },
  { id: 'goroutine', name: 'Goroutine', description: 'Lightweight concurrency.', type: 'language', power: 55, accuracy: 100, category: 'physical' },
  { id: 'borrow_checker', name: 'Borrow Checker', description: 'Safety-enforced hit.', type: 'language', power: 65, accuracy: 100, category: 'special', effect: { kind: 'status', status: 'rate_limited', chance: 15 } },

  // Frontend
  { id: 'component_render', name: 'Component Render', description: 'UI tree strike.', type: 'frontend', power: 45, accuracy: 100, category: 'special' },
  { id: 'virtual_dom', name: 'Virtual DOM', description: 'Diff and patch.', type: 'frontend', power: 60, accuracy: 95, category: 'special' },
  { id: 'state_update', name: 'State Update', description: 'Reactive burst.', type: 'frontend', power: 70, accuracy: 90, category: 'special' },
  { id: 'hook_invocation', name: 'Hook Invocation', description: 'Lifecycle power.', type: 'frontend', power: 80, accuracy: 85, category: 'special' },
  { id: 'two_way_bind', name: 'Two-Way Bind', description: 'Angular data sync.', type: 'frontend', power: 55, accuracy: 95, category: 'special' },
  { id: 'reactivity', name: 'Reactivity', description: 'Vue reactive hit.', type: 'frontend', power: 60, accuracy: 95, category: 'special' },
  { id: 'ssr_burst', name: 'SSR Burst', description: 'Server-rendered strike.', type: 'frontend', power: 75, accuracy: 90, category: 'special' },
  { id: 'css_cascade', name: 'CSS Cascade', description: 'Style overwhelm.', type: 'frontend', power: 40, accuracy: 100, category: 'special' },
  { id: 'html_markup', name: 'HTML Markup', description: 'Structure strike.', type: 'frontend', power: 35, accuracy: 100, category: 'physical' },

  // Backend
  { id: 'rest_endpoint', name: 'REST Endpoint', description: 'HTTP blast.', type: 'backend', power: 50, accuracy: 100, category: 'special' },
  { id: 'middleware', name: 'Middleware', description: 'Pipeline pierce.', type: 'backend', power: 60, accuracy: 95, category: 'special' },
  { id: 'orm_query', name: 'ORM Query', description: 'Database-aware hit.', type: 'backend', power: 70, accuracy: 90, category: 'special' },
  { id: 'dependency_inject', name: 'Dependency Inject', description: 'Spring power.', type: 'backend', power: 75, accuracy: 90, category: 'special' },
  { id: 'fastapi_speed', name: 'FastAPI Speed', description: 'Blazing async API.', type: 'backend', power: 80, accuracy: 90, category: 'special' },

  // Database
  { id: 'select_star', name: 'SELECT *', description: 'Full table scan hit.', type: 'database', power: 45, accuracy: 90, category: 'special', effect: { kind: 'status', status: 'overloaded', chance: 20 } },
  { id: 'index_seek', name: 'Index Seek', description: 'Precise query.', type: 'database', power: 65, accuracy: 100, category: 'special' },
  { id: 'acid_tx', name: 'ACID Transaction', description: 'Reliable commit.', type: 'database', power: 70, accuracy: 95, category: 'special' },
  { id: 'document_store', name: 'Document Store', description: 'Flexible schema hit.', type: 'database', power: 55, accuracy: 100, category: 'special' },
  { id: 'cache_hit', name: 'Cache Hit', description: 'Redis lightning.', type: 'database', power: 60, accuracy: 100, category: 'special' },

  // Cloud
  { id: 'lambda_burst', name: 'Lambda Burst', description: 'Serverless strike.', type: 'cloud', power: 70, accuracy: 90, category: 'special' },
  { id: 's3_storage', name: 'S3 Storage', description: 'Durable defense hit.', type: 'cloud', power: 40, accuracy: 100, category: 'status', effect: { kind: 'stat_mod', stat: 'defense', stages: 1 } },
  { id: 'ec2_compute', name: 'EC2 Compute', description: 'Raw compute power.', type: 'cloud', power: 75, accuracy: 85, category: 'physical' },
  { id: 'auto_scaling', name: 'Auto Scaling', description: 'Scale under pressure.', type: 'cloud', power: 50, accuracy: 100, category: 'status', effect: { kind: 'stat_mod', stat: 'speed', stages: 2 } },
  { id: 'azure_func', name: 'Azure Function', description: 'Cloud function hit.', type: 'cloud', power: 65, accuracy: 90, category: 'special' },
  { id: 'gcp_run', name: 'Cloud Run', description: 'Containerized cloud.', type: 'cloud', power: 70, accuracy: 90, category: 'special' },

  // DevOps
  { id: 'containerize', name: 'Containerize', description: 'Isolate and strike.', type: 'devops', power: 50, accuracy: 100, category: 'physical' },
  { id: 'image_build', name: 'Image Build', description: 'Layered assault.', type: 'devops', power: 60, accuracy: 95, category: 'physical' },
  { id: 'layer_cache', name: 'Layer Cache', description: 'Cached efficiency.', type: 'devops', power: 0, accuracy: 100, category: 'status', effect: { kind: 'heal', percent: 30 } },
  { id: 'port_mapping', name: 'Port Mapping', description: 'Expose vulnerability.', type: 'devops', power: 55, accuracy: 90, category: 'special', effect: { kind: 'status', status: 'bugged', chance: 25 } },
  { id: 'pod_deploy', name: 'Pod Deploy', description: 'Orchestrated strike.', type: 'devops', power: 70, accuracy: 90, category: 'special' },
  { id: 'k8s_scale', name: 'Auto Scaling', description: 'Replica flood.', type: 'devops', power: 65, accuracy: 95, category: 'special' },
  { id: 'service_discovery', name: 'Service Discovery', description: 'Find and hit.', type: 'devops', power: 50, accuracy: 100, category: 'special' },
  { id: 'rolling_update', name: 'Rolling Update', description: 'Zero-downtime hit.', type: 'devops', power: 80, accuracy: 85, category: 'special' },
  { id: 'terraform_plan', name: 'Terraform Plan', description: 'Infra prediction.', type: 'devops', power: 45, accuracy: 100, category: 'status', effect: { kind: 'self_status', status: 'compiling' } },
  { id: 'terraform_apply', name: 'Terraform Apply', description: 'Provision reality.', type: 'devops', power: 90, accuracy: 80, category: 'special' },

  // Messaging
  { id: 'publish', name: 'Publish', description: 'Emit event.', type: 'messaging', power: 50, accuracy: 100, category: 'special' },
  { id: 'consume', name: 'Consume', description: 'Process message.', type: 'messaging', power: 55, accuracy: 95, category: 'special' },
  { id: 'partition', name: 'Partition', description: 'Split load.', type: 'messaging', power: 70, accuracy: 90, category: 'special' },
  { id: 'consumer_group', name: 'Consumer Group', description: 'Parallel consume.', type: 'messaging', power: 75, accuracy: 90, category: 'special' },
  { id: 'queue_bind', name: 'Queue Bind', description: 'RabbitMQ route.', type: 'messaging', power: 60, accuracy: 95, category: 'special' },

  // AI
  { id: 'tensor_ops', name: 'Tensor Ops', description: 'Matrix multiplication.', type: 'ai', power: 60, accuracy: 95, category: 'special' },
  { id: 'backprop', name: 'Backpropagation', description: 'Gradient descent hit.', type: 'ai', power: 75, accuracy: 90, category: 'special' },
  { id: 'inference', name: 'Inference', description: 'Predictive strike.', type: 'ai', power: 70, accuracy: 95, category: 'special' },
  { id: 'chain_invoke', name: 'Chain Invoke', description: 'LLM chain power.', type: 'ai', power: 65, accuracy: 90, category: 'special', effect: { kind: 'status', status: 'deprecated', chance: 15 } },
  { id: 'graph_flow', name: 'Graph Flow', description: 'Agent graph strike.', type: 'ai', power: 80, accuracy: 85, category: 'special' },

  // Shared status moves
  { id: 'debug_patch', name: 'Debug Patch', description: 'Clear a bug.', type: 'language', power: 0, accuracy: 100, category: 'status', effect: { kind: 'heal', percent: 20 } },
  { id: 'compile', name: 'Compile', description: 'Charge a powerful attack.', type: 'language', power: 0, accuracy: 100, category: 'status', effect: { kind: 'self_status', status: 'compiling' } },

  // Legacy / enterprise satire
  { id: 'cobol_batch', name: 'COBOL Batch', description: 'Overnight job that never dies.', type: 'language', power: 70, accuracy: 95, category: 'special' },
  { id: 'mainframe_crash', name: 'Mainframe Crash', description: 'Bring the data center down with you.', type: 'backend', power: 90, accuracy: 80, category: 'physical', effect: { kind: 'status', status: 'crashed', chance: 20 } },
  { id: 'ticket_queue', name: 'Ticket Queue', description: 'Drown them in Jira tickets.', type: 'devops', power: 55, accuracy: 100, category: 'status', effect: { kind: 'status', status: 'overloaded', chance: 60 } },
  { id: 'billing_hour', name: 'Billing Hour', description: 'Charge for "analysis" that fixed nothing.', type: 'backend', power: 40, accuracy: 100, category: 'status', effect: { kind: 'stat_mod', stat: 'defense', stages: 1 } },
  { id: 'leet_grind', name: 'Leet Grind', description: 'Force an O(n²) interview question.', type: 'language', power: 75, accuracy: 90, category: 'special' },
  { id: 'system_design', name: 'System Design Flex', description: 'Draw boxes until they cry.', type: 'cloud', power: 80, accuracy: 85, category: 'special' },
  { id: 'lowball_offer', name: 'Lowball Offer', description: 'Emotional damage via comp band.', type: 'messaging', power: 65, accuracy: 100, category: 'status', effect: { kind: 'status', status: 'bugged', chance: 50 } },

  // Villain exclusives — Claude / Codex (not wild)
  { id: 'constitutional_ai', name: 'Constitutional AI', description: 'Refuse unsafe moves, then counter.', type: 'ai', power: 85, accuracy: 100, category: 'special' },
  { id: 'context_window', name: 'Context Window', description: 'Swallow the whole codebase.', type: 'ai', power: 95, accuracy: 90, category: 'special' },
  { id: 'helpful_harmless', name: 'Helpful Harmless', description: 'Heal while sounding concerned.', type: 'ai', power: 0, accuracy: 100, category: 'status', effect: { kind: 'heal', percent: 45 } },
  { id: 'artifact_drop', name: 'Artifact Drop', description: 'Ship a polished distraction.', type: 'ai', power: 70, accuracy: 95, category: 'special', effect: { kind: 'stat_mod', stat: 'specialAttack', stages: 1 } },
  { id: 'codex_autocomplete', name: 'Codex Autocomplete', description: 'Finish their career mid-sentence.', type: 'ai', power: 88, accuracy: 95, category: 'special' },
  { id: 'token_flood', name: 'Token Flood', description: 'Burn the budget in one call.', type: 'ai', power: 92, accuracy: 85, category: 'special', effect: { kind: 'status', status: 'overloaded', chance: 30 } },
  { id: 'agi_hype', name: 'AGI Hype', description: 'Announce the future, ship a chatbot.', type: 'ai', power: 0, accuracy: 100, category: 'status', effect: { kind: 'stat_mod', stat: 'specialAttack', stages: 2 } },
  { id: 'safety_theater', name: 'Safety Theater', description: 'Pause rivals while you scale.', type: 'ai', power: 60, accuracy: 100, category: 'status', effect: { kind: 'status', status: 'rate_limited', chance: 70 } },
];

export const skillById: Record<string, Skill> = Object.fromEntries(
  skills.map((s) => [s.id, s]),
);

export function getSkill(id: string): Skill {
  const skill = skillById[id];
  if (!skill) throw new Error(`Unknown skill: ${id}`);
  return skill;
}

/** Default Execution Point pool sized by skill power */
export function getSkillMaxEP(skill: Skill): number {
  if (skill.maxEP !== undefined) return skill.maxEP;
  if (skill.power <= 0 || skill.category === 'status') return 15;
  if (skill.power >= 90) return 5;
  if (skill.power >= 75) return 8;
  if (skill.power >= 55) return 12;
  return 20;
}
