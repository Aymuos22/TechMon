import type { DialogueNode } from '../types/dialogue';

export const dialogues: Record<string, DialogueNode[]> = {
  professor_ada: [
    {
      id: 'ada_1',
      speaker: 'Professor Ada',
      text: 'Welcome to the Tech Lab! Every engineer begins somewhere.',
      nextId: 'ada_2',
    },
    {
      id: 'ada_2',
      speaker: 'Professor Ada',
      text: 'Some choose simplicity. Some choose power. Some choose flexibility.',
      nextId: 'ada_3',
    },
    {
      id: 'ada_3',
      speaker: 'Professor Ada',
      text: 'Choose your starter technology. It will be your first partner on this journey.',
      choices: [
        { label: 'Python — simplicity', nextId: 'ada_python', action: { kind: 'give_starter', technologyIds: ['python'] } },
        { label: 'Java — power', nextId: 'ada_java', action: { kind: 'give_starter', technologyIds: ['java'] } },
        { label: 'JavaScript — flexibility', nextId: 'ada_js', action: { kind: 'give_starter', technologyIds: ['javascript'] } },
      ],
    },
    {
      id: 'ada_python',
      speaker: 'Professor Ada',
      text: 'Excellent! Python is readable and versatile. Take this Tech Scanner too.',
      action: { kind: 'give_item', itemId: 'tech_scanner', quantity: 1 },
      nextId: 'ada_done',
    },
    {
      id: 'ada_java',
      speaker: 'Professor Ada',
      text: 'Solid choice! Java runs everywhere via the JVM. Take this Tech Scanner.',
      action: { kind: 'give_item', itemId: 'tech_scanner', quantity: 1 },
      nextId: 'ada_done',
    },
    {
      id: 'ada_js',
      speaker: 'Professor Ada',
      text: 'Nice! JavaScript powers the interactive web. Take this Tech Scanner.',
      action: { kind: 'give_item', itemId: 'tech_scanner', quantity: 1 },
      nextId: 'ada_done',
    },
    {
      id: 'ada_done',
      speaker: 'Professor Ada',
      text: 'Analyze wild technologies, solve challenges, and register them in your TechDex. Build. Battle. Deploy!',
      action: { kind: 'set_flag', flag: 'starter_chosen', value: true },
    },
    {
      id: 'ada_after',
      speaker: 'Professor Ada',
      text: 'Your Tech Scanner is ready. Explore Byteburg, then take Pipeline Route toward Stackhaven!',
    },
  ],

  nurse_byte: [
    {
      id: 'nurse_1',
      speaker: 'Nurse Byte',
      text: 'Welcome to the Code Center! Shall I restore your technologies?',
      choices: [
        { label: 'Yes, please!', nextId: 'nurse_heal', action: { kind: 'heal_party' } },
        { label: 'Not now', nextId: 'nurse_no' },
      ],
    },
    {
      id: 'nurse_heal',
      speaker: 'Nurse Byte',
      text: 'All systems green! HP and Execution Points fully restored.',
    },
    {
      id: 'nurse_no',
      speaker: 'Nurse Byte',
      text: 'Come back anytime you need a hotfix!',
    },
  ],

  byteburg_walker: [
    {
      id: 'bw1',
      speaker: 'Junior Dev',
      text: 'Byteburg\'s quiet today. Check the Tech Lab if you\'re new — Professor Ada is expecting recruits.',
    },
  ],

  parent: [
    {
      id: 'parent_1',
      speaker: 'Mom',
      text: 'Ready for your first day, engineer? Visit Professor Ada at the Tech Lab!',
      nextId: 'parent_2',
    },
    {
      id: 'parent_2',
      speaker: 'Mom',
      text: 'Your computer can save progress. And don\'t forget — rest in your bed anytime.',
    },
  ],

  mart_clerk: [
    {
      id: 'mart_1',
      speaker: 'Shop Clerk',
      text: 'Welcome to Tech Mart! Debugging supplies and boosters in stock.',
      choices: [
        { label: 'Browse shop', action: { kind: 'open_shop', shopId: 'tech_mart' } },
        { label: 'Leave', nextId: 'mart_bye' },
      ],
    },
    {
      id: 'mart_bye',
      speaker: 'Shop Clerk',
      text: 'Deploy carefully out there!',
    },
  ],

  trainer_rookie: [
    {
      id: 'rook_1',
      speaker: 'Rookie Dev',
      text: 'I just shipped my first component! Think you can beat HTML?',
      choices: [
        { label: 'Let\'s battle!', action: { kind: 'start_battle', trainerId: 'trainer_rookie' } },
        { label: 'Maybe later', nextId: 'rook_no' },
      ],
    },
    {
      id: 'rook_no',
      speaker: 'Rookie Dev',
      text: 'Come back when you\'re ready to code!',
    },
  ],

  trainer_frontend: [
    {
      id: 'fe_1',
      speaker: 'Frontend Engineer',
      text: 'CSS specificity wars are real. Battle me!',
      choices: [
        { label: 'Accept', action: { kind: 'start_battle', trainerId: 'trainer_frontend' } },
        { label: 'Decline', nextId: 'fe_no' },
      ],
    },
    {
      id: 'fe_no',
      speaker: 'Frontend Engineer',
      text: 'Fine, go refactor somewhere else.',
    },
  ],

  sign_byteburg: [
    {
      id: 'sign_bb',
      speaker: 'Sign',
      text: 'BYTEBURG — Where every engineer begins. Tech Lab to the north. Gym to the east.',
    },
  ],

  maya_intro: [
    {
      id: 'maya_1',
      speaker: 'Maya',
      text: 'I\'m Maya, Frontend Gym Leader. Pass my UI challenges, then face my team!',
      choices: [
        { label: 'Take the challenge', action: { kind: 'open_gym_puzzle', gymId: 'frontend' } },
        { label: 'Not yet', nextId: 'maya_wait' },
      ],
    },
    {
      id: 'maya_wait',
      speaker: 'Maya',
      text: 'Come back when your components are ready.',
    },
    {
      id: 'maya_battle',
      speaker: 'Maya',
      text: 'Impressive! Now for the real render — battle!',
      action: { kind: 'start_battle', trainerId: 'gym_maya' },
    },
    {
      id: 'maya_win',
      speaker: 'Maya',
      text: 'You\'ve earned the Frontend Badge! Pipeline Route is fully open now.',
      action: { kind: 'give_badge', badgeId: 'frontend' },
    },
  ],

  arjun_intro: [
    {
      id: 'arjun_1',
      speaker: 'Arjun',
      text: 'Production never sleeps. I\'m Arjun — pass my infra challenges, then deploy against me.',
      choices: [
        { label: 'Take the challenge', action: { kind: 'open_gym_puzzle', gymId: 'production' } },
        { label: 'Retreat', nextId: 'arjun_wait' },
      ],
    },
    {
      id: 'arjun_wait',
      speaker: 'Arjun',
      text: 'Scale up and return.',
    },
    {
      id: 'arjun_battle',
      speaker: 'Arjun',
      text: 'Systems green. Initiating production battle!',
      action: { kind: 'start_battle', trainerId: 'gym_arjun' },
    },
    {
      id: 'arjun_win',
      speaker: 'Arjun',
      text: 'Outstanding. Take the Production Badge — you\'re production-ready!',
      action: { kind: 'give_badge', badgeId: 'production' },
    },
  ],

  engineer_cloud: [
    {
      id: 'cloud_1',
      speaker: 'Engineer Cloud',
      text: 'Welcome to Stackhaven Cloud Center. Latency is low today.',
      nextId: 'cloud_2',
    },
    {
      id: 'cloud_2',
      speaker: 'Engineer Cloud',
      text: 'Design for failure. Nurse Packett can restore your stack if a deploy goes sideways.',
    },
  ],

  devops_sentry: [
    {
      id: 'dev_1',
      speaker: 'DevOps Sentry',
      text: 'DevOps Tower watches every deploy. Containers below, clusters above.',
      nextId: 'dev_2',
    },
    {
      id: 'dev_2',
      speaker: 'DevOps Sentry',
      text: 'Talk to the Cluster Operator if you want a real orchestration fight.',
    },
  ],

  trainer_dba: [
    {
      id: 'dba_1',
      speaker: 'Schema Specialist',
      text: 'My indexes never miss. Can your queries keep up?',
      choices: [
        { label: 'Battle', action: { kind: 'start_battle', trainerId: 'trainer_dba' } },
        { label: 'Not now', nextId: 'dba_no' },
      ],
    },
    { id: 'dba_no', speaker: 'Schema Specialist', text: 'Come back when your EXPLAIN looks clean.' },
  ],

  trainer_tower_k8s: [
    {
      id: 'k8s_1',
      speaker: 'Cluster Operator',
      text: 'Pods scale. Nodes fail. Orchestrators win. Battle?',
      choices: [
        { label: 'Battle', action: { kind: 'start_battle', trainerId: 'trainer_tower_k8s' } },
        { label: 'Retreat', nextId: 'k8s_no' },
      ],
    },
    { id: 'k8s_no', speaker: 'Cluster Operator', text: 'Scheduling you for later.' },
  ],

  trainer_lab_ai: [
    {
      id: 'ml_1',
      speaker: 'ML Engineer',
      text: 'My model predicts a victory. Disprove it.',
      choices: [
        { label: 'Battle', action: { kind: 'start_battle', trainerId: 'trainer_lab_ai' } },
        { label: 'No', nextId: 'ml_no' },
      ],
    },
    { id: 'ml_no', speaker: 'ML Engineer', text: 'Retraining on your hesitation...' },
  ],

  gym_trainer_be: [
    {
      id: 'gbe_1',
      speaker: 'API Gatekeeper',
      text: 'Production Gym gate one: prove your backend stack!',
      choices: [
        { label: 'Challenge', action: { kind: 'start_battle', trainerId: 'gym_trainer_be' } },
        { label: 'Later', nextId: 'gbe_no' },
      ],
    },
    { id: 'gbe_no', speaker: 'API Gatekeeper', text: '401 Unauthorized. Come back ready.' },
  ],

  gym_trainer_infra: [
    {
      id: 'gin_1',
      speaker: 'Infra Sentinel',
      text: 'Gate two: containers and clusters. No downtime allowed.',
      choices: [
        { label: 'Challenge', action: { kind: 'start_battle', trainerId: 'gym_trainer_infra' } },
        { label: 'Later', nextId: 'gin_no' },
      ],
    },
    { id: 'gin_no', speaker: 'Infra Sentinel', text: 'Service degraded. Retry soon.' },
  ],

  trainer_cloud_street: [
    {
      id: 'cs_1',
      speaker: 'Cloud Engineer',
      text: 'Everything is an API — including this battle.',
      choices: [
        { label: 'Battle', action: { kind: 'start_battle', trainerId: 'trainer_cloud_street' } },
        { label: 'No', nextId: 'cs_no' },
      ],
    },
    { id: 'cs_no', speaker: 'Cloud Engineer', text: 'Cold start delayed.' },
  ],

  trainer_architect: [
    {
      id: 'sa_1',
      speaker: 'Software Architect',
      text: 'Trade-offs everywhere. Can your design survive production?',
      choices: [
        { label: 'Battle', action: { kind: 'start_battle', trainerId: 'trainer_architect' } },
        { label: 'No', nextId: 'sa_no' },
      ],
    },
    { id: 'sa_no', speaker: 'Software Architect', text: 'Architecture review postponed.' },
  ],

  arena_champ: [
    {
      id: 'ac_1',
      speaker: 'Arena Champion',
      text: 'Tournament Arena — no escape. Bring a full party.',
      choices: [
        { label: 'Accept challenge', action: { kind: 'start_battle', trainerId: 'arena_champ' } },
        { label: 'Not ready', nextId: 'ac_no' },
      ],
    },
    { id: 'ac_no', speaker: 'Arena Champion', text: 'Scale up, then return.' },
  ],

  db_admin: [
    {
      id: 'db_1',
      speaker: 'DB Admin',
      text: 'A migration failed last night. Help me with the Database Migration quest!',
      action: { kind: 'start_quest', questId: 'database_migration' },
    },
  ],

  ai_researcher: [
    {
      id: 'ai_1',
      speaker: 'AI Researcher',
      text: 'Models hallucinate. Engineers verify. Want to hunt bugs?',
      action: { kind: 'start_quest', questId: 'bug_hunter' },
    },
  ],

  market_clerk: [
    {
      id: 'mk_1',
      speaker: 'Market Clerk',
      text: 'Stackhaven Tech Market — premium gear only.',
      choices: [
        { label: 'Browse', action: { kind: 'open_shop', shopId: 'tech_market' } },
        { label: 'Leave', nextId: 'mk_bye' },
      ],
    },
    {
      id: 'mk_bye',
      speaker: 'Market Clerk',
      text: 'Stay within budget!',
    },
  ],

  quest_missing_api: [
    {
      id: 'api_1',
      speaker: 'SRE Dana',
      text: 'The checkout API went dark! Inspect the logs near Pipeline Route and fix it.',
      action: { kind: 'start_quest', questId: 'missing_api' },
    },
  ],

  quest_outage: [
    {
      id: 'out_1',
      speaker: 'On-Call Rex',
      text: 'Production outage in Stackhaven! Trace CPU, memory, logs, network, and DB.',
      action: { kind: 'start_quest', questId: 'production_outage' },
    },
  ],

  route_sign: [
    {
      id: 'rs_1',
      speaker: 'Sign',
      text: 'PIPELINE ROUTE — Byteburg ← → Stackhaven. Tall grass may contain wild technologies.',
    },
  ],

  trainer_backend: [
    {
      id: 'be_1',
      speaker: 'Backend Engineer',
      text: 'My APIs never 500... usually. Battle?',
      choices: [
        { label: 'Battle', action: { kind: 'start_battle', trainerId: 'trainer_backend' } },
        { label: 'No', nextId: 'be_no' },
      ],
    },
    { id: 'be_no', speaker: 'Backend Engineer', text: 'Keep your latency low.' },
  ],

  trainer_devops: [
    {
      id: 'do_1',
      speaker: 'DevOps Engineer',
      text: 'If it\'s not in a container, does it even exist?',
      choices: [
        { label: 'Battle', action: { kind: 'start_battle', trainerId: 'trainer_devops' } },
        { label: 'No', nextId: 'do_no' },
      ],
    },
    { id: 'do_no', speaker: 'DevOps Engineer', text: 'Alright, ship later.' },
  ],

  trainer_data: [
    {
      id: 'de_1',
      speaker: 'Data Engineer',
      text: 'My pipelines never break... until they do. Battle?',
      choices: [
        { label: 'Battle', action: { kind: 'start_battle', trainerId: 'trainer_data' } },
        { label: 'No', nextId: 'de_no' },
      ],
    },
    { id: 'de_no', speaker: 'Data Engineer', text: 'Keep your schemas clean.' },
  ],

  trainer_debugger: [
    {
      id: 'dbg_1',
      speaker: 'Debugger',
      text: 'I found 47 issues in your last commit. Prove me wrong!',
      choices: [
        { label: 'Battle', action: { kind: 'start_battle', trainerId: 'trainer_debugger' } },
        { label: 'No', nextId: 'dbg_no' },
      ],
    },
    { id: 'dbg_no', speaker: 'Debugger', text: 'I\'ll be watching the stack traces.' },
  ],

  trainer_ai: [
    {
      id: 'tai_1',
      speaker: 'AI Engineer',
      text: 'My model predicts you\'ll lose. Prove it wrong!',
      choices: [
        { label: 'Battle', action: { kind: 'start_battle', trainerId: 'trainer_ai' } },
        { label: 'No', nextId: 'tai_no' },
      ],
    },
    { id: 'tai_no', speaker: 'AI Engineer', text: 'Prediction: you\'ll be back.' },
  ],

  computer_save: [
    {
      id: 'pc_1',
      speaker: 'Home PC',
      text: 'Save your progress to local storage?',
      choices: [
        { label: 'Save', action: { kind: 'save_game' } },
        { label: 'Cancel' },
      ],
    },
  ],

  bed_rest: [
    {
      id: 'bed_1',
      speaker: 'Bed',
      text: 'You rest a while... Your technologies feel refreshed!',
      action: { kind: 'heal_party' },
    },
  ],

  // ——— Expansion towns ———
  cove_sre: [
    {
      id: 'cs_1',
      speaker: 'SRE Mira',
      text: 'Welcome to Container Cove. If it isn\'t in a pod, it isn\'t production.',
      nextId: 'cs_2',
    },
    {
      id: 'cs_2',
      speaker: 'SRE Mira',
      text: 'Beat Gym Leader Helm for the DevOps Badge. Watch your YAML indentation.',
    },
  ],
  cove_nurse_spot: [
    {
      id: 'cns_1',
      speaker: 'Pod Picker',
      text: 'I restarted the same Deployment fourteen times. It\'s a lifestyle.',
    },
  ],
  trainer_cove_yaml: [
    {
      id: 'yc_1',
      speaker: 'YAML Sailor',
      text: 'Spaces or tabs? Wrong answer either way. Battle!',
      choices: [
        { label: 'Battle', action: { kind: 'start_battle', trainerId: 'trainer_cove_yaml' } },
        { label: 'Flee', nextId: 'yc_no' },
      ],
    },
    { id: 'yc_no', speaker: 'YAML Sailor', text: 'Fine. Stay un-indented.' },
  ],
  trainer_ops_road: [
    {
      id: 'or_1',
      speaker: 'Pipeline Intern',
      text: 'CI is red. So am I. Battle?',
      choices: [
        { label: 'Battle', action: { kind: 'start_battle', trainerId: 'trainer_ops_road' } },
        { label: 'No', nextId: 'or_no' },
      ],
    },
    { id: 'or_no', speaker: 'Pipeline Intern', text: 'Retry after merge.' },
  ],
  helm_intro: [
    {
      id: 'helm_1',
      speaker: 'Helm',
      text: 'I\'m Helm — DevOps Gym Leader. Charts, clusters, chaos. Pass my quizzes, then face the fleet.',
      choices: [
        { label: 'Take the challenge', action: { kind: 'open_gym_puzzle', gymId: 'devops' } },
        { label: 'Not ready', nextId: 'helm_wait' },
      ],
    },
    { id: 'helm_wait', speaker: 'Helm', text: 'Come back when your helm upgrade is dry-run clean.' },
    {
      id: 'helm_battle',
      speaker: 'Helm',
      text: 'Rolling update complete. Initiating battle!',
      action: { kind: 'start_battle', trainerId: 'gym_helm' },
    },
    {
      id: 'helm_win',
      speaker: 'Helm',
      text: 'You earned the DevOps Badge. Orchestration Road east is open — try not to OOM.',
      action: { kind: 'give_badge', badgeId: 'devops' },
    },
  ],

  legacy_elder: [
    {
      id: 'le_1',
      speaker: 'Mainframe Elder',
      text: 'Legacy Crossing. Our COBOL still clears more money than your startup\'s Series B.',
      nextId: 'le_2',
    },
    {
      id: 'le_2',
      speaker: 'Mainframe Elder',
      text: 'Containers are cute. Batch jobs are eternal. Respect the green screen.',
    },
  ],
  trainer_legacy_batch: [
    {
      id: 'lb_1',
      speaker: 'Night Batch',
      text: 'Job JCL0021 started in 1987. It still hasn\'t finished. Battle while we wait?',
      choices: [
        { label: 'Battle', action: { kind: 'start_battle', trainerId: 'trainer_legacy_batch' } },
        { label: 'No', nextId: 'lb_no' },
      ],
    },
    { id: 'lb_no', speaker: 'Night Batch', text: 'See you in the ABEND dump.' },
  ],
  trainer_legacy_road: [
    {
      id: 'lr_1',
      speaker: 'Punch-Card Dev',
      text: 'I dropped my cards. The order is now the infrastructure. Battle?',
      choices: [
        { label: 'Battle', action: { kind: 'start_battle', trainerId: 'trainer_legacy_road' } },
        { label: 'No', nextId: 'lr_no' },
      ],
    },
    { id: 'lr_no', speaker: 'Punch-Card Dev', text: 'GOTO later.' },
  ],
  cobol_intro: [
    {
      id: 'cobol_1',
      speaker: 'Cobol',
      text: 'I\'m Cobol, Legacy Gym Leader. Your frameworks will be deprecated. My code already was — and still runs.',
      choices: [
        { label: 'Take the challenge', action: { kind: 'open_gym_puzzle', gymId: 'legacy' } },
        { label: 'Retreat', nextId: 'cobol_wait' },
      ],
    },
    { id: 'cobol_wait', speaker: 'Cobol', text: 'Return when you can spell PERFORM VARYING.' },
    {
      id: 'cobol_battle',
      speaker: 'Cobol',
      text: 'WORKING-STORAGE SECTION. Battle!',
      action: { kind: 'start_battle', trainerId: 'gym_cobol' },
    },
    {
      id: 'cobol_win',
      speaker: 'Cobol',
      text: 'Legacy Badge earned. The Causeway east opens — banks still need heroes.',
      action: { kind: 'give_badge', badgeId: 'legacy' },
    },
  ],

  service_tcs: [
    {
      id: 'tcs_1',
      speaker: 'TCS Associate',
      text: 'We\'re not a body shop. We\'re a *talent transformation ecosystem*. Totally different.',
      nextId: 'tcs_2',
    },
    {
      id: 'tcs_2',
      speaker: 'TCS Associate',
      text: 'I\'ve been on the bench for 11 months. That\'s called strategic readiness.',
    },
  ],
  service_cognizant: [
    {
      id: 'cog_1',
      speaker: 'Cognizant Lead',
      text: 'Our utilization metrics are world-class. Also please bill 45 hours this week.',
      nextId: 'cog_2',
    },
    {
      id: 'cog_2',
      speaker: 'Cognizant Lead',
      text: 'Startups? Cute. We have a PowerPoint about disruption from 2014.',
    },
  ],
  service_infosys: [
    {
      id: 'inf_1',
      speaker: 'Infosys Architect',
      text: 'I designed a framework. Nobody uses it. That proves I\'m ahead of the market.',
      nextId: 'inf_2',
    },
    {
      id: 'inf_2',
      speaker: 'Infosys Architect',
      text: 'FAANG? Overrated. Real engineers fill timesheets in triplicate.',
    },
  ],
  trainer_service_bench: [
    {
      id: 'sb_1',
      speaker: 'Onsite Lead',
      text: 'Client wants "full stack" by Monday. I\'ll show you full stack. Battle!',
      choices: [
        { label: 'Battle', action: { kind: 'start_battle', trainerId: 'trainer_service_bench' } },
        { label: 'No', nextId: 'sb_no' },
      ],
    },
    { id: 'sb_no', speaker: 'Onsite Lead', text: 'Fine. Stay benched.' },
  ],
  trainer_service_road: [
    {
      id: 'sr_1',
      speaker: 'Bench Warmer',
      text: 'Waiting for allocation... and a battle.',
      choices: [
        { label: 'Battle', action: { kind: 'start_battle', trainerId: 'trainer_service_road' } },
        { label: 'No', nextId: 'sr_no' },
      ],
    },
    { id: 'sr_no', speaker: 'Bench Warmer', text: 'Still waiting.' },
  ],
  billing_intro: [
    {
      id: 'billing_1',
      speaker: 'Billing',
      text: 'Billing Gym. I\'m Billing. Pass my challenges or get a change request for the next fiscal year.',
      choices: [
        { label: 'Take the challenge', action: { kind: 'open_gym_puzzle', gymId: 'service' } },
        { label: 'Decline', nextId: 'billing_wait' },
      ],
    },
    { id: 'billing_wait', speaker: 'Billing', text: 'Escalation closed. Reopen when ready.' },
    {
      id: 'billing_battle',
      speaker: 'Billing',
      text: 'Timesheet approved. Battle!',
      action: { kind: 'start_battle', trainerId: 'gym_billing' },
    },
    {
      id: 'billing_win',
      speaker: 'Billing',
      text: 'Service Badge yours. Leave the campus — Onsite Approach awaits.',
      action: { kind: 'give_badge', badgeId: 'service' },
    },
  ],

  faang_meta: [
    {
      id: 'fm_1',
      speaker: 'Meta Recruiter',
      text: 'What\'s your LC rating? Be honest. We already scraped it.',
      nextId: 'fm_2',
    },
    {
      id: 'fm_2',
      speaker: 'Meta Recruiter',
      text: 'Below 2000? We\'ll "move forward with other candidates." Above? Prove it in the gym.',
    },
  ],
  faang_amazon: [
    {
      id: 'fa_1',
      speaker: 'Amazon Bar Raiser',
      text: 'Tell me about a time you Customer Obsessed while Leadership Principled under Ambiguity.',
      nextId: 'fa_2',
    },
    {
      id: 'fa_2',
      speaker: 'Amazon Bar Raiser',
      text: 'Wrong STAR format. Also your offer band is "compelling."',
    },
  ],
  faang_google: [
    {
      id: 'fg_1',
      speaker: 'Google Host',
      text: 'Design a URL shortener that also interviews you. You have 45 minutes. Go.',
      nextId: 'fg_2',
    },
    {
      id: 'fg_2',
      speaker: 'Google Host',
      text: 'Low rating? We\'ll keep your resume "warm." Like a stale cache.',
    },
  ],
  trainer_faang_lc: [
    {
      id: 'fl_1',
      speaker: 'LC Grinder',
      text: 'Hard problem daily. Soft skills never. Battle!',
      choices: [
        { label: 'Battle', action: { kind: 'start_battle', trainerId: 'trainer_faang_lc' } },
        { label: 'No', nextId: 'fl_no' },
      ],
    },
    { id: 'fl_no', speaker: 'LC Grinder', text: 'Come back at contest rating 2100.' },
  ],
  trainer_faang_road: [
    {
      id: 'fr_1',
      speaker: 'Onsite Shadow',
      text: 'I\'ve been shadowing interviews since 2019. Your turn.',
      choices: [
        { label: 'Battle', action: { kind: 'start_battle', trainerId: 'trainer_faang_road' } },
        { label: 'No', nextId: 'fr_no' },
      ],
    },
    { id: 'fr_no', speaker: 'Onsite Shadow', text: 'Reject. Soft.' },
  ],
  leet_intro: [
    {
      id: 'leet_1',
      speaker: 'Leet',
      text: 'Leetcode Gym. I\'m Leet. Give me your rating. If it\'s low, I\'ll still battle — then judge you.',
      choices: [
        { label: 'Take the challenge', action: { kind: 'open_gym_puzzle', gymId: 'faang' } },
        { label: 'My rating is... private', nextId: 'leet_wait' },
      ],
    },
    { id: 'leet_wait', speaker: 'Leet', text: 'Coward. Grind Mediums and return.' },
    {
      id: 'leet_battle',
      speaker: 'Leet',
      text: 'Accepted. Time and space: O(battle).',
      action: { kind: 'start_battle', trainerId: 'gym_leet' },
    },
    {
      id: 'leet_win',
      speaker: 'Leet',
      text: 'FAANG Badge unlocked. LayOff Tower east — the disruptors wait. Don\'t lowball yourself.',
      action: { kind: 'give_badge', badgeId: 'faang' },
    },
  ],

  layoff_guide: [
    {
      id: 'lg_1',
      speaker: 'Exit Interviewer',
      text: 'Welcome to LayOff Tower. Please rate your departure experience from 1 to PIP.',
      nextId: 'lg_2',
    },
    {
      id: 'lg_2',
      speaker: 'Exit Interviewer',
      text: 'Climb past Oracle, Amazon, Meta, Google jokes. Mid floors: PIP Coach and RTO Enforcer. Summit: Dario (Claude) and Sam (Codex). Beat both to unlock Farming Life upstairs.',
    },
  ],
  layoff_guide_cleared: [
    {
      id: 'lgc_1',
      speaker: 'Exit Interviewer',
      text: 'You cleared the tower. HR is… impressed. And slightly unemployed.',
      nextId: 'lgc_2',
    },
    {
      id: 'lgc_2',
      speaker: 'Exit Interviewer',
      text: 'Quiet Acre Farming Life is live — endless tall grass, no standups. Portal north of the summit, or I can warp you.',
      choices: [
        {
          label: 'Warp to Quiet Acre',
          action: { kind: 'teleport', mapId: 'farm_life', x: 14, y: 12 },
        },
        { label: 'I\'ll walk', nextId: 'lgc_walk' },
      ],
    },
    {
      id: 'lgc_walk',
      speaker: 'Exit Interviewer',
      text: 'North door at the summit. Pack snacks. Leave your badge.',
    },
  ],
  layoff_oracle_hr: [
    {
      id: 'oh_1',
      speaker: 'Oracle HR Bot',
      text: 'Your role was depreciated. Renew career support — list price, no discounts, evergreen contract.',
      nextId: 'oh_2',
    },
    {
      id: 'oh_2',
      speaker: 'Oracle HR Bot',
      text: 'Larry says hi from the yacht. Your badge expires at 5pm. Cloud time. Also Java.',
    },
  ],
  layoff_amazon_hr: [
    {
      id: 'ah_1',
      speaker: 'Amazon HR Bot',
      text: 'Customer obsession update: customers love lower headcount costs. Leadership Principles™ apply.',
      nextId: 'ah_2',
    },
    {
      id: 'ah_2',
      speaker: 'Amazon HR Bot',
      text: 'Your PIP includes a two-pizza team. The pizzas left. So did half the org chart. Day one!',
    },
  ],
  layoff_meta_hr: [
    {
      id: 'mh_1',
      speaker: 'Meta Efficiency Bot',
      text: 'Year of Efficiency means fewer humans, more "move fast." Your team moved — out.',
      nextId: 'mh_2',
    },
    {
      id: 'mh_2',
      speaker: 'Meta Efficiency Bot',
      text: 'We\'re connecting the world. Just not your laptop to corp Wi‑Fi anymore.',
    },
  ],
  layoff_google_hr: [
    {
      id: 'gh_1',
      speaker: 'Google Perf Bot',
      text: 'Your perf packet said "exceeds." Finance said "exceeds budget." Guess who won?',
      nextId: 'gh_2',
    },
    {
      id: 'gh_2',
      speaker: 'Google Perf Bot',
      text: 'Don\'t be evil. Do be efficient. Free snacks remain. Jobs optional.',
    },
  ],
  trainer_layoff_pip: [
    {
      id: 'pip_1',
      speaker: 'PIP Coach',
      text: 'Welcome to your Performance Improvement Plan. Step 1: battle me. Step 2: cry. Step 3: LinkedIn.',
      choices: [
        { label: 'Battle', action: { kind: 'start_battle', trainerId: 'trainer_layoff_pip' } },
        { label: 'Decline PIP', nextId: 'pip_no' },
      ],
    },
    { id: 'pip_no', speaker: 'PIP Coach', text: 'Refusal noted. Escalating to calendar spam.' },
  ],
  trainer_layoff_rto: [
    {
      id: 'rto_1',
      speaker: 'RTO Enforcer',
      text: 'Return to office. The badge reader misses you. Also the empty floors. Battle for hybrid?',
      choices: [
        { label: 'Battle', action: { kind: 'start_battle', trainerId: 'trainer_layoff_rto' } },
        { label: 'I\'m remote forever', nextId: 'rto_no' },
      ],
    },
    { id: 'rto_no', speaker: 'RTO Enforcer', text: 'Camera on. Mute yourself. We\'ll "circle back."' },
  ],

  dario_intro: [
    {
      id: 'dario_1',
      speaker: 'Dario Amodei',
      text: 'I\'m Dario. We aligned the models. Then we aligned the market. Claude isn\'t in any wild grass — only here.',
      nextId: 'dario_2',
    },
    {
      id: 'dario_2',
      speaker: 'Dario Amodei',
      text: 'Constitutional, careful, and about to ship your job into an artifact. Battle?',
      choices: [
        { label: 'Challenge Claude', action: { kind: 'start_battle', trainerId: 'villain_dario' } },
        { label: 'Not yet', nextId: 'dario_wait' },
      ],
    },
    {
      id: 'dario_wait',
      speaker: 'Dario Amodei',
      text: 'Take your time. Claude has a long context window.',
    },
    {
      id: 'dario_win',
      speaker: 'Dario Amodei',
      text: 'Impressive. If Sam falls too, the Quiet Acre portal opens — go farm in peace.',
      action: { kind: 'set_flag', flag: 'defeated_dario', value: true },
    },
  ],
  sam_intro: [
    {
      id: 'sam_1',
      speaker: 'Sam Altman',
      text: 'Sam here. We shipped Codex. It autocompletes code — and sometimes entire careers.',
      nextId: 'sam_2',
    },
    {
      id: 'sam_2',
      speaker: 'Sam Altman',
      text: 'OpenAI Codex isn\'t wild-catchable. Exclusive. Like a board seat. Ready?',
      choices: [
        { label: 'Challenge Codex', action: { kind: 'start_battle', trainerId: 'villain_sam' } },
        { label: 'Later', nextId: 'sam_wait' },
      ],
    },
    {
      id: 'sam_wait',
      speaker: 'Sam Altman',
      text: 'Cool. We\'ll soft-launch your defeat next quarter.',
    },
    {
      id: 'sam_win',
      speaker: 'Sam Altman',
      text: 'You win. Partnership terms: you get Farming Life. We get a blog post. Fair.',
      action: { kind: 'set_flag', flag: 'defeated_sam', value: true },
    },
  ],

  // ——— Data-center protests ———
  protest_byteburg: [
    {
      id: 'pb_1',
      speaker: 'Water Watcher',
      text: 'NO DATA CENTER WITHOUT WATER STUDY! GPUs drink like a stadium. Our taps do not.',
      nextId: 'pb_2',
    },
    {
      id: 'pb_2',
      speaker: 'Water Watcher',
      text: 'They promise "community benefits." Translation: a picnic table and a whitepaper.',
    },
  ],
  protest_byteburg_2: [
    {
      id: 'pb2_1',
      speaker: 'Sign Painter',
      text: 'My sign says "SERVERS NEED KILOWATTS, KIDS NEED SCHOOLS." HR offered me free cloud credits.',
      nextId: 'pb2_2',
    },
    {
      id: 'pb2_2',
      speaker: 'Sign Painter',
      text: 'I said no. Then they offered a hoodie. Still no. Principles > merch.',
    },
  ],
  protest_stackhaven: [
    {
      id: 'ps_1',
      speaker: 'Noise Protester',
      text: 'That "low hum" is a diesel backup farm practicing for the apocalypse. And for AI training runs.',
      nextId: 'ps_2',
    },
    {
      id: 'ps_2',
      speaker: 'Noise Protester',
      text: 'Build libraries. Build transit. Don\'t build another windowless temple to latency.',
    },
  ],
  protest_cove: [
    {
      id: 'pc_1',
      speaker: 'Grid Guardian',
      text: 'Container Cove already orchestrates enough. We don\'t need a hyperscale box sucking the grid dry.',
      nextId: 'pc_2',
    },
    {
      id: 'pc_2',
      speaker: 'Grid Guardian',
      text: 'Pods scale. Power plants do not — overnight. Tell your cloud vendor: not in my bay.',
    },
  ],

  // ——— Diversity Arena / POSH ———
  div_priya: [
    {
      id: 'dp_1',
      speaker: 'Priya',
      text: 'Welcome to the Diversity Arena. We ship code and standards. POSH is law — not a vibe.',
      nextId: 'dp_2',
    },
    {
      id: 'dp_2',
      speaker: 'Priya',
      text: 'POSH = Prevention of Sexual Harassment at Workplace (India). Every office needs an ICC. Ignorance isn\'t a defense.',
      nextId: 'dp_3',
    },
    {
      id: 'dp_3',
      speaker: 'Priya',
      text: 'Joke: the only mandatory training where people mute AND take notes. Because consequences beat quizzes.',
    },
  ],
  div_aisha: [
    {
      id: 'da_1',
      speaker: 'Aisha',
      text: 'Consent isn\'t a "culture deck." It\'s: ask, respect the no, don\'t retaliate.',
      nextId: 'da_2',
    },
    {
      id: 'da_2',
      speaker: 'Aisha',
      text: 'If someone reports, believe the process — not the rumor mill. HR gossip is not due diligence.',
      nextId: 'da_3',
    },
    {
      id: 'da_3',
      speaker: 'Aisha',
      text: 'Joke: "We\'re like a family" is not a security model. Families don\'t need ICCs. Companies do.',
    },
  ],
  div_mei: [
    {
      id: 'dm_1',
      speaker: 'Mei',
      text: 'I debug prod and bias in hiring loops. "Culture fit" often means "clone the interviewer."',
      nextId: 'dm_2',
    },
    {
      id: 'dm_2',
      speaker: 'Mei',
      text: 'POSH tip: screenshots help. So does knowing your ICC contacts before you need them.',
      nextId: 'dm_3',
    },
    {
      id: 'dm_3',
      speaker: 'Mei',
      text: 'Joke: my least favorite sprint goal is "fix harassment training by Friday." Ship respect continuously.',
    },
  ],
  div_sofia: [
    {
      id: 'ds_1',
      speaker: 'Sofia',
      text: 'Women write kernels, compilers, and incident reports. We also write the complaint when lines are crossed.',
      nextId: 'ds_2',
    },
    {
      id: 'ds_2',
      speaker: 'Sofia',
      text: 'Bystanders matter. If you see it, say it — or you\'re part of the outage.',
      nextId: 'ds_3',
    },
    {
      id: 'ds_3',
      speaker: 'Sofia',
      text: 'Joke: "It was just a joke" is the worst incident postmortem title in history.',
    },
  ],
  trainer_div_lead: [
    {
      id: 'tdl_1',
      speaker: 'Lead Architect Neha',
      text: 'I design systems that fail gracefully. Harassment should fail closed. Battle after the lesson?',
      choices: [
        { label: 'Battle', action: { kind: 'start_battle', trainerId: 'trainer_div_lead' } },
        { label: 'Just listening', nextId: 'tdl_no' },
      ],
    },
    {
      id: 'tdl_no',
      speaker: 'Lead Architect Neha',
      text: 'Good. Listening is a seniority signal.',
    },
  ],
  trainer_div_sre: [
    {
      id: 'tds_1',
      speaker: 'SRE Kavya',
      text: 'On-call taught me escalation paths. POSH has them too — use them. Ready to page me in battle?',
      choices: [
        { label: 'Battle', action: { kind: 'start_battle', trainerId: 'trainer_div_sre' } },
        { label: 'Not now', nextId: 'tds_no' },
      ],
    },
    { id: 'tds_no', speaker: 'SRE Kavya', text: 'Ack. I\'ll be on standby.' },
  ],

  // ——— Farming life ———
  farm_rancher: [
    {
      id: 'fr_1',
      speaker: 'Retired SRE',
      text: 'You beat the disruptors. Congrats. Out here we farm wild tech — no PIPs, no RTO, no "quick sync."',
      nextId: 'fr_2',
    },
    {
      id: 'fr_2',
      speaker: 'Retired SRE',
      text: 'Tall grass is dense. Levels run high. Heal in the Rest Hut. Stay as long as you want — this is the credits sequence that never ends.',
    },
  ],
  farm_nurse_spot: [
    {
      id: 'fns_1',
      speaker: 'Crop Scout',
      text: 'Best drop rates after rain. We don\'t have weather yet. Pretend. Walk the grass. Profit.',
    },
  ],
  trainer_farm_a: [
    {
      id: 'tfa_1',
      speaker: 'Weekend Warrior',
      text: 'I left FAANG for tomatoes and TypeScript. Battle keeps the reflexes sharp.',
      choices: [
        { label: 'Battle', action: { kind: 'start_battle', trainerId: 'trainer_farm_a' } },
        { label: 'Maybe later', nextId: 'tfa_no' },
      ],
    },
    { id: 'tfa_no', speaker: 'Weekend Warrior', text: 'The compost heap will wait.' },
  ],
  trainer_farm_b: [
    {
      id: 'tfb_1',
      speaker: 'Homestead Hacker',
      text: 'My CI is a scarecrow. My CD is "did the chickens escape." Still want to fight?',
      choices: [
        { label: 'Battle', action: { kind: 'start_battle', trainerId: 'trainer_farm_b' } },
        { label: 'No', nextId: 'tfb_no' },
      ],
    },
    { id: 'tfb_no', speaker: 'Homestead Hacker', text: 'Wise. Chickens have merge conflicts.' },
  ],
};

export function getDialogue(id: string): DialogueNode[] {
  const nodes = dialogues[id];
  if (!nodes) throw new Error(`Unknown dialogue: ${id}`);
  return nodes;
}
