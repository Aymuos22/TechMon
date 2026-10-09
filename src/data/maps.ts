import type { MapData } from '../types/map';
import {
  TILE,
  createGrid,
  fillRect,
  setTile,
  buildCollision,
  drawBorder,
  drawRoom,
} from './tiles';

function makeInterior(
  id: string,
  name: string,
  width: number,
  height: number,
  exitMap: string,
  exitPos: { x: number; y: number },
  theme: MapData['theme'] = 'interior',
): MapData {
  const tiles = createGrid(width, height, TILE.WALL);
  fillRect(tiles, 1, 1, width - 2, height - 2, TILE.FLOOR);
  setTile(tiles, Math.floor(width / 2), height - 1, TILE.DOOR);
  return {
    id,
    name,
    width,
    height,
    tiles,
    collision: buildCollision(tiles),
    transitions: [
      {
        id: `${id}_exit`,
        from: { x: Math.floor(width / 2), y: height - 1 },
        toMapId: exitMap,
        toPosition: exitPos,
      },
    ],
    interactions: [],
    buildings: [],
    npcIds: [],
    music: 'city',
    isInterior: true,
    parentMapId: exitMap,
    theme,
  };
}

export function createPlayerHouse(): MapData {
  const map = makeInterior('player_house', 'Player House', 11, 9, 'byteburg', { x: 6, y: 7 });
  map.transitions[0].toFacing = 'down';
  fillRect(map.tiles, 2, 2, 3, 2, TILE.CARPET);
  map.interactions = [
    { id: 'bed', position: { x: 2, y: 2 }, kind: 'bed', text: 'A cozy bed.' },
    { id: 'computer', position: { x: 8, y: 2 }, kind: 'computer', text: 'Your development machine.' },
    { id: 'save_pc', position: { x: 8, y: 2 }, kind: 'save' },
  ];
  setTile(map.tiles, 8, 2, TILE.COMPUTER);
  map.collision = buildCollision(map.tiles);
  map.npcIds = ['parent'];
  return map;
}

export function createTechLab(): MapData {
  const map = makeInterior('tech_lab', 'Tech Lab', 13, 10, 'byteburg', { x: 12, y: 6 });
  map.transitions[0].toFacing = 'down';
  fillRect(map.tiles, 3, 2, 7, 3, TILE.FLOOR_DARK);
  setTile(map.tiles, 5, 2, TILE.COMPUTER);
  setTile(map.tiles, 6, 2, TILE.COMPUTER);
  setTile(map.tiles, 7, 2, TILE.COMPUTER);
  map.interactions = [
    {
      id: 'lab_terminal',
      position: { x: 6, y: 2 },
      kind: 'computer',
      text: 'Tech analysis terminals hum quietly.',
    },
  ];
  map.npcIds = ['professor_ada'];
  map.collision = buildCollision(map.tiles);
  return map;
}

export function createCodeCenter(): MapData {
  // FireRed-style Pokémon Center: nurse desk, heal machines, PC, pink carpet aisle
  const W = 15;
  const H = 11;
  const map = makeInterior('code_center', 'Code Center', W, H, 'byteburg', { x: 16, y: 11 });
  map.transitions[0].toFacing = 'down';

  // Soft pink floor wash + center carpet aisle
  fillRect(map.tiles, 1, 1, W - 2, H - 2, TILE.FLOOR);
  fillRect(map.tiles, 5, 4, 5, 5, TILE.CARPET);

  // Healing machine bank behind the nurse
  setTile(map.tiles, 5, 1, TILE.MACHINE);
  setTile(map.tiles, 6, 1, TILE.MACHINE);
  setTile(map.tiles, 7, 1, TILE.MACHINE);
  setTile(map.tiles, 8, 1, TILE.MACHINE);
  setTile(map.tiles, 9, 1, TILE.MACHINE);

  // Reception counter (talk through it to Nurse Byte)
  fillRect(map.tiles, 4, 3, 7, 1, TILE.COUNTER);

  // Side seating + storage PC
  setTile(map.tiles, 2, 6, TILE.BENCH);
  setTile(map.tiles, 12, 6, TILE.BENCH);
  setTile(map.tiles, 1, 2, TILE.COMPUTER);
  setTile(map.tiles, 2, 2, TILE.COMPUTER);

  map.interactions = [
    {
      id: 'storage_pc',
      position: { x: 1, y: 2 },
      kind: 'computer',
      text: 'Tech Storage Terminal',
    },
    {
      id: 'storage_pc_b',
      position: { x: 2, y: 2 },
      kind: 'computer',
      text: 'Tech Storage Terminal',
    },
    {
      id: 'heal_sign',
      position: { x: 7, y: 1 },
      kind: 'sign',
      text: 'CODE CENTER — Restoring crashed technologies…',
    },
  ];
  map.npcIds = ['nurse_byte'];
  map.collision = buildCollision(map.tiles);
  return map;
}

