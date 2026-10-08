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

function makeTown(
  id: string,
  name: string,
  theme: MapData['theme'],
  opts: {
    west?: { mapId: string; x: number; y: number; flag?: string; message?: string };
    east?: { mapId: string; x: number; y: number; flag?: string; message?: string };
    buildings: Array<{
      bx: number;
      by: number;
      bw: number;
      bh: number;
      doorLocalX: number;
      toMapId: string;
      toPos: { x: number; y: number };
      label: string;
      color: string;
    }>;
    npcIds: string[];
    encounters?: MapData['encounters'];
  },
): MapData {
  const W = 28;
  const H = 20;
  const tiles = createGrid(W, H, TILE.GRASS);
  drawBorder(tiles, TILE.TREE);
  fillRect(tiles, 1, 9, W - 2, 2, TILE.PATH);
  fillRect(tiles, 12, 2, 2, H - 4, TILE.PATH);
  fillRect(tiles, 6, 6, 4, 3, TILE.CARPET);
  fillRect(tiles, 18, 14, 5, 3, TILE.TALL_GRASS);

  const transitions: MapData['transitions'] = [];
  const buildings: MapData['buildings'] = [];
  const interactions: MapData['interactions'] = [
    {
      id: `${id}_sign`,
      position: { x: 13, y: 8 },
      kind: 'sign',
      text: `Welcome to ${name}`,
    },
  ];

  if (opts.west) {
    setTile(tiles, 0, 9, TILE.PATH);
    setTile(tiles, 0, 10, TILE.PATH);
    transitions.push(
      {
        id: `${id}_west`,
        from: { x: 0, y: 9 },
        toMapId: opts.west.mapId,
        toPosition: { x: opts.west.x, y: opts.west.y },
        toFacing: 'left',
        requiresFlag: opts.west.flag,
        message: opts.west.message,
      },
      {
        id: `${id}_west2`,
        from: { x: 0, y: 10 },
        toMapId: opts.west.mapId,
        toPosition: { x: opts.west.x, y: opts.west.y },
        toFacing: 'left',
        requiresFlag: opts.west.flag,
        message: opts.west.message,
      },
    );
  }
  if (opts.east) {
    setTile(tiles, W - 1, 9, TILE.PATH);
    setTile(tiles, W - 1, 10, TILE.PATH);
    transitions.push(
      {
        id: `${id}_east`,
        from: { x: W - 1, y: 9 },
        toMapId: opts.east.mapId,
        toPosition: { x: opts.east.x, y: opts.east.y },
        toFacing: 'right',
        requiresFlag: opts.east.flag,
        message: opts.east.message,
      },
      {
        id: `${id}_east2`,
        from: { x: W - 1, y: 10 },
        toMapId: opts.east.mapId,
        toPosition: { x: opts.east.x, y: opts.east.y },
        toFacing: 'right',
        requiresFlag: opts.east.flag,
        message: opts.east.message,
      },
    );
  }

  for (const b of opts.buildings) {
    drawRoom(tiles, b.bx, b.by, b.bw, b.bh);
    const doorX = b.bx + b.doorLocalX;
    const doorY = b.by + b.bh - 1;
    setTile(tiles, doorX, doorY, TILE.DOOR);
    transitions.push({
      id: `to_${b.toMapId}`,
      from: { x: doorX, y: doorY },
      toMapId: b.toMapId,
      toPosition: b.toPos,
      toFacing: 'up',
    });
    buildings.push({
      id: b.toMapId,
      name: b.label,
      position: { x: b.bx, y: b.by },
      width: b.bw,
      height: b.bh,
      door: { x: doorX, y: doorY },
      color: b.color,
    });
  }

  return {
    id,
    name,
    width: W,
    height: H,
    tiles,
    collision: buildCollision(tiles),
    transitions,
    interactions,
    buildings,
    npcIds: opts.npcIds,
    music: 'city',
    theme,
    encounters: opts.encounters,
  };
}

