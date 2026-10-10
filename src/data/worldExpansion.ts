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
import { ALL_BADGE_IDS } from './gymConfig';

const ALL_BADGE_FLAGS = ALL_BADGE_IDS.map((badgeId) => `badge_${badgeId}`);

function makeTown(
  id: string,
  name: string,
  theme: MapData['theme'],
  opts: {
    west?: { mapId: string; x: number; y: number; flag?: string; flags?: string[]; message?: string };
    east?: { mapId: string; x: number; y: number; flag?: string; flags?: string[]; message?: string };
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
        requiresAllFlags: opts.west.flags,
        message: opts.west.message,
      },
      {
        id: `${id}_west2`,
        from: { x: 0, y: 10 },
        toMapId: opts.west.mapId,
        toPosition: { x: opts.west.x, y: opts.west.y },
        toFacing: 'left',
        requiresFlag: opts.west.flag,
        requiresAllFlags: opts.west.flags,
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
        requiresAllFlags: opts.east.flags,
        message: opts.east.message,
      },
      {
        id: `${id}_east2`,
        from: { x: W - 1, y: 10 },
        toMapId: opts.east.mapId,
        toPosition: { x: opts.east.x, y: opts.east.y },
        toFacing: 'right',
        requiresFlag: opts.east.flag,
        requiresAllFlags: opts.east.flags,
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

function rebuild(map: MapData): MapData {
  map.collision = buildCollision(map.tiles);
  return map;
}

function keepTownAccessOpen(map: MapData): MapData {
  fillRect(map.tiles, 1, 9, map.width - 2, 2, TILE.PATH);
  fillRect(map.tiles, 12, 2, 2, map.height - 4, TILE.PATH);

  for (const building of map.buildings) {
    const { x, y } = building.door;
    setTile(map.tiles, x, y, TILE.DOOR);
    if (y + 1 < map.height - 1) {
      setTile(map.tiles, x, y + 1, TILE.PATH);
    }

    const startY = Math.min(y + 1, 9);
    const endY = Math.max(y + 1, 10);
    for (let row = startY; row <= endY; row++) {
      setTile(map.tiles, x, row, TILE.PATH);
    }
  }

  return map;
}

function keepRoutePassageOpen(map: MapData): MapData {
  fillRect(map.tiles, 1, 5, map.width - 2, 2, TILE.PATH);
  setTile(map.tiles, 0, 5, TILE.PATH);
  setTile(map.tiles, 0, 6, TILE.PATH);
  setTile(map.tiles, map.width - 1, 5, TILE.PATH);
  setTile(map.tiles, map.width - 1, 6, TILE.PATH);
  return map;
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
      'bhavika',
      'dev_soumya_cove',
    ],
    encounters: {
      chance: 0.12,
      entries: [
        { technologyId: 'docker', weight: 35, minLevel: 18, maxLevel: 22 },
        { technologyId: 'kubernetes', weight: 25, minLevel: 19, maxLevel: 23 },
        { technologyId: 'terraform', weight: 20, minLevel: 18, maxLevel: 22 },
        { technologyId: 'helm', weight: 18, minLevel: 19, maxLevel: 23 },
        { technologyId: 'argocd', weight: 12, minLevel: 20, maxLevel: 24 },
        { technologyId: 'consul', weight: 12, minLevel: 19, maxLevel: 23 },
        { technologyId: 'envoy', weight: 10, minLevel: 20, maxLevel: 24 },
        { technologyId: 'istio', weight: 8, minLevel: 21, maxLevel: 25 },
        { technologyId: 'vault', weight: 8, minLevel: 21, maxLevel: 25 },
        { technologyId: 'redis', weight: 15, minLevel: 17, maxLevel: 21 },
        { technologyId: 'vercel', weight: 12, minLevel: 19, maxLevel: 23 },
        { technologyId: 'prisma', weight: 10, minLevel: 18, maxLevel: 22 },
        { technologyId: 'cloudflare', weight: 14, minLevel: 19, maxLevel: 23 },
        { technologyId: 'prometheus', weight: 12, minLevel: 18, maxLevel: 22 },
        { technologyId: 'grafana', weight: 12, minLevel: 18, maxLevel: 22 },
        { technologyId: 'datadog', weight: 10, minLevel: 20, maxLevel: 24 },
        { technologyId: 'sentry', weight: 10, minLevel: 19, maxLevel: 23 },
        { technologyId: 'jenkins', weight: 10, minLevel: 18, maxLevel: 22 },
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
  // Coastal industrial port: water channel, metal piers, stacked containers, ops consoles.
  fillRect(map.tiles, 1, 14, 8, 4, TILE.WATER);
  fillRect(map.tiles, 1, 11, 8, 2, TILE.SAND);
  fillRect(map.tiles, 6, 13, 2, 5, TILE.BRIDGE);
  fillRect(map.tiles, 18, 5, 7, 3, TILE.WALL_ALT);
  fillRect(map.tiles, 19, 6, 5, 1, TILE.MACHINE);
  fillRect(map.tiles, 2, 3, 2, 5, TILE.FENCE);
  fillRect(map.tiles, 23, 12, 3, 5, TILE.FENCE);
  setTile(map.tiles, 20, 4, TILE.COMPUTER);
  setTile(map.tiles, 24, 4, TILE.COMPUTER);
  setTile(map.tiles, 13, 11, TILE.MACHINE);
  map.interactions.push(
    {
      id: 'cove_port_sign',
      position: { x: 6, y: 12 },
      kind: 'sign',
      text: 'CONTAINER COVE — Salt air, YAML, and pods waiting at the dock.',
    },
    {
      id: 'cove_console',
      position: { x: 20, y: 4 },
      kind: 'computer',
      text: 'Harbor cluster dashboard: 87 containers waiting for rollout.',
    },
  );
  return rebuild(keepTownAccessOpen(map));
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
    npcIds: [
      'legacy_elder',
      'trainer_legacy_batch',
      'legacy_quest_giver',
      'joke_weekend',
      'shrey',
      'dev_soumya_legacy',
    ],
    encounters: {
      chance: 0.14,
      entries: [
        { technologyId: 'cobol', weight: 40, minLevel: 20, maxLevel: 24 },
        { technologyId: 'mainframe', weight: 25, minLevel: 21, maxLevel: 25 },
        { technologyId: 'java', weight: 20, minLevel: 19, maxLevel: 23 },
        { technologyId: 'scala', weight: 12, minLevel: 20, maxLevel: 24 },
        { technologyId: 'postgresql', weight: 15, minLevel: 20, maxLevel: 24 },
        { technologyId: 'mysql', weight: 15, minLevel: 20, maxLevel: 24 },
        { technologyId: 'cockroachdb', weight: 10, minLevel: 21, maxLevel: 25 },
        { technologyId: 'cassandra', weight: 10, minLevel: 21, maxLevel: 25 },
        { technologyId: 'hadoop', weight: 10, minLevel: 21, maxLevel: 25 },
        { technologyId: 'php', weight: 12, minLevel: 19, maxLevel: 23 },
        { technologyId: 'rails', weight: 10, minLevel: 20, maxLevel: 24 },
        { technologyId: 'wordpress', weight: 10, minLevel: 19, maxLevel: 23 },
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
  // A cracked old mainframe settlement: dead terminals, punch-card fences, and broken asphalt.
  fillRect(map.tiles, 3, 2, 6, 2, TILE.FLOOR_DARK);
  fillRect(map.tiles, 18, 2, 6, 2, TILE.FLOOR_DARK);
  fillRect(map.tiles, 2, 13, 7, 4, TILE.SAND);
  fillRect(map.tiles, 18, 13, 6, 4, TILE.SAND);
  fillRect(map.tiles, 11, 5, 4, 1, TILE.COMPUTER);
  fillRect(map.tiles, 11, 6, 4, 1, TILE.MACHINE);
  fillRect(map.tiles, 4, 11, 20, 1, TILE.FENCE);
  setTile(map.tiles, 13, 11, TILE.PATH);
  setTile(map.tiles, 14, 11, TILE.PATH);
  setTile(map.tiles, 15, 9, TILE.SHELF);
  setTile(map.tiles, 16, 9, TILE.SHELF);
  map.interactions.push({
    id: 'legacy_terminal_row',
    position: { x: 12, y: 5 },
    kind: 'computer',
    text: 'Green-screen terminal: cursor blinking since 1987. Still mission critical.',
  });
  return rebuild(keepTownAccessOpen(map));
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
      'gossip_breakup',
      'gossip_nandini',
      'priyanshu',
      'nikita',
      'dev_soumya_service',
    ],
    encounters: {
      chance: 0.1,
      entries: [
        { technologyId: 'salesforce', weight: 35, minLevel: 22, maxLevel: 26 },
        { technologyId: 'java', weight: 25, minLevel: 21, maxLevel: 25 },
        { technologyId: 'angular', weight: 20, minLevel: 22, maxLevel: 26 },
        { technologyId: 'spring_boot', weight: 20, minLevel: 23, maxLevel: 27 },
        { technologyId: 'dynamodb', weight: 12, minLevel: 23, maxLevel: 27 },
        { technologyId: 'laravel', weight: 16, minLevel: 22, maxLevel: 26 },
        { technologyId: 'wordpress', weight: 12, minLevel: 21, maxLevel: 25 },
        { technologyId: 'dotnet', weight: 14, minLevel: 23, maxLevel: 27 },
        { technologyId: 'phoenix', weight: 10, minLevel: 23, maxLevel: 27 },
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
  // Downtrodden service village: dusty lanes, cramped cubicle rows, half-broken benches.
  fillRect(map.tiles, 1, 6, 26, 2, TILE.SAND);
  fillRect(map.tiles, 1, 12, 26, 2, TILE.SAND);
  fillRect(map.tiles, 4, 14, 5, 3, TILE.FENCE);
  fillRect(map.tiles, 18, 3, 7, 5, TILE.FENCE);
  setTile(map.tiles, 6, 8, TILE.BENCH);
  setTile(map.tiles, 7, 8, TILE.BENCH);
  setTile(map.tiles, 20, 11, TILE.BENCH);
  fillRect(map.tiles, 11, 8, 6, 1, TILE.COUNTER);
  fillRect(map.tiles, 11, 11, 6, 1, TILE.COUNTER);
  setTile(map.tiles, 15, 8, TILE.PATH);
  setTile(map.tiles, 15, 11, TILE.PATH);
  map.interactions.push({
    id: 'service_notice',
    position: { x: 15, y: 8 },
    kind: 'inspect',
    text: 'Notice board: "Bench allocation pending. Please continue looking busy."',
  });
  return rebuild(keepTownAccessOpen(map));
}

export function createFaangHeights(): MapData {
  const map = makeTown('faang_heights', 'FAANG Heights', 'stackhaven', {
    west: { mapId: 'route_faang', x: 34, y: 5 },
    east: {
      mapId: 'layoff_tower',
      x: 7,
      y: 26,
      flags: ALL_BADGE_FLAGS,
      message: 'LayOff Tower is the final battle. Earn every badge before entering.',
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
      'soumya_gupta',
      'dev_soumya_faang',
    ],
    encounters: {
      chance: 0.12,
      entries: [
        { technologyId: 'react', weight: 25, minLevel: 24, maxLevel: 28 },
        { technologyId: 'python', weight: 25, minLevel: 24, maxLevel: 28 },
        { technologyId: 'aws', weight: 20, minLevel: 25, maxLevel: 29 },
        { technologyId: 'vercel', weight: 18, minLevel: 25, maxLevel: 29 },
        { technologyId: 'graphql', weight: 15, minLevel: 24, maxLevel: 28 },
        { technologyId: 'spark', weight: 14, minLevel: 25, maxLevel: 29 },
        { technologyId: 'snowflake', weight: 14, minLevel: 25, maxLevel: 29 },
        { technologyId: 'databricks', weight: 10, minLevel: 27, maxLevel: 31 },
        { technologyId: 'clickhouse', weight: 10, minLevel: 25, maxLevel: 29 },
        { technologyId: 'huggingface', weight: 12, minLevel: 25, maxLevel: 29 },
        { technologyId: 'scikit_learn', weight: 12, minLevel: 24, maxLevel: 28 },
        { technologyId: 'pandas', weight: 12, minLevel: 24, maxLevel: 28 },
        { technologyId: 'swift', weight: 12, minLevel: 24, maxLevel: 28 },
        { technologyId: 'supabase', weight: 12, minLevel: 25, maxLevel: 29 },
        { technologyId: 'cloudflare', weight: 10, minLevel: 25, maxLevel: 29 },
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
  // Hi-tech city grid: glass plazas, data-center strips, interview fountains.
  fillRect(map.tiles, 2, 4, 24, 1, TILE.FLOOR_DARK);
  fillRect(map.tiles, 2, 15, 24, 1, TILE.FLOOR_DARK);
  fillRect(map.tiles, 8, 2, 2, 16, TILE.FLOOR_DARK);
  fillRect(map.tiles, 18, 2, 2, 16, TILE.FLOOR_DARK);
  fillRect(map.tiles, 11, 7, 6, 5, TILE.SAND);
  setTile(map.tiles, 14, 9, TILE.FOUNTAIN);
  fillRect(map.tiles, 22, 5, 3, 6, TILE.COMPUTER);
  fillRect(map.tiles, 3, 13, 4, 4, TILE.MACHINE);
  setTile(map.tiles, 24, 9, TILE.PATH);
  setTile(map.tiles, 23, 9, TILE.PATH);
  map.interactions.push({
    id: 'faang_city_grid',
    position: { x: 14, y: 9 },
    kind: 'info',
    text: 'Glass plaza: free snacks west, whiteboard anxiety east, stock refresh north.',
  });
  return rebuild(keepTownAccessOpen(map));
}

export function createRouteOps(): MapData {
  const map = makeRoute(
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
        { technologyId: 'nginx', weight: 18, minLevel: 16, maxLevel: 20 },
        { technologyId: 'ansible', weight: 16, minLevel: 16, maxLevel: 20 },
        { technologyId: 'helm', weight: 14, minLevel: 17, maxLevel: 21 },
        { technologyId: 'argocd', weight: 10, minLevel: 18, maxLevel: 22 },
        { technologyId: 'github_actions', weight: 16, minLevel: 16, maxLevel: 20 },
        { technologyId: 'gitlab_ci', weight: 14, minLevel: 16, maxLevel: 20 },
        { technologyId: 'circleci', weight: 14, minLevel: 16, maxLevel: 20 },
        { technologyId: 'terraform', weight: 15, minLevel: 17, maxLevel: 21 },
        { technologyId: 'prometheus', weight: 12, minLevel: 17, maxLevel: 21 },
        { technologyId: 'kafka', weight: 10, minLevel: 18, maxLevel: 22 },
      ],
    },
    ['trainer_ops_road'],
  );
  // Container yard geography: service road broken by pipe bridges and machine racks.
  fillRect(map.tiles, 5, 1, 26, 2, TILE.WALL_ALT);
  fillRect(map.tiles, 7, 2, 4, 1, TILE.MACHINE);
  fillRect(map.tiles, 18, 2, 4, 1, TILE.MACHINE);
  fillRect(map.tiles, 3, 8, 8, 2, TILE.SAND);
  fillRect(map.tiles, 24, 8, 7, 2, TILE.FENCE);
  setTile(map.tiles, 17, 5, TILE.COMPUTER);
  setTile(map.tiles, 17, 6, TILE.COMPUTER);
  map.interactions.push({
    id: 'ops_pipeline_sign',
    position: { x: 17, y: 4 },
    kind: 'sign',
    text: 'ORCHESTRATION ROAD — Containers stacked north. Deployments staged south.',
  });
  return rebuild(keepRoutePassageOpen(map));
}

export function createRouteLegacy(): MapData {
  const map = makeRoute(
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
        { technologyId: 'mysql', weight: 18, minLevel: 19, maxLevel: 23 },
        { technologyId: 'cassandra', weight: 12, minLevel: 20, maxLevel: 24 },
        { technologyId: 'cockroachdb', weight: 10, minLevel: 21, maxLevel: 25 },
        { technologyId: 'hadoop', weight: 10, minLevel: 20, maxLevel: 24 },
        { technologyId: 'ruby', weight: 12, minLevel: 18, maxLevel: 22 },
      ],
    },
    ['trainer_legacy_road'],
  );
  // Old cobblestone causeway: sparse grass, broken fences, and abandoned batch consoles.
  fillRect(map.tiles, 1, 4, 34, 4, TILE.SAND);
  fillRect(map.tiles, 1, 5, 34, 2, TILE.PATH);
  fillRect(map.tiles, 6, 2, 8, 2, TILE.FENCE);
  fillRect(map.tiles, 22, 8, 8, 2, TILE.FENCE);
  setTile(map.tiles, 14, 4, TILE.COMPUTER);
  setTile(map.tiles, 15, 4, TILE.COMPUTER);
  setTile(map.tiles, 20, 7, TILE.SHELF);
  map.interactions.push({
    id: 'legacy_route_sign',
    position: { x: 17, y: 4 },
    kind: 'sign',
    text: 'COBOL CAUSEWAY — Mind the cracked road and the untouched payroll batch.',
  });
  return rebuild(keepRoutePassageOpen(map));
}

export function createRouteService(): MapData {
  const map = makeRoute(
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
        { technologyId: 'dotnet', weight: 18, minLevel: 22, maxLevel: 26 },
        { technologyId: 'dynamodb', weight: 12, minLevel: 22, maxLevel: 26 },
        { technologyId: 'laravel', weight: 16, minLevel: 21, maxLevel: 25 },
        { technologyId: 'elixir', weight: 10, minLevel: 22, maxLevel: 26 },
      ],
    },
    ['trainer_service_road'],
  );
  // Downtrodden bench road: dusty detours, cubicle barricades, and no shade.
  fillRect(map.tiles, 1, 3, 34, 6, TILE.SAND);
  fillRect(map.tiles, 1, 5, 34, 2, TILE.PATH);
  fillRect(map.tiles, 8, 2, 5, 2, TILE.BENCH);
  fillRect(map.tiles, 22, 8, 6, 2, TILE.COUNTER);
  fillRect(map.tiles, 30, 2, 4, 3, TILE.FENCE);
  setTile(map.tiles, 18, 4, TILE.SIGN);
  map.interactions.push({
    id: 'bench_route_sign',
    position: { x: 18, y: 4 },
    kind: 'sign',
    text: 'BENCH BOULEVARD — Villages of idle talent and timesheet dust.',
  });
  return rebuild(keepRoutePassageOpen(map));
}

export function createRouteFaang(): MapData {
  const map = makeRoute(
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
        { technologyId: 'snowflake', weight: 16, minLevel: 23, maxLevel: 27 },
        { technologyId: 'spark', weight: 14, minLevel: 24, maxLevel: 28 },
        { technologyId: 'databricks', weight: 8, minLevel: 26, maxLevel: 30 },
        { technologyId: 'mlflow', weight: 8, minLevel: 26, maxLevel: 30 },
        { technologyId: 'ray', weight: 8, minLevel: 26, maxLevel: 30 },
        { technologyId: 'cpp', weight: 15, minLevel: 24, maxLevel: 28 },
        { technologyId: 'rust', weight: 15, minLevel: 24, maxLevel: 28 },
      ],
    },
    ['trainer_faang_road'],
  );
  // Onsite approach: sleek campus promenade with water, glass, and interview stations.
  fillRect(map.tiles, 1, 4, 34, 4, TILE.FLOOR_DARK);
  fillRect(map.tiles, 1, 5, 34, 2, TILE.PATH);
  fillRect(map.tiles, 6, 1, 5, 3, TILE.WATER);
  fillRect(map.tiles, 7, 4, 3, 1, TILE.BRIDGE);
  fillRect(map.tiles, 22, 1, 7, 3, TILE.COMPUTER);
  fillRect(map.tiles, 13, 8, 5, 2, TILE.MACHINE);
  setTile(map.tiles, 31, 6, TILE.FOUNTAIN);
  map.interactions.push({
    id: 'onsite_route_sign',
    position: { x: 17, y: 4 },
    kind: 'sign',
    text: 'ONSITE APPROACH — Badge swipe, free kombucha, O(n log n) panic.',
  });
  return rebuild(keepRoutePassageOpen(map));
}

export function createDevopsGym(): MapData {
  const map = makeInteriorGym('devops_gym', 'DevOps Gym', 'container_cove', { x: 13, y: 17 }, [
    'gym_trainer_manifest_npc',
    'gym_trainer_cluster_npc',
    'gym_helm_npc',
  ]);
  fillRect(map.tiles, 2, 3, 7, 1, TILE.MACHINE);
  fillRect(map.tiles, 2, 8, 7, 1, TILE.COMPUTER);
  setTile(map.tiles, 5, 6, TILE.BRIDGE);
  map.interactions.push({
    id: 'devops_cluster_panel',
    position: { x: 5, y: 3 },
    kind: 'computer',
    text: 'Cluster board: green pods, red alerts, one mysterious YAML indentation.',
  });
  return rebuild(map);
}
export function createLegacyGym(): MapData {
  const map = makeInteriorGym('legacy_gym', 'Legacy Gym', 'legacy_crossing', { x: 13, y: 17 }, [
    'gym_trainer_jcl_npc',
    'gym_trainer_green_screen_npc',
    'gym_cobol_npc',
  ]);
  fillRect(map.tiles, 2, 3, 7, 1, TILE.COMPUTER);
  fillRect(map.tiles, 2, 8, 7, 1, TILE.SHELF);
  setTile(map.tiles, 5, 6, TILE.MACHINE);
  map.interactions.push({
    id: 'legacy_core_panel',
    position: { x: 5, y: 3 },
    kind: 'computer',
    text: 'Mainframe core: "Do not reboot. Nobody remembers the password."',
  });
  return rebuild(map);
}
export function createServiceGym(): MapData {
  const map = makeInteriorGym('service_gym', 'Billing Gym', 'service_square', { x: 13, y: 17 }, [
    'gym_trainer_timesheet_npc',
    'gym_trainer_change_request_npc',
    'gym_billing_npc',
  ]);
  fillRect(map.tiles, 2, 3, 7, 1, TILE.COUNTER);
  fillRect(map.tiles, 2, 6, 7, 1, TILE.BENCH);
  fillRect(map.tiles, 2, 8, 7, 1, TILE.SHELF);
  map.interactions.push({
    id: 'service_billing_board',
    position: { x: 5, y: 3 },
    kind: 'inspect',
    text: 'Billing board: 6 hours design, 2 hours meeting, 32 hours waiting for access.',
  });
  return rebuild(map);
}
export function createFaangGym(): MapData {
  const map = makeInteriorGym('faang_gym', 'Leetcode Gym', 'faang_heights', { x: 13, y: 17 }, [
    'gym_trainer_interview_loop_npc',
    'gym_trainer_system_design_npc',
    'gym_leet_npc',
  ]);
  fillRect(map.tiles, 2, 3, 7, 1, TILE.COMPUTER);
  fillRect(map.tiles, 2, 8, 7, 1, TILE.MACHINE);
  setTile(map.tiles, 5, 6, TILE.FOUNTAIN);
  map.interactions.push({
    id: 'faang_whiteboard_panel',
    position: { x: 5, y: 3 },
    kind: 'computer',
    text: 'Whiteboard simulator: invert binary tree, then explain leadership principles.',
  });
  return rebuild(map);
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

/** North–south connector: Stackhaven → CuckCoder */
function makeRouteNS(
  id: string,
  name: string,
  north: { mapId: string; x: number; y: number },
  south: { mapId: string; x: number; y: number; flag?: string; message?: string },
  encounters: MapData['encounters'],
  npcIds: string[],
): MapData {
  const W = 12;
  const H = 28;
  const tiles = createGrid(W, H, TILE.GRASS);
  drawBorder(tiles, TILE.TREE);
  fillRect(tiles, 5, 1, 2, H - 2, TILE.PATH);
  fillRect(tiles, 1, 6, 3, 4, TILE.TALL_GRASS);
  fillRect(tiles, 8, 12, 3, 4, TILE.TALL_GRASS);
  fillRect(tiles, 2, 20, 3, 3, TILE.TALL_GRASS);
  setTile(tiles, 5, 0, TILE.PATH);
  setTile(tiles, 6, 0, TILE.PATH);
  setTile(tiles, 5, H - 1, TILE.PATH);
  setTile(tiles, 6, H - 1, TILE.PATH);

  return {
    id,
    name,
    width: W,
    height: H,
    tiles,
    collision: buildCollision(tiles),
    transitions: [
      {
        id: `${id}_n`,
        from: { x: 5, y: 0 },
        toMapId: north.mapId,
        toPosition: { x: north.x, y: north.y },
        toFacing: 'up',
      },
      {
        id: `${id}_n2`,
        from: { x: 6, y: 0 },
        toMapId: north.mapId,
        toPosition: { x: north.x, y: north.y },
        toFacing: 'up',
      },
      {
        id: `${id}_s`,
        from: { x: 5, y: H - 1 },
        toMapId: south.mapId,
        toPosition: { x: south.x, y: south.y },
        toFacing: 'down',
        requiresFlag: south.flag,
        message: south.message,
      },
      {
        id: `${id}_s2`,
        from: { x: 6, y: H - 1 },
        toMapId: south.mapId,
        toPosition: { x: south.x, y: south.y },
        toFacing: 'down',
        requiresFlag: south.flag,
        message: south.message,
      },
    ],
    interactions: [
      { id: `${id}_sign`, position: { x: 4, y: 14 }, kind: 'sign', text: name },
    ],
    buildings: [],
    npcIds,
    music: 'route',
    theme: 'route',
    encounters,
  };
}

export function createRouteVibe(): MapData {
  return makeRouteNS(
    'route_vibe',
    'Vibe Causeway',
    { mapId: 'stackhaven', x: 24, y: 22 },
    { mapId: 'cuckcoder', x: 13, y: 1 },
    {
      chance: 0.16,
      entries: [
        { technologyId: 'cursor', weight: 25, minLevel: 18, maxLevel: 24 },
        { technologyId: 'copilot', weight: 25, minLevel: 18, maxLevel: 24 },
        { technologyId: 'langchain', weight: 20, minLevel: 15, maxLevel: 19 },
        { technologyId: 'huggingface', weight: 14, minLevel: 16, maxLevel: 20 },
        { technologyId: 'jupyter', weight: 12, minLevel: 14, maxLevel: 18 },
        { technologyId: 'pandas', weight: 12, minLevel: 14, maxLevel: 18 },
        { technologyId: 'numpy', weight: 12, minLevel: 14, maxLevel: 18 },
        { technologyId: 'python', weight: 15, minLevel: 13, maxLevel: 17 },
        { technologyId: 'typescript', weight: 15, minLevel: 14, maxLevel: 18 },
      ],
    },
    ['trainer_vibe_road'],
  );
}

export function createCuckCoder(): MapData {
  const map = makeTown('cuckcoder', 'CuckCoder', 'stackhaven', {
    buildings: [
      {
        bx: 2,
        by: 2,
        bw: 5,
        bh: 4,
        doorLocalX: 2,
        toMapId: 'cuck_center',
        toPos: { x: 5, y: 7 },
        label: 'Code Center',
        color: '#e8a0bf',
      },
      {
        bx: 21,
        by: 2,
        bw: 5,
        bh: 4,
        doorLocalX: 2,
        toMapId: 'cuck_mart',
        toPos: { x: 4, y: 6 },
        label: 'Tech Mart',
        color: '#2E8B57',
      },
      {
        bx: 2,
        by: 12,
        bw: 5,
        bh: 5,
        doorLocalX: 2,
        toMapId: 'yc_f1',
        toPos: { x: 5, y: 10 },
        label: 'YC Batch House',
        color: '#FF6600',
      },
      {
        bx: 11,
        by: 12,
        bw: 6,
        bh: 5,
        doorLocalX: 3,
        toMapId: 'vibe_gym',
        toPos: { x: 5, y: 10 },
        label: 'Vibe Gym',
        color: '#9B59B6',
      },
      {
        bx: 20,
        by: 12,
        bw: 5,
        bh: 5,
        doorLocalX: 2,
        toMapId: 'lala_arena',
        toPos: { x: 6, y: 10 },
        label: 'LALA Company Arena',
        color: '#F39C12',
      },
    ],
    npcIds: [
      'vibe_chad',
      'nocode_nikhil',
      'saas_sofia',
      'prompt_perry',
      'ankur',
      'chirag',
      'madhusudhan',
      'sajal',
      'trainer_cuck_street',
      'dev_soumya_cuckcoder',
    ],
    encounters: {
      chance: 0.12,
      entries: [
        { technologyId: 'cursor', weight: 28, minLevel: 22, maxLevel: 28 },
        { technologyId: 'copilot', weight: 28, minLevel: 22, maxLevel: 28 },
        { technologyId: 'langchain', weight: 18, minLevel: 16, maxLevel: 22 },
        { technologyId: 'huggingface', weight: 14, minLevel: 18, maxLevel: 24 },
        { technologyId: 'mlflow', weight: 10, minLevel: 22, maxLevel: 28 },
        { technologyId: 'ray', weight: 8, minLevel: 22, maxLevel: 28 },
        { technologyId: 'typescript', weight: 14, minLevel: 15, maxLevel: 20 },
        { technologyId: 'claude', weight: 12, minLevel: 20, maxLevel: 26 },
      ],
    },
  });

  // North exit back to Vibe Causeway
  setTile(map.tiles, 12, 0, TILE.PATH);
  setTile(map.tiles, 13, 0, TILE.PATH);
  setTile(map.tiles, 14, 0, TILE.PATH);
  fillRect(map.tiles, 12, 1, 3, 2, TILE.PATH);
  map.collision = buildCollision(map.tiles);
  map.transitions.push(
    {
      id: 'cuck_north',
      from: { x: 12, y: 0 },
      toMapId: 'route_vibe',
      toPosition: { x: 5, y: 26 },
      toFacing: 'up',
    },
    {
      id: 'cuck_north2',
      from: { x: 13, y: 0 },
      toMapId: 'route_vibe',
      toPosition: { x: 5, y: 26 },
      toFacing: 'up',
    },
    {
      id: 'cuck_north3',
      from: { x: 14, y: 0 },
      toMapId: 'route_vibe',
      toPosition: { x: 6, y: 26 },
      toFacing: 'up',
    },
  );
  const welcome = map.interactions.find((i) => i.id === 'cuckcoder_sign');
  if (welcome && welcome.kind === 'sign') {
    welcome.text =
      'CUCKCODER — Vibe Gym · YC Batch House · LALA Arena. Catch Cursor & Copilot for LayOff Tower.';
  }
  map.interactions.push({
    id: 'cuck_pitch',
    position: { x: 9, y: 10 },
    kind: 'inspect',
    text: 'Pitch deck slide 1/47: "AI-native B2B SaaS for AI-native B2B SaaS." Traction: vibes. Funding: climb YC for real money.',
    flag: 'inspected_cuck_pitch',
  });
  return map;
}

export function createLalaArena(): MapData {
  const W = 13;
  const H = 12;
  const tiles = createGrid(W, H, TILE.WALL);
  fillRect(tiles, 1, 1, W - 2, H - 2, TILE.FLOOR);
  fillRect(tiles, 2, 2, 9, 6, TILE.CARPET);
  fillRect(tiles, 4, 3, 5, 4, TILE.SAND);
  setTile(tiles, 6, H - 1, TILE.DOOR);
  setTile(tiles, 2, 2, TILE.COMPUTER);
  setTile(tiles, 10, 2, TILE.COMPUTER);
  setTile(tiles, 6, 2, TILE.SIGN);

  return {
    id: 'lala_arena',
    name: 'LALA Company Arena',
    width: W,
    height: H,
    tiles,
    collision: buildCollision(tiles),
    transitions: [
      {
        id: 'lala_exit',
        from: { x: 6, y: H - 1 },
        toMapId: 'cuckcoder',
        toPosition: { x: 22, y: 17 },
        toFacing: 'down',
      },
    ],
    interactions: [
      {
        id: 'lala_banner',
        position: { x: 6, y: 2 },
        kind: 'sign',
        text: 'LALA COMPANY ARENA — No funding. Pre-revenue. Still look down on people with jobs.',
      },
      {
        id: 'lala_mrr',
        position: { x: 3, y: 5 },
        kind: 'sign',
        text: 'MRR board: $0.00. Footnote: "excluding vibes, LinkedIn impressions, and Discord cope."',
      },
      {
        id: 'lala_yc',
        position: { x: 9, y: 5 },
        kind: 'sign',
        text: 'Rejected by YC 4×. Rebranded as "bootstrapped and intentional." Still haughty.',
      },
    ],
    buildings: [],
    npcIds: ['lala_founder', 'lala_gtm', 'lala_cursor_kid', 'trainer_lala_boss'],
    music: 'battle',
    isInterior: true,
    parentMapId: 'cuckcoder',
    theme: 'interior',
  };
}

export function createVibeGym(): MapData {
  return makeInteriorGym('vibe_gym', 'Vibe Gym', 'cuckcoder', { x: 14, y: 17 }, [
    'gym_agent_npc',
  ]);
}

/** YC Batch House — climb 4 floors for a check */
function makeYcFloor(
  id: string,
  name: string,
  floorLabel: string,
  opts: {
    down?: { mapId: string; x: number; y: number };
    up?: { mapId: string; x: number; y: number };
    streetExit?: { mapId: string; x: number; y: number };
    npcIds: string[];
    signs?: Array<{ id: string; x: number; y: number; text: string }>;
  },
): MapData {
  const W = 11;
  const H = 12;
  const tiles = createGrid(W, H, TILE.WALL);
  fillRect(tiles, 1, 1, W - 2, H - 2, TILE.FLOOR);
  fillRect(tiles, 3, 3, 5, 4, TILE.CARPET);
  setTile(tiles, 2, 2, TILE.COMPUTER);
  setTile(tiles, 8, 2, TILE.COMPUTER);
  setTile(tiles, 5, 2, TILE.SIGN);

  const transitions: MapData['transitions'] = [];
  if (opts.streetExit) {
    setTile(tiles, 5, H - 1, TILE.DOOR);
    transitions.push({
      id: `${id}_street`,
      from: { x: 5, y: H - 1 },
      toMapId: opts.streetExit.mapId,
      toPosition: { x: opts.streetExit.x, y: opts.streetExit.y },
      toFacing: 'down',
    });
  }
  if (opts.down) {
    setTile(tiles, 2, H - 2, TILE.DOOR);
    transitions.push({
      id: `${id}_down`,
      from: { x: 2, y: H - 2 },
      toMapId: opts.down.mapId,
      toPosition: { x: opts.down.x, y: opts.down.y },
      toFacing: 'down',
    });
  }
  if (opts.up) {
    setTile(tiles, 8, 1, TILE.DOOR);
    transitions.push({
      id: `${id}_up`,
      from: { x: 8, y: 1 },
      toMapId: opts.up.mapId,
      toPosition: { x: opts.up.x, y: opts.up.y },
      toFacing: 'up',
    });
  }

  const interactions: MapData['interactions'] = [
    {
      id: `${id}_banner`,
      position: { x: 5, y: 2 },
      kind: 'sign',
      text: floorLabel,
    },
    ...(opts.signs ?? []).map((s) => ({
      id: s.id,
      position: { x: s.x, y: s.y },
      kind: 'sign' as const,
      text: s.text,
    })),
  ];

  return {
    id,
    name,
    width: W,
    height: H,
    tiles,
    collision: buildCollision(tiles),
    transitions,
    interactions,
    buildings: [],
    npcIds: opts.npcIds,
    music: 'city',
    isInterior: true,
    parentMapId: 'cuckcoder',
    theme: 'interior',
  };
}

export function createYcF1(): MapData {
  return makeYcFloor('yc_f1', 'YC Floor 1', 'YC F1 — LOBBY. Orange couch. Anxiety. Stairs up → Interview.', {
    streetExit: { mapId: 'cuckcoder', x: 4, y: 17 },
    up: { mapId: 'yc_f2', x: 2, y: 9 },
    npcIds: ['yc_f1_greeter', 'trainer_yc_f1'],
    signs: [
      {
        id: 'yc_f1_rules',
        x: 3,
        y: 5,
        text: 'Batch rules: ship weekly, talk to users, ignore LinkedIn until Demo Day.',
      },
    ],
  });
}

export function createYcF2(): MapData {
  return makeYcFloor('yc_f2', 'YC Floor 2', 'YC F2 — OFFICE HOURS. Bring metrics or vibes (preferably metrics).', {
    down: { mapId: 'yc_f1', x: 8, y: 2 },
    up: { mapId: 'yc_f3', x: 2, y: 9 },
    npcIds: ['yc_f2_mentor', 'trainer_yc_f2'],
    signs: [
      {
        id: 'yc_f2_tip',
        x: 7,
        y: 5,
        text: 'Tip: "AI wrapper" is fine if retention isn\'t a hallucination.',
      },
    ],
  });
}

export function createYcF3(): MapData {
  return makeYcFloor('yc_f3', 'YC Floor 3', 'YC F3 — PARTNER REVIEWS. They\'ve heard your pitch 400 times today.', {
    down: { mapId: 'yc_f2', x: 8, y: 2 },
    up: { mapId: 'yc_f4', x: 2, y: 9 },
    npcIds: ['yc_f3_gp', 'trainer_yc_f3'],
    signs: [
      {
        id: 'yc_f3_warn',
        x: 3,
        y: 5,
        text: 'Warning: Saying "we\'ll figure out monetization later" resets you to Floor 1 spiritually.',
      },
    ],
  });
}

export function createYcF4(): MapData {
  return makeYcFloor('yc_f4', 'YC Floor 4', 'YC F4 — PARTNER DESK. Get backed. Get paid. Then go crush LayOff Tower.', {
    down: { mapId: 'yc_f3', x: 8, y: 2 },
    npcIds: ['yc_partner'],
    signs: [
      {
        id: 'yc_f4_check',
        x: 7,
        y: 5,
        text: 'Standard deal energy: large check, orange logo, infinite Slack.',
      },
    ],
  });
}

export function createCuckCenter(): MapData {
  return smallCenter('cuck_center', 'cuckcoder', { x: 4, y: 6 }, 'cuck_nurse');
}
export function createCuckMart(): MapData {
  return smallMart('cuck_mart', 'cuckcoder', { x: 23, y: 6 }, 'cuck_clerk');
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
  createRouteVibe(),
  createCuckCoder(),
  createCuckCenter(),
  createCuckMart(),
  createLalaArena(),
  createVibeGym(),
  createYcF1(),
  createYcF2(),
  createYcF3(),
  createYcF4(),
];
