import { useCallback, useEffect, useRef, useState } from 'react';
import type { PlayerState } from '../types/player';
import type { WorldState, GameSettings, GameScreen } from '../types/save';
import type { BattleState } from '../types/battle';
import type { OwnedTechnology } from '../types/technology';
import { GameEngine } from '../game/engine/GameEngine';
import {
  saveManager,
  createSavePayload,
  createNewPlayer,
  defaultSettings,
  defaultWorldState,
} from '../game/save/SaveManager';
import {
  type CloudUser,
  deleteCloudSave,
  getCloudUser,
  loadCloudSave,
  saveCloudGame,
  signOutCloud,
} from '../game/save/CloudSaveClient';
import { audioManager } from '../game/audio/AudioManager';
import { VIEWPORT_HEIGHT, VIEWPORT_WIDTH } from '../types/common';
import { getItem } from '../data/items';
import {
  createOwnedTechnology,
  applyXp,
  fullHeal,
  canUpgrade,
  performUpgrade,
  ensureSkillEP,
  setTechnologyLevel,
} from '../game/technologies/TechnologyEngine';
import { executePlayerAction, resolveEnemyTurn, applyStatStage } from '../game/battle/BattleEngine';
import type { BattleAction } from '../types/battle';
import { getTechnology } from '../data/technologies';
import {
  completeQuestStep,
  startQuest,
  formatQuestReward,
} from '../game/quests/QuestEngine';
import { gymPuzzles, quizzes, questById } from '../data/quests';
import { trainers } from '../data/cities';
import { GYM_LEADERS } from '../data/gymConfig';
import { MAX_PARTY_SIZE } from '../types/common';
import { getScannerTier, rollCapture } from '../game/battle/CaptureCalculator';
import type { VictorySummary } from '../components/VictoryPanel';

export interface Toast {
  id: number;
  text: string;
}

export interface ChallengeState {
  technologyId: string;
  questionIndex: number;
  enemy: OwnedTechnology;
  battle: BattleState;
}

export interface GymPuzzleState {
  gymId: string;
  questionIndex: number;
}