function makeRoute(
  id: string,
  name: string,
  west: { mapId: string; x: number; y: number },
  east: { mapId: string; x: number; y: number; flag?: string; message?: string },
  encounters: MapData['encounters'],
  npcIds: string[],
): MapData {
  const W = 36;
  const H = 12;
  const tiles = createGrid(W, H, TILE.GRASS);
  drawBorder(tiles, TILE.TREE);
  fillRect(tiles, 1, 5, W - 2, 2, TILE.PATH);
  fillRect(tiles, 4, 2, 6, 3, TILE.TALL_GRASS);
  fillRect(tiles, 16, 8, 8, 2, TILE.TALL_GRASS);
  fillRect(tiles, 26, 2, 5, 3, TILE.TALL_GRASS);
  setTile(tiles, 0, 5, TILE.PATH);
  setTile(tiles, 0, 6, TILE.PATH);
  setTile(tiles, W - 1, 5, TILE.PATH);
  setTile(tiles, W - 1, 6, TILE.PATH);

  return {
    id,
    name,
    width: W,
    height: H,
    tiles,
    collision: buildCollision(tiles),
    transitions: [
      {
        id: `${id}_w`,
        from: { x: 0, y: 5 },
        toMapId: west.mapId,
        toPosition: { x: west.x, y: west.y },
        toFacing: 'left',
      },
      {
        id: `${id}_w2`,
        from: { x: 0, y: 6 },
        toMapId: west.mapId,
        toPosition: { x: west.x, y: west.y },
        toFacing: 'left',
      },
      {
        id: `${id}_e`,
        from: { x: W - 1, y: 5 },
        toMapId: east.mapId,
        toPosition: { x: east.x, y: east.y },
        toFacing: 'right',
        requiresFlag: east.flag,
        message: east.message,
      },
      {
        id: `${id}_e2`,
        from: { x: W - 1, y: 6 },
        toMapId: east.mapId,
        toPosition: { x: east.x, y: east.y },
        toFacing: 'right',
        requiresFlag: east.flag,
        message: east.message,
      },
    ],
    interactions: [
      { id: `${id}_sign`, position: { x: 17, y: 4 }, kind: 'sign', text: name },
    ],
    buildings: [],
    npcIds,
    music: 'route',
    theme: 'route',
    encounters,
  };
}

function makeInteriorGym(
  id: string,
  name: string,
  exitMap: string,
  exitPos: { x: number; y: number },
  npcIds: string[],
): MapData {
  const W = 11;
  const H = 12;
  const tiles = createGrid(W, H, TILE.WALL);
  fillRect(tiles, 1, 1, W - 2, H - 2, TILE.FLOOR_DARK);
  fillRect(tiles, 4, 4, 3, 3, TILE.CARPET);
  setTile(tiles, 5, H - 1, TILE.DOOR);
  return {
    id,
    name,
    width: W,
    height: H,
    tiles,
    collision: buildCollision(tiles),
    transitions: [
      {
        id: `${id}_exit`,
        from: { x: 5, y: H - 1 },
        toMapId: exitMap,
        toPosition: exitPos,
        toFacing: 'down',
      },
    ],
    interactions: [
      {
        id: `${id}_banner`,
        position: { x: 5, y: 2 },
        kind: 'sign',
        text: `${name} — prove your stack.`,
      },
    ],
    buildings: [],
    npcIds,
    music: 'battle',
    isInterior: true,
    parentMapId: exitMap,
    theme: 'interior',
  };
}