export function createTechMart(): MapData {
  // FireRed-style mart: shelves, clerk behind counter
  const W = 13;
  const H = 10;
  const map = makeInterior('tech_mart', 'Tech Mart', W, H, 'byteburg', { x: 10, y: 20 });
  map.transitions[0].toFacing = 'down';

  fillRect(map.tiles, 1, 1, W - 2, H - 2, TILE.FLOOR);

  // Back wall shelves
  fillRect(map.tiles, 1, 1, W - 2, 1, TILE.SHELF);
  // Side aisles
  setTile(map.tiles, 1, 2, TILE.SHELF);
  setTile(map.tiles, 1, 3, TILE.SHELF);
  setTile(map.tiles, 1, 4, TILE.SHELF);
  setTile(map.tiles, 11, 2, TILE.SHELF);
  setTile(map.tiles, 11, 3, TILE.SHELF);
  setTile(map.tiles, 11, 4, TILE.SHELF);
  setTile(map.tiles, 11, 5, TILE.SHELF);

  // Sales counter
  fillRect(map.tiles, 3, 3, 7, 1, TILE.COUNTER);
  // Floor mat in front of counter
  fillRect(map.tiles, 4, 4, 5, 1, TILE.PATH);

  map.interactions = [
    {
      id: 'mart_sign',
      position: { x: 6, y: 1 },
      kind: 'sign',
      text: 'TECH MART — Tools for every deploy.',
    },
  ];
  map.npcIds = ['mart_clerk'];
  map.collision = buildCollision(map.tiles);
  return map;
}

export function createFrontendGym(): MapData {
  const map = makeInterior('frontend_gym', 'Frontend Gym', 11, 12, 'byteburg', { x: 26, y: 13 });
  map.transitions[0].toFacing = 'down';
  fillRect(map.tiles, 2, 2, 7, 7, TILE.FLOOR_DARK);
  fillRect(map.tiles, 4, 4, 3, 3, TILE.CARPET);
  map.npcIds = ['maya'];
  map.music = 'battle';
  map.collision = buildCollision(map.tiles);
  return map;
}

