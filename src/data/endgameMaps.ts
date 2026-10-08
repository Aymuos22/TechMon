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

/** Enhanced LayOff Tower — multi-floor satire dungeon */
export function createLayoffTower(): MapData {
  const W = 15;
  const H = 28;
  const tiles = createGrid(W, H, TILE.WALL_ALT);
  fillRect(tiles, 1, 1, W - 2, H - 2, TILE.FLOOR_DARK);
  // Central corridor
  fillRect(tiles, 6, 1, 3, H - 3, TILE.PATH);
  setTile(tiles, 7, H - 1, TILE.DOOR);

  // Floor dividers (HR / finance / exec / summit)
  for (const y of [6, 11, 16, 21]) {
    fillRect(tiles, 2, y, 11, 1, TILE.COUNTER);
    setTile(tiles, 7, y, TILE.PATH);
  }

  // Ambient tech
  setTile(tiles, 3, 3, TILE.COMPUTER);
  setTile(tiles, 11, 3, TILE.COMPUTER);
  setTile(tiles, 7, 2, TILE.MACHINE);
  setTile(tiles, 2, 8, TILE.COMPUTER);
  setTile(tiles, 12, 8, TILE.MACHINE);
  setTile(tiles, 2, 13, TILE.COMPUTER);
  setTile(tiles, 12, 13, TILE.COMPUTER);
  setTile(tiles, 3, 18, TILE.MACHINE);
  setTile(tiles, 11, 18, TILE.MACHINE);
  // Farm portal at summit (north)
  setTile(tiles, 7, 1, TILE.DOOR);
  fillRect(tiles, 5, 3, 5, 2, TILE.CARPET);

  return {
    id: 'layoff_tower',
    name: 'LayOff Tower',
    width: W,
    height: H,
    tiles,
    collision: buildCollision(tiles),
    transitions: [
      {
        id: 'layoff_exit',
        from: { x: 7, y: H - 1 },
        toMapId: 'faang_heights',
        toPosition: { x: 26, y: 9 },
        toFacing: 'down',
      },
      {
        id: 'to_farm_life',
        from: { x: 7, y: 1 },
        toMapId: 'farm_life',
        toPosition: { x: 14, y: 18 },
        toFacing: 'up',
        requiresFlag: 'game_cleared',
        message: 'Farming Life portal sealed. Defeat both disruptors first!',
      },
    ],
    interactions: [
      {
        id: 'lobby_sign',
        position: { x: 7, y: 24 },
        kind: 'sign',
        text: 'LAYOFF TOWER — Synergy in. Severance out. Please take a number.',
      },
      {
        id: 'oracle_plaque',
        position: { x: 2, y: 7 },
        kind: 'sign',
        text: 'Oracle Wing: "Your job was depreciated. Renew support at list price."',
      },
      {
        id: 'amazon_plaque',
        position: { x: 12, y: 7 },
        kind: 'sign',
        text: 'Amazon Wing: "Customer obsession now includes the headcount chart."',
      },
      {
        id: 'meta_plaque',
        position: { x: 2, y: 12 },
        kind: 'sign',
        text: 'Meta Wing: "We\'re flattening the org. Also the morale. Year of Efficiency."',
      },
      {
        id: 'google_plaque',
        position: { x: 12, y: 12 },
        kind: 'sign',
        text: 'Google Wing: "Don\'t be evil. Do be efficient. Thesaurus TBD."',
      },
      {
        id: 'msft_plaque',
        position: { x: 2, y: 17 },
        kind: 'sign',
        text: 'Microsoft Wing: "Teams will ping you for your exit interview. Mute optional."',
      },
      {
        id: 'salesforce_plaque',
        position: { x: 12, y: 17 },
        kind: 'sign',
        text: 'Salesforce Wing: "Your Opportunity was Closed-Lost. Pipeline refreshed."',
      },
      {
        id: 'twitter_plaque',
        position: { x: 2, y: 22 },
        kind: 'sign',
        text: 'X Wing: "We\'re hardcore now. Soft skills laid off first."',
      },
      {
        id: 'ibm_plaque',
        position: { x: 12, y: 22 },
        kind: 'sign',
        text: 'IBM Wing: "Watson recommends: fewer humans, more press releases."',
      },
      {
        id: 'summit_sign',
        position: { x: 7, y: 4 },
        kind: 'sign',
        text: 'SUMMIT — Disruptors: Claude (W) · Codex (E). Clear both to open Farming Life north.',
      },
      {
        id: 'farm_portal_hint',
        position: { x: 9, y: 2 },
        kind: 'sign',
        text: 'Quiet Acre Portal — post-credits farming. Tall grass. No PIPs. Just vibes.',
      },
    ],
    buildings: [],
    npcIds: [
      'layoff_guide',
      'layoff_oracle_hr',
      'layoff_amazon_hr',
      'layoff_meta_hr',
      'layoff_google_hr',
      'trainer_layoff_pip',
      'trainer_layoff_rto',
      'villain_dario',
      'villain_sam',
      'joke_pip',
    ],
    music: 'battle',
    isInterior: true,
    parentMapId: 'faang_heights',
    theme: 'interior',
  };
}