function makeCenterMartPair(
  prefix: string,
  parent: string,
  exitPos: { x: number; y: number },
  nurseId: string,
  clerkId: string,
): { center: MapData; mart: MapData } {
  const center: MapData = {
    id: `${prefix}_center`,
    name: 'Code Center',
    width: 11,
    height: 9,
    tiles: (() => {
      const t = createGrid(11, 9, TILE.WALL);
      fillRect(t, 1, 1, 9, 7, TILE.FLOOR);
      fillRect(t, 3, 2, 5, 2, TILE.CARPET);
      fillRect(t, 3, 3, 5, 1, TILE.COUNTER);
      setTile(t, 5, 8, TILE.DOOR);
      setTile(t, 1, 2, TILE.COMPUTER);
      return t;
    })(),
    collision: [],
    transitions: [
      {
        id: `${prefix}_center_exit`,
        from: { x: 5, y: 8 },
        toMapId: parent,
        toPosition: exitPos,
        toFacing: 'down',
      },
    ],
    interactions: [
      {
        id: `${prefix}_pc`,
        position: { x: 1, y: 2 },
        kind: 'computer',
        text: 'Tech Storage Terminal',
      },
    ],
    buildings: [],
    npcIds: [nurseId],
    music: 'city',
    isInterior: true,
    parentMapId: parent,
    theme: 'interior',
  };
  center.collision = buildCollision(center.tiles);

  const mart: MapData = {
    id: `${prefix}_mart`,
    name: 'Tech Mart',
    width: 9,
    height: 8,
    tiles: (() => {
      const t = createGrid(9, 8, TILE.WALL);
      fillRect(t, 1, 1, 7, 6, TILE.FLOOR);
      fillRect(t, 1, 1, 7, 1, TILE.SHELF);
      fillRect(t, 2, 3, 5, 1, TILE.COUNTER);
      setTile(t, 4, 7, TILE.DOOR);
      return t;
    })(),
    collision: [],
    transitions: [
      {
        id: `${prefix}_mart_exit`,
        from: { x: 4, y: 7 },
        toMapId: parent,
        toPosition: { x: exitPos.x - 4, y: exitPos.y },
        toFacing: 'down',
      },
    ],
    interactions: [],
    buildings: [],
    npcIds: [clerkId],
    music: 'city',
    isInterior: true,
    parentMapId: parent,
    theme: 'interior',
  };
  // Fix mart exit to dedicated door coords set by caller via transitions override later if needed
  mart.collision = buildCollision(mart.tiles);
  return { center, mart };
}

/** DevOps town */
export function createContainerCove(): MapData {
  const map = makeTown('container_cove', 'Container Cove', 'stackhaven', {
    west: {
      mapId: 'route_ops',
      x: 34,
      y: 5,
    },
    east: {
      mapId: 'route_legacy',
      x: 1,
      y: 5,
      flag: 'badge_devops',
      message: 'A rolling-update gate. Earn the DevOps Badge first!',
    },
    buildings: [
      {
        bx: 4,
        by: 3,
        bw: 5,
        bh: 4,
        doorLocalX: 2,
        toMapId: 'cove_center',
        toPos: { x: 5, y: 7 },
        label: 'Code Center',
        color: '#e8a0bf',
      },
      {
        bx: 16,
        by: 3,
        bw: 5,
        bh: 4,
        doorLocalX: 2,
        toMapId: 'cove_mart',
        toPos: { x: 4, y: 6 },
        label: 'Tech Mart',
        color: '#2E8B57',
      },
      {
        bx: 10,
        by: 12,
        bw: 6,
        bh: 5,
        doorLocalX: 3,
        toMapId: 'devops_gym',
        toPos: { x: 5, y: 10 },
        label: 'DevOps Gym',
        color: '#326CE5',
      },
    ],
    npcIds: [
      'cove_sre',
      'cove_nurse_spot',
      'trainer_cove_yaml',
      'protest_cove',
      'cove_quest_giver',
      'joke_increment',
    ],
    encounters: {
      chance: 0.12,
      entries: [
        { technologyId: 'docker', weight: 35, minLevel: 18, maxLevel: 22 },
        { technologyId: 'kubernetes', weight: 25, minLevel: 19, maxLevel: 23 },
        { technologyId: 'terraform', weight: 20, minLevel: 18, maxLevel: 22 },
        { technologyId: 'redis', weight: 15, minLevel: 17, maxLevel: 21 },
        { technologyId: 'go', weight: 5, minLevel: 20, maxLevel: 24 },
      ],
    },
  });
  map.interactions.push({
    id: 'cove_crash_logs',
    position: { x: 9, y: 14 },
    kind: 'inspect',
    text: 'CrashLoopBackOff × 412. Last state: OOMKilled. heap = 2Gi, limit = 512Mi. Nice.',
    flag: 'inspected_cove_logs',
  });
  return map;
}