export function createByteburg(): MapData {
  // Larger town — streets, square, landmarks spaced for walking
  const W = 36;
  const H = 28;
  const tiles = createGrid(W, H, TILE.GRASS);
  drawBorder(tiles, TILE.TREE);

  // === Main roads ===
  // Horizontal artery through town square
  fillRect(tiles, 2, 13, W - 4, 2, TILE.PATH);
  // North–south spine
  fillRect(tiles, 12, 2, 2, H - 4, TILE.PATH);
  // Residential lane
  fillRect(tiles, 4, 7, 10, 1, TILE.PATH);
  // Gym approach
  fillRect(tiles, 20, 13, 10, 1, TILE.PATH);
  fillRect(tiles, 25, 8, 2, 6, TILE.PATH);
  // Mart / south lane
  fillRect(tiles, 6, 19, 12, 1, TILE.PATH);

  // === Town square (sand plaza) ===
  fillRect(tiles, 14, 11, 7, 6, TILE.SAND);
  fillRect(tiles, 12, 13, 2, 2, TILE.PATH); // keep spine
  setTile(tiles, 17, 13, TILE.FOUNTAIN);
  setTile(tiles, 15, 12, TILE.BENCH);
  setTile(tiles, 19, 12, TILE.BENCH);
  setTile(tiles, 15, 15, TILE.FLOWER);
  setTile(tiles, 19, 15, TILE.FLOWER);
  setTile(tiles, 16, 15, TILE.FLOWER);
  setTile(tiles, 18, 15, TILE.FLOWER);

  // Fence around square corners
  setTile(tiles, 14, 11, TILE.FENCE);
  setTile(tiles, 20, 11, TILE.FENCE);
  setTile(tiles, 14, 16, TILE.FENCE);
  setTile(tiles, 20, 16, TILE.FENCE);

  // === Buildings ===
  // Player house — NW residential
  drawRoom(tiles, 4, 3, 5, 4);
  fillRect(tiles, 4, 3, 5, 1, TILE.ROOF);
  setTile(tiles, 6, 6, TILE.DOOR);

  // Tech Lab — north of spine
  drawRoom(tiles, 10, 2, 6, 4);
  fillRect(tiles, 10, 2, 6, 1, TILE.ROOF);
  setTile(tiles, 12, 5, TILE.DOOR);

  // Code Center — north of square
  drawRoom(tiles, 14, 7, 5, 4);
  fillRect(tiles, 14, 7, 5, 1, TILE.ROOF);
  setTile(tiles, 16, 10, TILE.DOOR);

  // Tech Mart — southwest of square
  drawRoom(tiles, 8, 16, 5, 4);
  fillRect(tiles, 8, 16, 5, 1, TILE.ROOF);
  setTile(tiles, 10, 19, TILE.DOOR);

  // Frontend Gym — east
  drawRoom(tiles, 24, 8, 6, 5);
  fillRect(tiles, 24, 8, 6, 1, TILE.ROOF);
  setTile(tiles, 26, 12, TILE.DOOR);

  // Decorative trees / flowers (not on roads)
  setTile(tiles, 3, 10, TILE.TREE);
  setTile(tiles, 8, 10, TILE.TREE);
  setTile(tiles, 22, 10, TILE.TREE);
  setTile(tiles, 30, 15, TILE.TREE);
  setTile(tiles, 5, 22, TILE.TREE);
  setTile(tiles, 21, 20, TILE.FLOWER);
  setTile(tiles, 22, 21, TILE.FLOWER);
  setTile(tiles, 9, 9, TILE.FLOWER);

  // Pond SE
  fillRect(tiles, 28, 18, 5, 5, TILE.WATER);
  setTile(tiles, 28, 17, TILE.BRIDGE);
  fillRect(tiles, 27, 17, 3, 1, TILE.PATH);

  // Tall grass training field (south) — only place encounters fire
  fillRect(tiles, 13, 21, 8, 4, TILE.TALL_GRASS);
  // Keep a path edge into grass
  fillRect(tiles, 12, 20, 2, 2, TILE.PATH);

  // Signs (blocking tiles)
  setTile(tiles, 13, 12, TILE.SIGN);
  setTile(tiles, 23, 13, TILE.SIGN);
  setTile(tiles, 11, 6, TILE.SIGN);

  // Exit to Pipeline Route (east)
  setTile(tiles, W - 1, 13, TILE.PATH);
  setTile(tiles, W - 2, 13, TILE.PATH);

  // Hidden bug in flowers
  setTile(tiles, 3, 24, TILE.FLOWER);

  const map: MapData = {
    id: 'byteburg',
    name: 'Byteburg',
    width: W,
    height: H,
    tiles,
    collision: buildCollision(tiles),
    transitions: [
      {
        id: 'to_house',
        from: { x: 6, y: 6 },
        toMapId: 'player_house',
        toPosition: { x: 5, y: 7 },
        toFacing: 'up',
      },
      {
        id: 'to_lab',
        from: { x: 12, y: 5 },
        toMapId: 'tech_lab',
        toPosition: { x: 6, y: 8 },
        toFacing: 'up',
      },
      {
        id: 'to_center',
        from: { x: 16, y: 10 },
        toMapId: 'code_center',
        toPosition: { x: 7, y: 9 },
        toFacing: 'up',
      },
      {
        id: 'to_mart',
        from: { x: 10, y: 19 },
        toMapId: 'tech_mart',
        toPosition: { x: 6, y: 8 },
        toFacing: 'up',
      },
      {
        id: 'to_gym',
        from: { x: 26, y: 12 },
        toMapId: 'frontend_gym',
        toPosition: { x: 5, y: 10 },
        toFacing: 'up',
      },
      {
        id: 'to_route',
        from: { x: W - 1, y: 13 },
        toMapId: 'pipeline_route',
        toPosition: { x: 1, y: 6 },
        toFacing: 'right',
        requiresFlag: 'starter_chosen',
        message: 'You should choose a starter at the Tech Lab first!',
      },
    ],
    interactions: [
      {
        id: 'bb_welcome',
        position: { x: 13, y: 12 },
        kind: 'sign',
        text: 'BYTEBURG\nHome of Beginning Engineers',
      },
      {
        id: 'bb_gym_sign',
        position: { x: 23, y: 13 },
        kind: 'sign',
        text: 'FRONTEND GYM\nChallenge Maya',
      },
      {
        id: 'bb_lab_sign',
        position: { x: 11, y: 6 },
        kind: 'sign',
        text: 'TECH LAB\nProfessor Ada',
      },
      { id: 'bug_byteburg', position: { x: 3, y: 24 }, kind: 'bug', flag: 'bug_byteburg' },
      {
        id: 'chest_bb',
        position: { x: 31, y: 10 },
        kind: 'chest',
        itemId: 'debug_patch',
        flag: 'chest_byteburg',
      },
    ],
    buildings: [
      {
        id: 'house',
        name: 'Your House',
        position: { x: 4, y: 3 },
        width: 5,
        height: 4,
        door: { x: 6, y: 6 },
        color: '#c45c26',
        roofColor: '#8b3a1a',
      },
      {
        id: 'lab',
        name: 'Tech Lab',
        position: { x: 10, y: 2 },
        width: 6,
        height: 4,
        door: { x: 12, y: 5 },
        color: '#6b4c9a',
        roofColor: '#4a3070',
      },
      {
        id: 'center',
        name: 'Code Center',
        position: { x: 14, y: 7 },
        width: 5,
        height: 4,
        door: { x: 16, y: 10 },
        color: '#e8a0bf',
        roofColor: '#c07090',
      },
      {
        id: 'mart',
        name: 'Tech Mart',
        position: { x: 8, y: 16 },
        width: 5,
        height: 4,
        door: { x: 10, y: 19 },
        color: '#2e8b57',
        roofColor: '#1a5c38',
      },
      {
        id: 'gym',
        name: 'Frontend Gym',
        position: { x: 24, y: 8 },
        width: 6,
        height: 5,
        door: { x: 26, y: 12 },
        color: '#61dafb',
        roofColor: '#2a8aad',
      },
    ],
    encounters: {
      chance: 0.14,
      entries: [
        { technologyId: 'html', weight: 48, minLevel: 2, maxLevel: 4 },
        { technologyId: 'css', weight: 42, minLevel: 2, maxLevel: 4 },
        { technologyId: 'react', weight: 8, minLevel: 3, maxLevel: 5 },
        // Starters — ultra rare
        { technologyId: 'javascript', weight: 1, minLevel: 3, maxLevel: 5 },
        { technologyId: 'python', weight: 1, minLevel: 3, maxLevel: 5 },
        { technologyId: 'java', weight: 1, minLevel: 3, maxLevel: 5 },
      ],
    },
    npcIds: [
      'trainer_rookie',
      'sre_dana',
      'byteburg_walker',
      'protest_byteburg',
      'protest_byteburg_2',
      'joke_gf',
      'joke_hair',
      'ujjwal_blocker',
      'yashasvi',
      'jai',
    ],
    music: 'city',
    theme: 'byteburg',
  };
  map.collision = buildCollision(tiles);
  return map;
}