export function useGameState() {
  const [screen, setScreen] = useState<GameScreen>('title');
  const [player, setPlayer] = useState<PlayerState | null>(null);
  const [world, setWorld] = useState<WorldState>(defaultWorldState());
  const [settings, setSettings] = useState<GameSettings>(defaultSettings());
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [dialogueOpen, setDialogueOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [shopId, setShopId] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<ChallengeState | null>(null);
  const [gymPuzzle, setGymPuzzle] = useState<GymPuzzleState | null>(null);
  const [levelUpTech, setLevelUpTech] = useState<OwnedTechnology | null>(null);
  const [victorySummary, setVictorySummary] = useState<VictorySummary | null>(null);
  const [pendingVictoryBattle, setPendingVictoryBattle] = useState<BattleState | null>(null);
  const [battleTransition, setBattleTransition] = useState(false);
  const [hasSave, setHasSave] = useState(false);
  const [cloudUser, setCloudUser] = useState<CloudUser | null>(null);
  const [cloudChecking, setCloudChecking] = useState(true);
  const [engineVersion, setEngineVersion] = useState(0);
  const engineRef = useRef<GameEngine | null>(null);
  const toastId = useRef(0);
  const previousScreen = useRef<GameScreen>('playing');
  const finishBattleRef = useRef<(b: BattleState, won: boolean, escaped?: boolean) => void>(
    () => undefined,
  );
  const showVictoryThenFinishRef = useRef<
    (b: BattleState, leveled: OwnedTechnology[]) => void
  >(() => undefined);

  useEffect(() => {
    let active = true;
    setHasSave(saveManager.hasSave());
    void (async () => {
      try {
        const user = await getCloudUser();
        if (!active) return;
        setCloudUser(user);
        if (user) {
          const save = await loadCloudSave();
          if (active && save) setHasSave(true);
        }
      } finally {
        if (active) setCloudChecking(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const pushToast = useCallback((text: string) => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }, []);

  const cheatBuffer = useRef('');

  const persist = useCallback(
    (p: PlayerState, w: WorldState, s: GameSettings) => {
      saveManager.save(p, w, s);
      setHasSave(true);
      if (cloudUser) {
        const payload = createSavePayload(p, w, s);
        void saveCloudGame(payload).then((ok) => {
          pushToast(ok ? 'Game saved locally + cloud!' : 'Game saved locally. Cloud sync failed.');
        });
        return;
      }
      pushToast('Game saved locally!');
    },
    [cloudUser, pushToast],
  );

  const bindEngine = useCallback(
    (engine: GameEngine) => {
      engine.setEvents({
        onPlayerUpdate: (p) => setPlayer({ ...p }),
        onWorldUpdate: (w) => setWorld({ ...w }),
        onDialogue: (active) => {
          setDialogueOpen(active);
          if (active) {
            setScreen('dialogue');
          } else {
            setScreen((current) =>
              current === 'shop' ||
              current === 'gym_puzzle' ||
              current === 'battle' ||
              current === 'challenge'
                ? current
                : 'playing',
            );
          }
        },
        onBattleStart: (b) => {
          setBattle(b);
          setScreen('battle');
        },
        onBattleTransition: (active) => setBattleTransition(active),
        onMessage: (text) => pushToast(text),
        onShop: (id) => {
          setShopId(id);
          setScreen('shop');
        },
        onGymPuzzle: (gymId) => {
          setGymPuzzle({ gymId, questionIndex: 0 });
          setScreen('gym_puzzle');
        },
        onHealSequence: () => setScreen('heal'),
        onOpenStorage: () => {
          setScreen('storage');
          engine.setMode('menu');
        },
        onSaveRequest: () => {
          const p = engine.getPlayer();
          const w = engine.getWorld();
          persist(p, w, settings);
        },
        onModeChange: (mode) => {
          if (mode === 'menu') {
            previousScreen.current = 'playing';
            setScreen('menu');
          }
        },
      });
      engine.setSettings(settings);
    },
    [persist, pushToast, settings],
  );

  const startNewGame = useCallback(
    (name: string) => {
      void audioManager.resume();
      const p = createNewPlayer(name || 'Byte');
      const w = defaultWorldState();
      setPlayer(p);
      setWorld(w);
      setScreen('playing');
      engineRef.current?.unmount();
      const engine = new GameEngine(p, w, settings);
      engineRef.current = engine;
      bindEngine(engine);
      setEngineVersion((v) => v + 1);
      pushToast('Welcome to TECHMON: Code Frontier!');
    },
    [bindEngine, pushToast, settings],
  );

  const continueGame = useCallback(async () => {
    const save = (cloudUser ? await loadCloudSave() : null) ?? saveManager.load();
    if (!save) {
      pushToast('No valid save found.');
      return;
    }
    void audioManager.resume();
    let party = save.player.party.map(ensureSkillEP);
    let storage = save.player.storage.map(ensureSkillEP);
    let flags = { ...save.player.flags };
    const justBoosted = !flags.boost_lv80;
    // One-shot: boost owned techs to Lv80 for endgame testing
    if (justBoosted) {
      party = party.map((t) => setTechnologyLevel(t, 80));
      storage = storage.map((t) => setTechnologyLevel(t, 80));
      flags = { ...flags, boost_lv80: true };
    }
    const migrated: PlayerState = {
      ...save.player,
      party,
      storage,
      flags,
    };
    setPlayer(migrated);
    setWorld(save.worldState);
    setSettings(save.settings);
    setScreen('playing');
    engineRef.current?.unmount();
    const engine = new GameEngine(migrated, save.worldState, save.settings);
    engineRef.current = engine;
    bindEngine(engine);
    setEngineVersion((v) => v + 1);
    if (justBoosted) saveManager.save(migrated, save.worldState, save.settings);
    pushToast(
      justBoosted
        ? 'Welcome back! All techs set to Lv80.'
        : cloudUser
          ? 'Welcome back from cloud save!'
          : 'Welcome back!',
    );
  }, [bindEngine, cloudUser, pushToast]);

  const refreshCloudUser = useCallback(async () => {
    setCloudChecking(true);
    try {
      const user = await getCloudUser();
      setCloudUser(user);
      if (user && (await loadCloudSave())) setHasSave(true);
      else setHasSave(saveManager.hasSave());
    } finally {
      setCloudChecking(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    await signOutCloud();
    setCloudUser(null);
    setHasSave(saveManager.hasSave());
    pushToast('Signed out.');
  }, [pushToast]);

  const completeHealSequence = useCallback(() => {
    engineRef.current?.healPartyFully();
    if (engineRef.current) {
      setPlayer(engineRef.current.getPlayer());
    }
    pushToast('All systems green! HP and EP restored.');
    if (dialogueOpen) setScreen('dialogue');
    else {
      setScreen('playing');
      engineRef.current?.setMode('world');
    }
  }, [dialogueOpen, pushToast]);

  const openMenu = useCallback(() => {
    previousScreen.current = screen === 'playing' ? 'playing' : previousScreen.current;
    setScreen('menu');
    engineRef.current?.setMode('menu');
  }, [screen]);

  const resumeGame = useCallback(() => {
    setScreen('playing');
    engineRef.current?.setMode('world');
  }, []);

  const syncPlayerToEngine = useCallback((p: PlayerState) => {
    setPlayer(p);
    engineRef.current?.setPlayer(p);
  }, []);

  /** Cheat: type "darshan" anywhere in-game → party all Lv80 */
  useEffect(() => {
    if (!player) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.length !== 1) return;
      const ch = e.key.toLowerCase();
      if (!/[a-z]/.test(ch)) {
        cheatBuffer.current = '';
        return;
      }
      cheatBuffer.current = (cheatBuffer.current + ch).slice(-16);
      if (!cheatBuffer.current.endsWith('darshan')) return;
      cheatBuffer.current = '';
      const boosted = player.party.map((t) => setTechnologyLevel(fullHeal(t), 80));
      syncPlayerToEngine({ ...player, party: boosted });
      pushToast('Cheat accepted: party set to Lv80.');
      audioManager.playSfx('ui');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [player, pushToast, syncPlayerToEngine]);

  const handleBattleAction = useCallback(
    (action: BattleAction) => {
      if (!battle || !player) return;

      if (action.kind === 'register') {
        if (!battle.isWild) {
          pushToast('Can only register wild technologies!');
          return;
        }
        const tier = getScannerTier(player.inventory);
        if (tier === 'none') {
          pushToast('You need a Tech Scanner!');
          return;
        }
        const roll = rollCapture(battle.enemy.tech, battle.enemy.analyzed, tier);
        const chancePct = Math.round(roll.chance * 100);
        if (roll.success) {
          const def = getTechnology(battle.enemy.tech.definitionId);
          let party = battle.playerParty.map((t) => ({ ...ensureSkillEP(t) }));
          let storage = [...player.storage];
          const owned = createOwnedTechnology(
            battle.enemy.tech.definitionId,
            battle.enemy.tech.level,
          );
          if (party.length < MAX_PARTY_SIZE) {
            party = [...party, owned];
            pushToast(`${def.name} registered! (${chancePct}% chance)`);
          } else {
            storage = [...storage, owned];
            pushToast(`${def.name} sent to Tech Storage. (${chancePct}%)`);
          }
          const techDex = { ...player.techDex };
          techDex[def.id] = {
            discovered: true,
            registered: true,
            timesEncountered: (techDex[def.id]?.timesEncountered ?? 0) + 1,
          };
          syncPlayerToEngine({ ...player, party, storage, techDex });
          audioManager.playSfx('victory');
          engineRef.current?.onBattleEnd({
            party,
            won: true,
            money: Math.floor(battle.enemy.tech.level * 5),
            registeredId: def.id,
          });
          setBattle(null);
          setPlayer(engineRef.current?.getPlayer() ?? { ...player, party, storage, techDex });
          setScreen('playing');
          return;
        }
        const failed: BattleState = {
          ...battle,
          log: [
            ...battle.log,
            {
              id: `reg_fail_${Date.now()}`,
              text: `Registration failed! (${chancePct}% chance) The technology resists.`,
            },
          ],
        };
        const turnResult = resolveEnemyTurn(failed);
        setBattle(turnResult.state);
        if (turnResult.state.phase === 'defeat') {
          const lostState = turnResult.state;
          setTimeout(() => finishBattleRef.current(lostState, false), 1200);
        }
        return;
      }

      if (action.kind === 'item') {
        if (
          action.itemId === 'tech_scanner' ||
          action.itemId === 'advanced_scanner' ||
          action.itemId === 'quantum_scanner'
        ) {
          pushToast('Use Register from the battle menu.');
          return;
        }

        const item = getItem(action.itemId);
        const slot = player.inventory.find((i) => i.itemId === action.itemId);
        if (!slot || slot.quantity <= 0 || !item.usableInBattle) {
          pushToast('Cannot use that item.');
          return;
        }

        let tech = { ...battle.player.tech, stats: { ...battle.player.tech.stats } };
        let stages = { ...battle.player.stages };
        let used = false;
        let itemLog = `Used ${item.name}!`;

        if (item.effect?.kind === 'heal') {
          tech.currentHp = Math.min(tech.maxHp, tech.currentHp + item.effect.amount);
          if (action.itemId === 'debug_patch') {
            tech.status = undefined;
            tech.statusTurns = undefined;
          }
          used = true;
        } else if (item.effect?.kind === 'heal_percent') {
          tech.currentHp = Math.min(
            tech.maxHp,
            tech.currentHp + Math.floor(tech.maxHp * (item.effect.percent / 100)),
          );
          used = true;
        } else if (item.effect?.kind === 'clear_status') {
          tech.status = undefined;
          tech.statusTurns = undefined;
          used = true;
        } else if (item.effect?.kind === 'boost_stat') {
          const result = applyStatStage(stages, item.effect.stat, item.effect.stages);
          stages = result.stages;
          itemLog = `Used ${item.name}! ${result.label}`;
          used = true;
        }

        if (!used) {
          pushToast('That item has no effect right now.');
          return;
        }

        const inv = player.inventory
          .map((i) =>
            i.itemId === action.itemId ? { ...i, quantity: i.quantity - 1 } : i,
          )
          .filter((i) => i.quantity > 0);

        const updatedBattle: BattleState = {
          ...battle,
          player: { ...battle.player, tech, stages },
          playerParty: battle.playerParty.map((t) =>
            t.instanceId === tech.instanceId ? tech : t,
          ),
          log: [...battle.log, { id: `item_${Date.now()}`, text: itemLog }],
        };

        syncPlayerToEngine({ ...player, inventory: inv, party: updatedBattle.playerParty });
        const turnResult = resolveEnemyTurn(updatedBattle);
        setBattle(turnResult.state);
        if (turnResult.leveledUp?.length) setLevelUpTech(turnResult.leveledUp[0]);
        if (turnResult.state.phase === 'victory') {
          audioManager.playSfx('victory');
          const wonState = turnResult.state;
          const leveled = turnResult.leveledUp ?? [];
          setTimeout(() => showVictoryThenFinishRef.current(wonState, leveled), 900);
        } else if (turnResult.state.phase === 'defeat') {
          const lostState = turnResult.state;
          setTimeout(() => finishBattleRef.current(lostState, false), 1200);
        }
        return;
      }

      const result = executePlayerAction(battle, action);
      setBattle(result.state);

      if (result.leveledUp && result.leveledUp.length > 0) {
        setLevelUpTech(result.leveledUp[0]);
      }

      if (result.state.phase === 'victory') {
        audioManager.playSfx('victory');
        const wonState = result.state;
        const leveled = result.leveledUp ?? [];
        setTimeout(() => showVictoryThenFinishRef.current(wonState, leveled), 900);
      } else if (result.state.phase === 'defeat') {
        const lostState = result.state;
        setTimeout(() => finishBattleRef.current(lostState, false), 1200);
      } else if (result.state.phase === 'escaped') {
        finishBattleRef.current(result.state, false, true);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [battle, player, pushToast, syncPlayerToEngine],
  );

  /** Stable battle-end helpers — avoid stale closures from setTimeout / empty deps */
  const finishBattle = useCallback((b: BattleState, won: boolean, escaped = false) => {
    const engine = engineRef.current;
    if (!engine) return;

    const trainerId = b.trainerId;
    const party = b.playerParty;
    const money = won && !escaped ? b.moneyReward : 0;

    // Multi-pokemon trainer: spawn next if any
    if (won && trainerId && !escaped) {
      const trainer = trainers[trainerId];
      const idx = (b.trainerPartyIndex ?? 0) + 1;
      if (trainer && idx < trainer.party.length) {
        const nextMember = trainer.party[idx];
        const enemy = createOwnedTechnology(nextMember.technologyId, nextMember.level);
        const nextBattle: BattleState = {
          ...b,
          phase: 'player_turn',
          enemy: {
            tech: enemy,
            analyzed: false,
            revealedTypes: [],
            revealedWeaknesses: [],
            stages: {
              attack: 0,
              defense: 0,
              specialAttack: 0,
              specialDefense: 0,
              speed: 0,
            },
          },
          log: [
            ...b.log,
            {
              id: `n_${Date.now()}`,
              text: `${trainer.name} sent out ${getTechnology(nextMember.technologyId).name}!`,
            },
          ],
          xpReward: nextMember.level * 10,
          trainerId,
          trainerPartyIndex: idx,
        };
        setBattle(nextBattle);
        setLevelUpTech(null);
        setVictorySummary(null);
        setPendingVictoryBattle(null);
        setScreen('battle');
        return;
      }
    }

    engine.onBattleEnd({
      party,
      won: won && !escaped,
      money,
      trainerId: won && !escaped ? trainerId : undefined,
      escaped,
    });
    setBattle(null);
    setLevelUpTech(null);
    setVictorySummary(null);
    setPendingVictoryBattle(null);
    setPlayer(engine.getPlayer());
    const mode = engine.getMode();
    if (mode === 'dialogue') {
      setDialogueOpen(true);
      setScreen('dialogue');
    } else {
      setDialogueOpen(false);
      setScreen('playing');
      if (mode === 'battle') {
        engine.setMode('world');
      }
    }
  }, []);

  const showVictoryThenFinish = useCallback(
    (b: BattleState, leveled: OwnedTechnology[]) => {
      const trainerId = b.trainerId;
      // Multi-pokemon trainer: continue without victory panel yet
      if (trainerId) {
        const trainer = trainers[trainerId];
        const idx = (b.trainerPartyIndex ?? 0) + 1;
        if (trainer && idx < trainer.party.length) {
          finishBattle(b, true);
          return;
        }
        // Gym leaders: go straight to badge dialogue (no victory panel)
        if (trainer?.winDialogueId) {
          finishBattle(b, true);
          return;
        }
      }

      setVictorySummary({
        xpGained: b.xpReward,
        creditsGained: b.moneyReward,
        party: b.playerParty,
        leveled,
        enemyName: getTechnology(b.enemy.tech.definitionId).name,
      });
      setPendingVictoryBattle(b);
      setScreen('victory');
    },
    [finishBattle],
  );

  finishBattleRef.current = finishBattle;
  showVictoryThenFinishRef.current = showVictoryThenFinish;

  const confirmVictory = useCallback(() => {
    if (!pendingVictoryBattle) return;
    const b = pendingVictoryBattle;
    setVictorySummary(null);
    setPendingVictoryBattle(null);
    finishBattleRef.current(b, true);
  }, [pendingVictoryBattle]);

  const submitChallengeAnswer = useCallback(
    (correct: boolean) => {
      if (!challenge || !player) return;
      const def = getTechnology(challenge.technologyId);
      if (!correct) {
        pushToast(`Incorrect. ${def.challenges[challenge.questionIndex % def.challenges.length]?.explanation ?? 'Try again!'}`);
        // Spend the turn: return to battle and let the enemy act
        const turnResult = resolveEnemyTurn({
          ...challenge.battle,
          log: [
            ...challenge.battle.log,
            {
              id: `scan_fail_${Date.now()}`,
              text: 'Analysis failed! The technology resists registration.',
            },
          ],
        });
        setChallenge(null);
        setBattle(turnResult.state);
        setScreen('battle');
        if (turnResult.state.phase === 'defeat') {
          const lostState = turnResult.state;
          setTimeout(() => finishBattleRef.current(lostState, false), 1200);
        }
        return;
      }

      // Keep battle HP/XP state, then add the registered technology
      let party = challenge.battle.playerParty.map((t) => ({
        ...t,
        stats: { ...t.stats },
        skillIds: [...t.skillIds],
      }));
      let storage = [...player.storage];
      const owned = createOwnedTechnology(challenge.technologyId, challenge.enemy.level);
      if (party.length < MAX_PARTY_SIZE) {
        party.push(owned);
      } else {
        storage.push(owned);
        pushToast(`${def.name} sent to Tech Storage.`);
      }

      const techDex = { ...player.techDex };
      techDex[challenge.technologyId] = {
        discovered: true,
        registered: true,
        timesEncountered: (techDex[challenge.technologyId]?.timesEncountered ?? 0) + 1,
      };

      // Award XP for successful analysis to the active battler
      const activeIdx = party.findIndex(
        (t) => t.instanceId === challenge.battle.player.tech.instanceId,
      );
      const xpIdx = activeIdx >= 0 ? activeIdx : 0;
      if (party[xpIdx]) {
        const xpResult = applyXp(party[xpIdx], 40);
        party[xpIdx] = xpResult.tech;
        if (xpResult.leveled) setLevelUpTech(xpResult.tech);
      }

      const updated = { ...player, party, storage, techDex };
      syncPlayerToEngine(updated);
      pushToast(`${def.name} registered in TechDex!`);

      engineRef.current?.onBattleEnd({
        party,
        won: true,
        money: Math.floor(challenge.enemy.level * 5),
        registeredId: challenge.technologyId,
      });
      setChallenge(null);
      setBattle(null);
      setPlayer(engineRef.current?.getPlayer() ?? updated);
      setScreen('playing');
    },
    [challenge, player, pushToast, syncPlayerToEngine, finishBattle],
  );

  const submitGymAnswer = useCallback(
    (correct: boolean) => {
      if (!gymPuzzle) return;
      const puzzle = gymPuzzles[gymPuzzle.gymId];
      if (!puzzle) return;
      if (!correct) {
        pushToast('Wrong answer! Try again from the start.');
        setGymPuzzle({ gymId: gymPuzzle.gymId, questionIndex: 0 });
        return;
      }
      const next = gymPuzzle.questionIndex + 1;
      if (next >= puzzle.questions.length) {
        pushToast('Gym challenges complete!');
        setGymPuzzle(null);
        const dialogueId =
          GYM_LEADERS[gymPuzzle.gymId]?.dialogueId ??
          (gymPuzzle.gymId === 'frontend' ? 'maya_intro' : 'arjun_intro');
        const nodeId = puzzle.battleDialogueId;
        setScreen('playing');
        engineRef.current?.setMode('world');
        engineRef.current?.startDialogue(dialogueId, nodeId);
        return;
      }
      setGymPuzzle({ ...gymPuzzle, questionIndex: next });
      pushToast('Correct!');
    },
    [gymPuzzle, pushToast],
  );

  const buyItem = useCallback(
    (itemId: string) => {
      if (!player) return;
      const item = getItem(itemId);
      if (player.money < item.price) {
        pushToast('Not enough credits!');
        return;
      }
      const inv = [...player.inventory];
      const slot = inv.find((i) => i.itemId === itemId);
      if (slot) slot.quantity += 1;
      else inv.push({ itemId, quantity: 1 });
      syncPlayerToEngine({ ...player, money: player.money - item.price, inventory: inv });
      audioManager.playSfx('ui');
      pushToast(`Bought ${item.name}!`);
    },
    [player, pushToast, syncPlayerToEngine],
  );

  const useItem = useCallback(
    (itemId: string, partyIndex = 0) => {
      if (!player) return;
      const item = getItem(itemId);
      const slot = player.inventory.find((i) => i.itemId === itemId);
      if (!slot || slot.quantity <= 0) return;
      if (!item.usableInField && screen !== 'battle') {
        pushToast('Cannot use that here.');
        return;
      }

      let party = player.party.map((t) => ({ ...t }));
      let xpBoosterBattles = player.xpBoosterBattles;
      const tech = party[partyIndex];
      if (!tech && item.effect?.kind !== 'xp_boost') {
        pushToast('No technology selected.');
        return;
      }

      if (item.effect?.kind === 'heal' && tech) {
        tech.currentHp = Math.min(tech.maxHp, tech.currentHp + item.effect.amount);
        if (itemId === 'debug_patch') {
          tech.status = undefined;
        }
      } else if (item.effect?.kind === 'heal_percent' && tech) {
        tech.currentHp = Math.min(
          tech.maxHp,
          tech.currentHp + Math.floor(tech.maxHp * (item.effect.percent / 100)),
        );
      } else if (item.effect?.kind === 'clear_status' && tech) {
        tech.status = undefined;
        tech.statusTurns = undefined;
      } else if (item.effect?.kind === 'xp_boost') {
        xpBoosterBattles = item.effect.battles;
        pushToast('XP Booster activated!');
      } else {
        pushToast('Nothing happened.');
        return;
      }

      const inv = player.inventory
        .map((i) => (i.itemId === itemId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0);

      syncPlayerToEngine({ ...player, party, inventory: inv, xpBoosterBattles });
      pushToast(`Used ${item.name}.`);
    },
    [player, pushToast, screen, syncPlayerToEngine],
  );

  const discardItem = useCallback(
    (itemId: string) => {
      if (!player) return;
      const item = getItem(itemId);
      if (!item.discardable) {
        pushToast('Key item — cannot discard.');
        return;
      }
      const inv = player.inventory
        .map((i) => (i.itemId === itemId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0);
      syncPlayerToEngine({ ...player, inventory: inv });
    },
    [player, pushToast, syncPlayerToEngine],
  );

  const swapParty = useCallback(
    (a: number, b: number) => {
      if (!player) return;
      const party = [...player.party];
      if (!party[a] || !party[b]) return;
      [party[a], party[b]] = [party[b], party[a]];
      syncPlayerToEngine({ ...player, party });
    },
    [player, syncPlayerToEngine],
  );

  const moveToStorage = useCallback(
    (index: number) => {
      if (!player || player.party.length <= 1) {
        pushToast('Keep at least one technology in your party!');
        return;
      }
      const party = [...player.party];
      const [removed] = party.splice(index, 1);
      syncPlayerToEngine({ ...player, party, storage: [...player.storage, removed] });
    },
    [player, pushToast, syncPlayerToEngine],
  );

  const moveToParty = useCallback(
    (index: number) => {
      if (!player) return;
      if (player.party.length >= MAX_PARTY_SIZE) {
        pushToast('Party is full!');
        return;
      }
      const storage = [...player.storage];
      const [removed] = storage.splice(index, 1);
      syncPlayerToEngine({ ...player, storage, party: [...player.party, removed] });
    },
    [player, pushToast, syncPlayerToEngine],
  );

  /** Permanently remove a technology from the party */
  const unlearnFromParty = useCallback(
    (index: number) => {
      if (!player) return;
      if (player.party.length <= 1) {
        pushToast('Keep at least one technology!');
        return;
      }
      const tech = player.party[index];
      if (!tech) return;
      const name = getTechnology(tech.definitionId).name;
      if (
        typeof window !== 'undefined' &&
        !window.confirm(`Unlearn ${name} from your party? This cannot be undone.`)
      ) {
        return;
      }
      const party = player.party.filter((_, i) => i !== index);
      syncPlayerToEngine({ ...player, party });
      pushToast(`Unlearned ${name}.`);
    },
    [player, pushToast, syncPlayerToEngine],
  );

  /** Forget one skill / move (keep at least one) */
  const forgetSkill = useCallback(
    (partyIndex: number, skillId: string) => {
      if (!player) return;
      const tech = player.party[partyIndex];
      if (!tech) return;
      if (tech.skillIds.length <= 1) {
        pushToast('A technology must keep at least one move.');
        return;
      }
      if (!tech.skillIds.includes(skillId)) return;
      const skillName = skillId.replace(/_/g, ' ');
      if (
        typeof window !== 'undefined' &&
        !window.confirm(`Forget move "${skillName}"?`)
      ) {
        return;
      }
      const skillIds = tech.skillIds.filter((id) => id !== skillId);
      const skillEP = { ...tech.skillEP };
      delete skillEP[skillId];
      const party = [...player.party];
      party[partyIndex] = { ...tech, skillIds, skillEP };
      syncPlayerToEngine({ ...player, party });
      pushToast(`Forgot ${skillName}.`);
    },
    [player, pushToast, syncPlayerToEngine],
  );

  const healParty = useCallback(() => {
    if (!player) return;
    syncPlayerToEngine({
      ...player,
      party: player.party.map(fullHeal),
    });
    pushToast('Party restored!');
  }, [player, pushToast, syncPlayerToEngine]);

  const tryUpgrade = useCallback(
    (index: number, targetTechnologyId?: string) => {
      if (!player) return;
      const tech = player.party[index];
      if (!tech) return;
      const itemIds = player.inventory.flatMap((i) => Array(i.quantity).fill(i.itemId) as string[]);
      if (!canUpgrade(tech, itemIds, player.completedQuests, targetTechnologyId)) {
        pushToast('Upgrade requirements not met.');
        return;
      }
      const upgraded = performUpgrade(tech, targetTechnologyId);
      const party = [...player.party];
      party[index] = upgraded;
      syncPlayerToEngine({ ...player, party });
      pushToast(`Upgraded to ${getTechnology(upgraded.definitionId).name}!`);
    },
    [player, pushToast, syncPlayerToEngine],
  );

  const saveGame = useCallback(() => {
    if (!player) return;
    const p = engineRef.current?.getPlayer() ?? player;
    const w = engineRef.current?.getWorld() ?? world;
    persist(p, w, settings);
  }, [persist, player, settings, world]);

  const resetSave = useCallback(() => {
    saveManager.reset();
    if (cloudUser) void deleteCloudSave();
    setHasSave(false);
    pushToast('Save data cleared.');
  }, [cloudUser, pushToast]);

  const submitQuiz = useCallback(
    (quizId: string, optionIndex: number) => {
      if (!player) return false;
      const quiz = quizzes[quizId];
      if (!quiz) return false;
      if (optionIndex !== quiz.correctIndex) {
        pushToast(`Wrong: ${quiz.explanation}`);
        return false;
      }
      pushToast(`Correct! ${quiz.explanation}`);

      // Find active quest step with this quiz
      for (const aq of player.activeQuests) {
        const def = questById[aq.questId];
        const step = def?.steps[aq.stepIndex];
        if (step?.kind === 'quiz' && step.quizId === quizId) {
          const result = completeQuestStep(player, aq.questId, step.id);
          let p = result.player;
          for (const item of result.rewardItems) {
            const inv = [...p.inventory];
            const slot = inv.find((i) => i.itemId === item.itemId);
            if (slot) slot.quantity += item.quantity;
            else inv.push({ ...item });
            p = { ...p, inventory: inv };
          }
          if (result.rewardXp > 0 && p.party[0]) {
            p = { ...p, party: [applyXp(p.party[0], result.rewardXp).tech, ...p.party.slice(1)] };
          }
          syncPlayerToEngine(p);
          if (result.questCompleted) {
            pushToast(`Quest complete! Reward: ${formatQuestReward(result)}`);
          }
          break;
        }
      }
      return true;
    },
    [player, pushToast, syncPlayerToEngine],
  );

  const beginQuest = useCallback(
    (questId: string) => {
      if (!player) return;
      syncPlayerToEngine(startQuest(player, questId));
      pushToast('Quest added.');
    },
    [player, pushToast, syncPlayerToEngine],
  );

  return {
    screen,
    setScreen,
    player,
    world,
    settings,
    setSettings,
    battle,
    dialogueOpen,
    toasts,
    shopId,
    setShopId,
    challenge,
    gymPuzzle,
    levelUpTech,
    setLevelUpTech,
    victorySummary,
    battleTransition,
    hasSave,
    cloudUser,
    cloudChecking,
    engineRef,
    engineVersion,
    viewport: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT },
    startNewGame,
    continueGame,
    refreshCloudUser,
    signOut,
    openMenu,
    resumeGame,
    handleBattleAction,
    confirmVictory,
    completeHealSequence,
    submitChallengeAnswer,
    submitGymAnswer,
    buyItem,
    useItem,
    discardItem,
    swapParty,
    moveToStorage,
    moveToParty,
    unlearnFromParty,
    forgetSkill,
    healParty,
    tryUpgrade,
    saveGame,
    resetSave,
    submitQuiz,
    beginQuest,
    pushToast,
    syncPlayerToEngine,
  };
}

export type GameStateApi = ReturnType<typeof useGameState>;