export function createLegacyCrossing(): MapData {
  const map = makeTown('legacy_crossing', 'Legacy Crossing', 'byteburg', {
    west: { mapId: 'route_legacy', x: 34, y: 5 },
    east: {
      mapId: 'route_service',
      x: 1,
      y: 5,
      flag: 'badge_legacy',
      message: 'Punch-card barrier. Earn the Legacy Badge!',
    },
    buildings: [
      {
        bx: 4,
        by: 3,
        bw: 5,
        bh: 4,
        doorLocalX: 2,
        toMapId: 'legacy_center',
        toPos: { x: 5, y: 7 },
        label: 'Code Center',
        color: '#e8a0bf',
      },
      {
        bx: 16,
        by: 3,
        bw: 5,
        bh: 4,
        doorLocalX: 2,
        toMapId: 'legacy_mart',
        toPos: { x: 4, y: 6 },
        label: 'Tech Mart',
        color: '#8B6914',
      },
      {
        bx: 10,
        by: 12,
        bw: 6,
        bh: 5,
        doorLocalX: 3,
        toMapId: 'legacy_gym',
        toPos: { x: 5, y: 10 },
        label: 'Legacy Gym',
        color: '#005CA5',
      },
    ],
    npcIds: ['legacy_elder', 'trainer_legacy_batch', 'legacy_quest_giver', 'joke_weekend'],
    encounters: {
      chance: 0.14,
      entries: [
        { technologyId: 'cobol', weight: 40, minLevel: 20, maxLevel: 24 },
        { technologyId: 'mainframe', weight: 25, minLevel: 21, maxLevel: 25 },
        { technologyId: 'java', weight: 20, minLevel: 19, maxLevel: 23 },
        { technologyId: 'postgresql', weight: 15, minLevel: 20, maxLevel: 24 },
      ],
    },
  });
  map.interactions.push(
    {
      id: 'legacy_jcl_board',
      position: { x: 15, y: 9 },
      kind: 'inspect',
      text: 'JCL fragment: //PAYROLL EXEC PGM=COB01  COND=(0,NE)  Last ABEND: S0C7 at offset 0x1A2.',
      flag: 'inspected_legacy_jcl',
    },
    {
      id: 'legacy_punch_chest',
      position: { x: 20, y: 15 },
      kind: 'chest',
      itemId: 'refactor_token',
      flag: 'chest_legacy_punch',
    },
  );
  return map;
}

export function createServiceSquare(): MapData {
  const map = makeTown('service_square', 'Service Square', 'byteburg', {
    west: { mapId: 'route_service', x: 34, y: 5 },
    east: {
      mapId: 'route_faang',
      x: 1,
      y: 5,
      flag: 'badge_service',
      message: 'Benching gate. Earn the Service Badge to leave the campus!',
    },
    buildings: [
      {
        bx: 4,
        by: 3,
        bw: 5,
        bh: 4,
        doorLocalX: 2,
        toMapId: 'service_center',
        toPos: { x: 5, y: 7 },
        label: 'Code Center',
        color: '#e8a0bf',
      },
      {
        bx: 16,
        by: 3,
        bw: 5,
        bh: 4,
        doorLocalX: 2,
        toMapId: 'service_mart',
        toPos: { x: 4, y: 6 },
        label: 'Tech Mart',
        color: '#2E8B57',
      },
      {
        bx: 10,
        by: 12,
        bw: 6,
        bh: 5,
        doorLocalX: 3,
        toMapId: 'service_gym',
        toPos: { x: 5, y: 10 },
        label: 'Billing Gym',
        color: '#00A1E0',
      },
    ],
    npcIds: [
      'service_tcs',
      'service_cognizant',
      'service_infosys',
      'trainer_service_bench',
      'service_quest_hr',
      'service_compliance',
      'joke_standup',
      'joke_affair_2',
    ],
    encounters: {
      chance: 0.1,
      entries: [
        { technologyId: 'salesforce', weight: 35, minLevel: 22, maxLevel: 26 },
        { technologyId: 'java', weight: 25, minLevel: 21, maxLevel: 25 },
        { technologyId: 'angular', weight: 20, minLevel: 22, maxLevel: 26 },
        { technologyId: 'spring_boot', weight: 20, minLevel: 23, maxLevel: 27 },
      ],
    },
  });
  map.interactions.push({
    id: 'service_timesheet',
    position: { x: 11, y: 8 },
    kind: 'inspect',
    text: 'Timesheet draft: "Architecture alignment — 40h. Deliverable: README.md (1 paragraph)."',
    flag: 'inspected_timesheet',
  });
  return map;
}