export function createPipelineRoute(): MapData {
  const W = 40;
  const H = 14;
  const tiles = createGrid(W, H, TILE.GRASS);
  drawBorder(tiles, TILE.TREE);

  // Main path
  fillRect(tiles, 1, 5, W - 2, 3, TILE.PATH);

  // Tall grass patches (touch the main path for reliable encounters)
  fillRect(tiles, 5, 2, 5, 4, TILE.TALL_GRASS);
  fillRect(tiles, 14, 7, 6, 4, TILE.TALL_GRASS);
  fillRect(tiles, 24, 2, 5, 4, TILE.TALL_GRASS);
  fillRect(tiles, 33, 7, 4, 4, TILE.TALL_GRASS);

  // Keep path clear through grass edges
  fillRect(tiles, 1, 5, W - 2, 3, TILE.PATH);

  // Water + bridge
  fillRect(tiles, 18, 1, 3, H - 2, TILE.WATER);
  fillRect(tiles, 18, 5, 3, 3, TILE.BRIDGE);

  // Trees clusters
  fillRect(tiles, 10, 9, 2, 2, TILE.TREE);
  fillRect(tiles, 28, 2, 2, 2, TILE.TREE);

  // Openings
  setTile(tiles, 0, 6, TILE.PATH);
  setTile(tiles, 0, 7, TILE.PATH);
  setTile(tiles, W - 1, 6, TILE.PATH);
  setTile(tiles, W - 1, 7, TILE.PATH);

  return {
    id: 'pipeline_route',
    name: 'Pipeline Route',
    width: W,
    height: H,
    tiles,
    collision: buildCollision(tiles),
    transitions: [
      {
        id: 'to_bb',
        from: { x: 0, y: 6 },
        toMapId: 'byteburg',
        toPosition: { x: 34, y: 13 },
        toFacing: 'left',
      },
      {
        id: 'to_bb2',
        from: { x: 0, y: 7 },
        toMapId: 'byteburg',
        toPosition: { x: 34, y: 14 },
        toFacing: 'left',
      },
      {
        id: 'to_sh',
        from: { x: W - 1, y: 6 },
        toMapId: 'stackhaven',
        toPosition: { x: 1, y: 10 },
        requiresFlag: 'badge_frontend',
        message: 'A strong forcefield... Earn the Frontend Badge first!',
      },
      {
        id: 'to_sh2',
        from: { x: W - 1, y: 7 },
        toMapId: 'stackhaven',
        toPosition: { x: 1, y: 11 },
        requiresFlag: 'badge_frontend',
        message: 'A strong forcefield... Earn the Frontend Badge first!',
      },
    ],
    interactions: [
      { id: 'route_logs', position: { x: 12, y: 4 }, kind: 'inspect', text: 'ERROR 404: /api/v2/checkout not routed from v1.', flag: 'inspected_route_logs' },
      { id: 'bug_route', position: { x: 22, y: 10 }, kind: 'bug', flag: 'bug_route' },
      { id: 'chest_route', position: { x: 35, y: 3 }, kind: 'chest', itemId: 'memory_cache', flag: 'chest_route' },
      { id: 'route_sign_i', position: { x: 15, y: 4 }, kind: 'sign', text: 'Pipeline Route' },
    ],
    buildings: [],
    encounters: {
      chance: 0.22,
      entries: [
        { technologyId: 'react', weight: 28, minLevel: 5, maxLevel: 8 },
        { technologyId: 'node', weight: 24, minLevel: 5, maxLevel: 8 },
        { technologyId: 'docker', weight: 18, minLevel: 6, maxLevel: 9 },
        { technologyId: 'redis', weight: 16, minLevel: 5, maxLevel: 8 },
        { technologyId: 'typescript', weight: 10, minLevel: 5, maxLevel: 8 },
        { technologyId: 'go', weight: 5, minLevel: 6, maxLevel: 9, nightOnly: true },
        // Starters — ultra rare (~1% each)
        { technologyId: 'javascript', weight: 1, minLevel: 4, maxLevel: 7 },
        { technologyId: 'python', weight: 1, minLevel: 4, maxLevel: 7 },
        { technologyId: 'java', weight: 1, minLevel: 5, maxLevel: 8 },
      ],
    },
    npcIds: [
      'route_frontend',
      'route_backend',
      'route_devops',
      'route_data',
      'route_debugger',
      'route_sign',
      'joke_manager',
    ],
    music: 'route',
    theme: 'route',
  };
}