/** Post-game endless farming zone */
export function createFarmLife(): MapData {
  const W = 30;
  const H = 22;
  const tiles = createGrid(W, H, TILE.GRASS);
  drawBorder(tiles, TILE.TREE);
  fillRect(tiles, 1, 10, W - 2, 2, TILE.PATH);
  fillRect(tiles, 13, 2, 2, H - 4, TILE.PATH);
  // Big farm patches
  fillRect(tiles, 2, 2, 10, 7, TILE.TALL_GRASS);
  fillRect(tiles, 16, 2, 12, 7, TILE.TALL_GRASS);
  fillRect(tiles, 2, 13, 10, 7, TILE.TALL_GRASS);
  fillRect(tiles, 16, 13, 12, 7, TILE.TALL_GRASS);
  fillRect(tiles, 11, 8, 6, 4, TILE.FLOWER);
  // Keep paths clear
  fillRect(tiles, 1, 10, W - 2, 2, TILE.PATH);
  fillRect(tiles, 13, 2, 2, H - 4, TILE.PATH);
  // Hut
  drawRoom(tiles, 12, 16, 5, 4);
  setTile(tiles, 14, 19, TILE.DOOR);
  setTile(tiles, 14, H - 1, TILE.PATH);

  return {
    id: 'farm_life',
    name: 'Quiet Acre',
    width: W,
    height: H,
    tiles,
    collision: buildCollision(tiles),
    transitions: [
      {
        id: 'farm_to_tower',
        from: { x: 14, y: H - 1 },
        toMapId: 'layoff_tower',
        toPosition: { x: 7, y: 2 },
        toFacing: 'down',
      },
      {
        id: 'farm_hut_in',
        from: { x: 14, y: 19 },
        toMapId: 'farm_hut',
        toPosition: { x: 5, y: 7 },
        toFacing: 'up',
      },
    ],
    interactions: [
      {
        id: 'farm_sign',
        position: { x: 15, y: 9 },
        kind: 'sign',
        text: 'QUIET ACRE — Post-credits farming. Catch, grind, nap. No standups.',
      },
      {
        id: 'farm_scarecrow',
        position: { x: 5, y: 9 },
        kind: 'sign',
        text: 'Scarecrow CV: "10 years YAML. Open to hybrid. Will not relocate."',
      },
    ],
    buildings: [
      {
        id: 'farm_hut',
        name: 'Rest Hut',
        position: { x: 12, y: 16 },
        width: 5,
        height: 4,
        door: { x: 14, y: 19 },
        color: '#e8a0bf',
      },
    ],
    npcIds: ['farm_rancher', 'farm_nurse_spot', 'trainer_farm_a', 'trainer_farm_b'],
    music: 'city',
    theme: 'route',
    encounters: {
      chance: 0.28,
      entries: [
        { technologyId: 'python', weight: 18, minLevel: 40, maxLevel: 55 },
        { technologyId: 'javascript', weight: 18, minLevel: 40, maxLevel: 55 },
        { technologyId: 'react', weight: 14, minLevel: 42, maxLevel: 58 },
        { technologyId: 'docker', weight: 12, minLevel: 45, maxLevel: 60 },
        { technologyId: 'kubernetes', weight: 10, minLevel: 48, maxLevel: 62 },
        { technologyId: 'aws', weight: 10, minLevel: 48, maxLevel: 62 },
        { technologyId: 'rust', weight: 8, minLevel: 50, maxLevel: 65 },
        { technologyId: 'pytorch', weight: 6, minLevel: 52, maxLevel: 68 },
        { technologyId: 'go', weight: 4, minLevel: 45, maxLevel: 60 },
      ],
    },
  };
}