export function createFaangHeights(): MapData {
  const map = makeTown('faang_heights', 'FAANG Heights', 'stackhaven', {
    west: { mapId: 'route_faang', x: 34, y: 5 },
    east: {
      mapId: 'layoff_tower',
      x: 7,
      y: 26,
      flag: 'badge_faang',
      message: 'LayOff Tower is invitation-only. Earn the FAANG Badge.',
    },
    buildings: [
      {
        bx: 4,
        by: 3,
        bw: 5,
        bh: 4,
        doorLocalX: 2,
        toMapId: 'faang_center',
        toPos: { x: 5, y: 7 },
        label: 'Code Center',
        color: '#e8a0bf',
      },
      {
        bx: 16,
        by: 3,
        bw: 5,
        bh: 4,
        doorLocalX: 2,
        toMapId: 'faang_mart',
        toPos: { x: 4, y: 6 },
        label: 'Tech Mart',
        color: '#2E8B57',
      },
      {
        bx: 10,
        by: 12,
        bw: 6,
        bh: 5,
        doorLocalX: 3,
        toMapId: 'faang_gym',
        toPos: { x: 5, y: 10 },
        label: 'Leetcode Gym',
        color: '#FF9900',
      },
    ],
    npcIds: [
      'faang_meta',
      'faang_amazon',
      'faang_google',
      'trainer_faang_lc',
      'faang_quest_giver',
      'joke_equity',
      'joke_affair_3',
    ],
    encounters: {
      chance: 0.12,
      entries: [
        { technologyId: 'react', weight: 25, minLevel: 24, maxLevel: 28 },
        { technologyId: 'python', weight: 25, minLevel: 24, maxLevel: 28 },
        { technologyId: 'aws', weight: 20, minLevel: 25, maxLevel: 29 },
        { technologyId: 'kubernetes', weight: 15, minLevel: 26, maxLevel: 30 },
        { technologyId: 'pytorch', weight: 15, minLevel: 25, maxLevel: 30 },
      ],
    },
  });
  map.interactions.push({
    id: 'faang_whiteboard',
    position: { x: 8, y: 11 },
    kind: 'inspect',
    text: 'Whiteboard: "Merge k sorted lists." Marker squeaks. Interviewer: "Yeah, just optimal."',
    flag: 'inspected_faang_board',
  });
  return map;
}

export function createRouteOps(): MapData {
  return makeRoute(
    'route_ops',
    'Orchestration Road',
    { mapId: 'stackhaven', x: 30, y: 11 },
    {
      mapId: 'container_cove',
      x: 1,
      y: 9,
      flag: 'badge_production',
      message: 'Cluster firewall. Earn the Production Badge in Stackhaven!',
    },
    {
      chance: 0.2,
      entries: [
        { technologyId: 'docker', weight: 30, minLevel: 16, maxLevel: 20 },
        { technologyId: 'redis', weight: 25, minLevel: 15, maxLevel: 19 },
        { technologyId: 'go', weight: 20, minLevel: 16, maxLevel: 20 },
        { technologyId: 'terraform', weight: 15, minLevel: 17, maxLevel: 21 },
        { technologyId: 'kafka', weight: 10, minLevel: 18, maxLevel: 22 },
      ],
    },
    ['trainer_ops_road'],
  );
}

export function createRouteLegacy(): MapData {
  return makeRoute(
    'route_legacy',
    'Cobol Causeway',
    { mapId: 'container_cove', x: 26, y: 9 },
    { mapId: 'legacy_crossing', x: 1, y: 9 },
    {
      chance: 0.2,
      entries: [
        { technologyId: 'cobol', weight: 30, minLevel: 18, maxLevel: 22 },
        { technologyId: 'java', weight: 30, minLevel: 18, maxLevel: 22 },
        { technologyId: 'mainframe', weight: 20, minLevel: 20, maxLevel: 24 },
        { technologyId: 'postgresql', weight: 20, minLevel: 19, maxLevel: 23 },
      ],
    },
    ['trainer_legacy_road'],
  );
}

export function createRouteService(): MapData {
  return makeRoute(
    'route_service',
    'Bench Boulevard',
    { mapId: 'legacy_crossing', x: 26, y: 9 },
    { mapId: 'service_square', x: 1, y: 9 },
    {
      chance: 0.18,
      entries: [
        { technologyId: 'salesforce', weight: 30, minLevel: 20, maxLevel: 24 },
        { technologyId: 'angular', weight: 25, minLevel: 20, maxLevel: 24 },
        { technologyId: 'java', weight: 25, minLevel: 21, maxLevel: 25 },
        { technologyId: 'spring_boot', weight: 20, minLevel: 22, maxLevel: 26 },
      ],
    },
    ['trainer_service_road'],
  );
}