export function createCloudCenter(): MapData {
  const map = makeInterior('cloud_center', 'Cloud Center', 13, 10, 'stackhaven', { x: 6, y: 9 });
  fillRect(map.tiles, 2, 2, 9, 3, TILE.FLOOR_DARK);
  setTile(map.tiles, 5, 2, TILE.COMPUTER);
  setTile(map.tiles, 6, 2, TILE.COMPUTER);
  setTile(map.tiles, 7, 2, TILE.COMPUTER);
  map.interactions = [
    {
      id: 'cloud_console',
      position: { x: 6, y: 2 },
      kind: 'computer',
      text: 'Region status: us-east healthy. Auto-scaling armed.',
    },
    {
      id: 'cloud_chest',
      position: { x: 10, y: 3 },
      kind: 'chest',
      itemId: 'cloud_credit',
      flag: 'chest_cloud_center',
    },
  ];
  map.npcIds = ['engineer_cloud', 'nurse_stack'];
  map.collision = buildCollision(map.tiles);
  return map;
}

export function createAiLab(): MapData {
  const map = makeInterior('ai_lab', 'AI Research Lab', 13, 10, 'stackhaven', { x: 23, y: 8 });
  fillRect(map.tiles, 2, 2, 9, 4, TILE.FLOOR_DARK);
  fillRect(map.tiles, 5, 3, 3, 2, TILE.CARPET);
  map.interactions = [
    {
      id: 'gpu_rack',
      position: { x: 3, y: 2 },
      kind: 'info',
      text: 'GPU rack: 8x accelerators training overnight jobs.',
    },
    {
      id: 'model_board',
      position: { x: 9, y: 2 },
      kind: 'info',
      text: 'Eval board: hallucination rate 3.2% — verify outputs.',
    },
  ];
  map.npcIds = ['ai_researcher', 'trainer_lab_ai'];
  map.collision = buildCollision(map.tiles);
  return map;
}

export function createTechMarket(): MapData {
  const map = makeInterior('tech_market', 'Tech Market', 11, 9, 'stackhaven', { x: 12, y: 20 });
  fillRect(map.tiles, 2, 2, 7, 2, TILE.FLOOR_DARK);
  map.npcIds = ['market_clerk'];
  map.collision = buildCollision(map.tiles);
  return map;
}

export function createProductionGym(): MapData {
  const map = makeInterior('production_gym', 'Production Gym', 13, 14, 'stackhaven', { x: 18, y: 8 });
  fillRect(map.tiles, 2, 2, 9, 9, TILE.FLOOR_DARK);
  fillRect(map.tiles, 5, 5, 3, 3, TILE.CARPET);
  // Challenge pads
  setTile(map.tiles, 3, 10, TILE.CARPET);
  setTile(map.tiles, 9, 10, TILE.CARPET);
  map.interactions = [
    {
      id: 'prod_banner',
      position: { x: 6, y: 3 },
      kind: 'sign',
      text: 'Production Gym — Backend · Database · Docker · Kubernetes',
    },
  ];
  map.npcIds = ['gym_trainer_be', 'gym_trainer_infra', 'arjun'];
  map.music = 'battle';
  map.collision = buildCollision(map.tiles);
  return map;
}