export function createFarmHut(): MapData {
  const W = 11;
  const H = 9;
  const tiles = createGrid(W, H, TILE.WALL);
  fillRect(tiles, 1, 1, W - 2, H - 2, TILE.FLOOR);
  fillRect(tiles, 3, 2, 5, 2, TILE.CARPET);
  fillRect(tiles, 3, 3, 5, 1, TILE.COUNTER);
  setTile(tiles, 5, H - 1, TILE.DOOR);
  setTile(tiles, 1, 2, TILE.COMPUTER);
  setTile(tiles, 9, 5, TILE.CARPET);
  return {
    id: 'farm_hut',
    name: 'Rest Hut',
    width: W,
    height: H,
    tiles,
    collision: buildCollision(tiles),
    transitions: [
      {
        id: 'hut_exit',
        from: { x: 5, y: H - 1 },
        toMapId: 'farm_life',
        toPosition: { x: 14, y: 20 },
        toFacing: 'down',
      },
    ],
    interactions: [
      {
        id: 'farm_pc',
        position: { x: 1, y: 2 },
        kind: 'computer',
        text: 'Tech Storage Terminal',
      },
      {
        id: 'farm_bed',
        position: { x: 9, y: 5 },
        kind: 'bed',
        text: 'A soft patch of grass shaped like a standing desk.',
      },
    ],
    buildings: [],
    npcIds: ['farm_nurse'],
    music: 'city',
    isInterior: true,
    parentMapId: 'farm_life',
    theme: 'interior',
  };
}

/** Diversity Arena — women in tech + POSH education */
export function createDiversityArena(): MapData {
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
    id: 'diversity_arena',
    name: 'Diversity Arena',
    width: W,
    height: H,
    tiles,
    collision: buildCollision(tiles),
    transitions: [
      {
        id: 'div_exit',
        from: { x: 6, y: H - 1 },
        toMapId: 'stackhaven',
        toPosition: { x: 3, y: 19 },
        toFacing: 'down',
      },
    ],
    interactions: [
      {
        id: 'posh_poster',
        position: { x: 6, y: 2 },
        kind: 'sign',
        text: 'POSH Act (India): Prevention of Sexual Harassment at Workplace — respect is non-negotiable.',
      },
      {
        id: 'div_rules',
        position: { x: 3, y: 5 },
        kind: 'sign',
        text: 'Arena Rule #1: Listen first. Battle second. Jokes third — never at someone\'s expense.',
      },
      {
        id: 'div_icc',
        position: { x: 9, y: 5 },
        kind: 'sign',
        text: 'Know your ICC (Internal Complaints Committee). Silence helps harassers. Reporting helps teams.',
      },
      {
        id: 'div_false_note',
        position: { x: 6, y: 8 },
        kind: 'sign',
        text: 'Notice: Weaponizing POSH for vibes / grudges / "you disagreed with me" wastes ICC time and harms real survivors. Don\'t be Kira or Reno.',
      },
    ],
    buildings: [],
    npcIds: [
      'div_priya',
      'div_aisha',
      'div_mei',
      'div_sofia',
      'trainer_div_lead',
      'trainer_div_sre',
      'div_crack_kira',
      'div_crack_reno',
    ],
    music: 'battle',
    isInterior: true,
    parentMapId: 'stackhaven',
    theme: 'interior',
  };
}

export const endgameMaps: MapData[] = [
  createLayoffTower(),
  createFarmLife(),
  createFarmHut(),
  createDiversityArena(),
];