export function createRouteFaang(): MapData {
  return makeRoute(
    'route_faang',
    'Onsite Approach',
    { mapId: 'service_square', x: 26, y: 9 },
    { mapId: 'faang_heights', x: 1, y: 9 },
    {
      chance: 0.18,
      entries: [
        { technologyId: 'python', weight: 25, minLevel: 22, maxLevel: 26 },
        { technologyId: 'react', weight: 25, minLevel: 22, maxLevel: 26 },
        { technologyId: 'aws', weight: 20, minLevel: 23, maxLevel: 27 },
        { technologyId: 'cpp', weight: 15, minLevel: 24, maxLevel: 28 },
        { technologyId: 'rust', weight: 15, minLevel: 24, maxLevel: 28 },
      ],
    },
    ['trainer_faang_road'],
  );
}

export function createDevopsGym(): MapData {
  return makeInteriorGym('devops_gym', 'DevOps Gym', 'container_cove', { x: 13, y: 17 }, [
    'gym_helm_npc',
  ]);
}
export function createLegacyGym(): MapData {
  return makeInteriorGym('legacy_gym', 'Legacy Gym', 'legacy_crossing', { x: 13, y: 17 }, [
    'gym_cobol_npc',
  ]);
}
export function createServiceGym(): MapData {
  return makeInteriorGym('service_gym', 'Billing Gym', 'service_square', { x: 13, y: 17 }, [
    'gym_billing_npc',
  ]);
}
export function createFaangGym(): MapData {
  return makeInteriorGym('faang_gym', 'Leetcode Gym', 'faang_heights', { x: 13, y: 17 }, [
    'gym_leet_npc',
  ]);
}

function smallCenter(id: string, parent: string, exit: { x: number; y: number }, nurse: string): MapData {
  const { center } = makeCenterMartPair(id.replace('_center', ''), parent, exit, nurse, 'x');
  center.id = id;
  center.npcIds = [nurse];
  center.transitions[0].toPosition = exit;
  return center;
}

function smallMart(id: string, parent: string, exit: { x: number; y: number }, clerk: string): MapData {
  const { mart } = makeCenterMartPair(id.replace('_mart', ''), parent, exit, 'x', clerk);
  mart.id = id;
  mart.npcIds = [clerk];
  mart.transitions[0].toPosition = exit;
  return mart;
}

export function createCoveCenter(): MapData {
  return smallCenter('cove_center', 'container_cove', { x: 6, y: 7 }, 'cove_nurse');
}
export function createCoveMart(): MapData {
  return smallMart('cove_mart', 'container_cove', { x: 18, y: 7 }, 'cove_clerk');
}
export function createLegacyCenter(): MapData {
  return smallCenter('legacy_center', 'legacy_crossing', { x: 6, y: 7 }, 'legacy_nurse');
}
export function createLegacyMart(): MapData {
  return smallMart('legacy_mart', 'legacy_crossing', { x: 18, y: 7 }, 'legacy_clerk');
}
export function createServiceCenter(): MapData {
  return smallCenter('service_center', 'service_square', { x: 6, y: 7 }, 'service_nurse');
}
export function createServiceMart(): MapData {
  return smallMart('service_mart', 'service_square', { x: 18, y: 7 }, 'service_clerk');
}
export function createFaangCenter(): MapData {
  return smallCenter('faang_center', 'faang_heights', { x: 6, y: 7 }, 'faang_nurse');
}
export function createFaangMart(): MapData {
  return smallMart('faang_mart', 'faang_heights', { x: 18, y: 7 }, 'faang_clerk');
}

export const expansionMaps: MapData[] = [
  createRouteOps(),
  createContainerCove(),
  createCoveCenter(),
  createCoveMart(),
  createDevopsGym(),
  createRouteLegacy(),
  createLegacyCrossing(),
  createLegacyCenter(),
  createLegacyMart(),
  createLegacyGym(),
  createRouteService(),
  createServiceSquare(),
  createServiceCenter(),
  createServiceMart(),
  createServiceGym(),
  createRouteFaang(),
  createFaangHeights(),
  createFaangCenter(),
  createFaangMart(),
  createFaangGym(),
];