export function createDevopsTower(): MapData {
  const map = makeInterior('devops_tower', 'DevOps Tower', 13, 12, 'stackhaven', { x: 20, y: 14 });
  fillRect(map.tiles, 2, 2, 9, 7, TILE.FLOOR_DARK);
  fillRect(map.tiles, 5, 4, 3, 3, TILE.CARPET);
  setTile(map.tiles, 3, 3, TILE.COMPUTER);
  map.interactions = [
    {
      id: 'k8s_panel',
      position: { x: 6, y: 2 },
      kind: 'info',
      text: 'Cluster status: 42 pods healthy. Rolling update ready.',
    },
    {
      id: 'ci_pipeline',
      position: { x: 3, y: 3 },
      kind: 'computer',
      text: 'CI pipeline: build → test → scan → deploy.',
    },
    {
      id: 'tower_chest',
      position: { x: 10, y: 3 },
      kind: 'chest',
      itemId: 'architecture_token',
      flag: 'chest_devops_tower',
    },
  ];
  map.npcIds = ['devops_sentry', 'trainer_tower_k8s'];
  map.collision = buildCollision(map.tiles);
  return map;
}

export function createDatabaseDistrict(): MapData {
  const map = makeInterior(
    'database_district',
    'Database District',
    13,
    11,
    'stackhaven',
    { x: 8, y: 16 },
  );
  fillRect(map.tiles, 2, 2, 9, 5, TILE.FLOOR_DARK);
  fillRect(map.tiles, 5, 4, 3, 2, TILE.CARPET);
  setTile(map.tiles, 4, 2, TILE.COMPUTER);
  map.interactions = [
    {
      id: 'sql_terminal',
      position: { x: 4, y: 2 },
      kind: 'computer',
      text: 'Migration console online. Failed job: add_users_email_not_null.',
    },
    {
      id: 'index_board',
      position: { x: 8, y: 2 },
      kind: 'info',
      text: 'Index advice: avoid SELECT * on hot paths.',
    },
    {
      id: 'db_chest',
      position: { x: 10, y: 5 },
      kind: 'chest',
      itemId: 'refactor_token',
      flag: 'chest_database_district',
    },
  ];
  map.npcIds = ['db_admin', 'trainer_dba'];
  map.collision = buildCollision(map.tiles);
  return map;
}

export function createTournamentArena(): MapData {
  const map = makeInterior(
    'tournament_arena',
    'Tournament Arena',
    11,
    10,
    'stackhaven',
    { x: 13, y: 6 },
  );
  fillRect(map.tiles, 2, 2, 7, 5, TILE.SAND);
  fillRect(map.tiles, 4, 3, 3, 3, TILE.CARPET);
  map.interactions = [
    {
      id: 'arena_rules',
      position: { x: 5, y: 2 },
      kind: 'sign',
      text: 'Tournament rules: no escaping. Bring your best stack.',
    },
  ];
  map.npcIds = ['arena_champ'];
  map.music = 'battle';
  map.collision = buildCollision(map.tiles);
  return map;
}

export function createStackhaven(): MapData {
  const W = 32;
  const H = 24;
  const tiles = createGrid(W, H, TILE.GRASS);
  drawBorder(tiles, TILE.TREE);

  // Arterial paths
  fillRect(tiles, 1, 10, 30, 3, TILE.PATH);
  fillRect(tiles, 5, 4, 2, 14, TILE.PATH);
  fillRect(tiles, 14, 4, 2, 14, TILE.PATH);
  fillRect(tiles, 19, 4, 2, 12, TILE.PATH);
  fillRect(tiles, 7, 14, 8, 2, TILE.PATH);

  // Water feature
  fillRect(tiles, 26, 14, 4, 5, TILE.WATER);
  setTile(tiles, 25, 16, TILE.BRIDGE);

  // Tall grass challenge pockets
  fillRect(tiles, 8, 18, 5, 3, TILE.TALL_GRASS);
  fillRect(tiles, 22, 18, 4, 3, TILE.TALL_GRASS);

  // South path → Vibe Causeway → CuckCoder
  fillRect(tiles, 24, 18, 2, 5, TILE.PATH);
  setTile(tiles, 24, H - 1, TILE.PATH);
  setTile(tiles, 25, H - 1, TILE.PATH);

  // Cloud Center
  drawRoom(tiles, 4, 5, 5, 4);
  setTile(tiles, 6, 8, TILE.DOOR);

  // Database District
  drawRoom(tiles, 6, 12, 5, 4);
  setTile(tiles, 8, 15, TILE.DOOR);

  // Tech Market
  drawRoom(tiles, 10, 16, 5, 4);
  setTile(tiles, 12, 19, TILE.DOOR);

  // Production Gym
  drawRoom(tiles, 16, 3, 6, 5);
  setTile(tiles, 18, 7, TILE.DOOR);

  // DevOps Tower
  drawRoom(tiles, 18, 9, 5, 5);
  setTile(tiles, 20, 13, TILE.DOOR);

  // AI Lab
  drawRoom(tiles, 21, 4, 5, 4);
  setTile(tiles, 23, 7, TILE.DOOR);

  // Tournament Arena entrance
  fillRect(tiles, 12, 3, 3, 3, TILE.SAND);
  setTile(tiles, 13, 5, TILE.DOOR);

  // Diversity Arena
  drawRoom(tiles, 1, 15, 5, 4);
  setTile(tiles, 3, 18, TILE.DOOR);

  // Flowers / district markers
  setTile(tiles, 3, 11, TILE.FLOWER);
  setTile(tiles, 24, 11, TILE.FLOWER);

  setTile(tiles, 0, 10, TILE.PATH);
  setTile(tiles, 0, 11, TILE.PATH);
  setTile(tiles, 0, 12, TILE.PATH);
  // East exit → Orchestration Road (post-Production Badge)
  setTile(tiles, W - 1, 10, TILE.PATH);
  setTile(tiles, W - 1, 11, TILE.PATH);
  setTile(tiles, W - 1, 12, TILE.PATH);

  return {
    id: 'stackhaven',
    name: 'Stackhaven',
    width: W,
    height: H,
    tiles,
    collision: buildCollision(tiles),
    transitions: [
      { id: 'to_route', from: { x: 0, y: 10 }, toMapId: 'pipeline_route', toPosition: { x: 38, y: 6 } },
      { id: 'to_route2', from: { x: 0, y: 11 }, toMapId: 'pipeline_route', toPosition: { x: 38, y: 7 } },
      { id: 'to_route3', from: { x: 0, y: 12 }, toMapId: 'pipeline_route', toPosition: { x: 38, y: 7 } },
      {
        id: 'to_ops_road',
        from: { x: W - 1, y: 10 },
        toMapId: 'route_ops',
        toPosition: { x: 1, y: 5 },
        toFacing: 'right',
        requiresFlag: 'badge_production',
        message: 'Orchestration Road sealed. Earn the Production Badge!',
      },
      {
        id: 'to_ops_road2',
        from: { x: W - 1, y: 11 },
        toMapId: 'route_ops',
        toPosition: { x: 1, y: 6 },
        toFacing: 'right',
        requiresFlag: 'badge_production',
        message: 'Orchestration Road sealed. Earn the Production Badge!',
      },
      {
        id: 'to_ops_road3',
        from: { x: W - 1, y: 12 },
        toMapId: 'route_ops',
        toPosition: { x: 1, y: 6 },
        toFacing: 'right',
        requiresFlag: 'badge_production',
        message: 'Orchestration Road sealed. Earn the Production Badge!',
      },
      { id: 'to_cloud', from: { x: 6, y: 8 }, toMapId: 'cloud_center', toPosition: { x: 6, y: 8 } },
      {
        id: 'to_db',
        from: { x: 8, y: 15 },
        toMapId: 'database_district',
        toPosition: { x: 6, y: 9 },
      },
      { id: 'to_market', from: { x: 12, y: 19 }, toMapId: 'tech_market', toPosition: { x: 5, y: 7 } },
      { id: 'to_pgym', from: { x: 18, y: 7 }, toMapId: 'production_gym', toPosition: { x: 6, y: 12 } },
      { id: 'to_devops', from: { x: 20, y: 13 }, toMapId: 'devops_tower', toPosition: { x: 6, y: 10 } },
      { id: 'to_ai', from: { x: 23, y: 7 }, toMapId: 'ai_lab', toPosition: { x: 6, y: 8 } },
      {
        id: 'to_arena',
        from: { x: 13, y: 5 },
        toMapId: 'tournament_arena',
        toPosition: { x: 5, y: 8 },
      },
      {
        id: 'to_diversity',
        from: { x: 3, y: 18 },
        toMapId: 'diversity_arena',
        toPosition: { x: 6, y: 10 },
        toFacing: 'up',
      },
      {
        id: 'to_vibe_road',
        from: { x: 24, y: H - 1 },
        toMapId: 'route_vibe',
        toPosition: { x: 17, y: 1 },
        toFacing: 'down',
        requiresFlag: 'badge_frontend',
        message: 'Vibe Causeway sealed. Earn the Frontend Badge!',
      },
      {
        id: 'to_vibe_road2',
        from: { x: 25, y: H - 1 },
        toMapId: 'route_vibe',
        toPosition: { x: 18, y: 1 },
        toFacing: 'down',
        requiresFlag: 'badge_frontend',
        message: 'Vibe Causeway sealed. Earn the Frontend Badge!',
      },
    ],
    interactions: [
      { id: 'bug_stackhaven', position: { x: 28, y: 20 }, kind: 'bug', flag: 'bug_stackhaven' },
      {
        id: 'chest_sh',
        position: { x: 28, y: 12 },
        kind: 'chest',
        itemId: 'xp_booster',
        flag: 'chest_stackhaven',
      },
      {
        id: 'diversity_sign',
        position: { x: 6, y: 17 },
        kind: 'sign',
        text: 'DIVERSITY ARENA — Women in tech. POSH literacy. Real battles.',
      },
      {
        id: 'cuckcoder_sign',
        position: { x: 23, y: 17 },
        kind: 'sign',
        text: 'South → Vibe Causeway → CUCKCODER — Pre-revenue AI SaaS. Maximum hubris.',
      },
      {
        id: 'district_sign_db',
        position: { x: 9, y: 11 },
        kind: 'sign',
        text: 'DATABASE DISTRICT — Migrations, indexes, and ACID debates.',
      },
      {
        id: 'district_sign_ops',
        position: { x: 19, y: 8 },
        kind: 'sign',
        text: 'DEVOPS TOWER — Containers, clusters, and calm under pressure.',
      },
      {
        id: 'district_sign_ai',
        position: { x: 24, y: 9 },
        kind: 'sign',
        text: 'AI RESEARCH LAB — Models hallucinate. Engineers verify.',
      },
      {
        id: 'arena_sign',
        position: { x: 12, y: 6 },
        kind: 'sign',
        text: 'Tournament Arena — Advanced battles ahead.',
      },
      {
        id: 'welcome_sh',
        position: { x: 2, y: 11 },
        kind: 'sign',
        text: 'STACKHAVEN — Ship it to production.',
      },
    ],
    buildings: [
      {
        id: 'cloud',
        name: 'Cloud Center',
        position: { x: 4, y: 5 },
        width: 5,
        height: 4,
        door: { x: 6, y: 8 },
        color: '#ff9900',
      },
      {
        id: 'db',
        name: 'Database District',
        position: { x: 6, y: 12 },
        width: 5,
        height: 4,
        door: { x: 8, y: 15 },
        color: '#336791',
      },
      {
        id: 'market',
        name: 'Tech Market',
        position: { x: 10, y: 16 },
        width: 5,
        height: 4,
        door: { x: 12, y: 19 },
        color: '#8e44ad',
      },
      {
        id: 'pgym',
        name: 'Production Gym',
        position: { x: 16, y: 3 },
        width: 6,
        height: 5,
        door: { x: 18, y: 7 },
        color: '#e74c3c',
      },
      {
        id: 'devops',
        name: 'DevOps Tower',
        position: { x: 18, y: 9 },
        width: 5,
        height: 5,
        door: { x: 20, y: 13 },
        color: '#326ce5',
      },
      {
        id: 'ai',
        name: 'AI Lab',
        position: { x: 21, y: 4 },
        width: 5,
        height: 4,
        door: { x: 23, y: 7 },
        color: '#ee4c2c',
      },
      {
        id: 'arena',
        name: 'Arena',
        position: { x: 12, y: 3 },
        width: 3,
        height: 3,
        door: { x: 13, y: 5 },
        color: '#c4a574',
      },
      {
        id: 'diversity',
        name: 'Diversity Arena',
        position: { x: 1, y: 15 },
        width: 5,
        height: 4,
        door: { x: 3, y: 18 },
        color: '#9B59B6',
        roofColor: '#6C3483',
      },
    ],
    encounters: {
      chance: 0.14,
      entries: [
        { technologyId: 'docker', weight: 18, minLevel: 11, maxLevel: 15 },
        { technologyId: 'postgresql', weight: 18, minLevel: 11, maxLevel: 15 },
        { technologyId: 'kafka', weight: 14, minLevel: 12, maxLevel: 16 },
        { technologyId: 'aws', weight: 12, minLevel: 13, maxLevel: 17 },
        { technologyId: 'pytorch', weight: 12, minLevel: 12, maxLevel: 16 },
        { technologyId: 'terraform', weight: 8, minLevel: 13, maxLevel: 17 },
        { technologyId: 'kubernetes', weight: 6, minLevel: 15, maxLevel: 18 },
        { technologyId: 'langchain', weight: 12, minLevel: 13, maxLevel: 17, nightOnly: true },
      ],
    },
    npcIds: [
      'oncall_rex',
      'trainer_ai',
      'trainer_cloud_street',
      'trainer_architect',
      'protest_stackhaven',
      'joke_physique',
      'joke_social',
      'joke_affair',
      'utkarsh',
      'rishabh',
    ],
    music: 'city',
    theme: 'stackhaven',
  };
}
