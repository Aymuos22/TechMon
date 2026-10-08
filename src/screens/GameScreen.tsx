import { useEffect } from 'react';
import type { GameStateApi } from '../hooks/useGameState';
import { GameCanvas } from '../components/GameCanvas';
import { DialogueBox } from '../components/DialogueBox';
import { BattleUI } from '../components/BattleUI';
import { PauseMenu } from '../components/PauseMenu';
import { Inventory } from '../components/Inventory';
import { TechDex } from '../components/TechDex';
import { TechnologyParty } from '../components/TechnologyParty';
import { QuestPanel } from '../components/QuestPanel';
import { MiniMap } from '../components/MiniMap';
import { ShopPanel } from '../components/ShopPanel';
import { ChallengePanel } from '../components/ChallengePanel';
import { GymPuzzlePanel } from '../components/GymPuzzlePanel';
import { SettingsPanel } from '../components/SettingsPanel';
import { MobileControls } from '../components/MobileControls';
import { VictoryPanel } from '../components/VictoryPanel';
import { HealSequence } from '../components/HealSequence';
import { EngineerCard } from '../components/EngineerCard';
import { getTechnology } from '../data/technologies';
import { audioManager } from '../game/audio/AudioManager';

interface Props {
  game: GameStateApi;
}

export function GameScreen({ game }: Props) {
  const {
    screen,
    setScreen,
    player,
    settings,
    setSettings,
    battle,
    engineRef,
    engineVersion,
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
    tryUpgrade,
    saveGame,
    resetSave,
    submitQuiz,
    shopId,
    setShopId,
    challenge,
    gymPuzzle,
    levelUpTech,
    setLevelUpTech,
    victorySummary,
    battleTransition,
    toasts,
  } = game;

  useEffect(() => {
    if (levelUpTech) {
      const t = window.setTimeout(() => setLevelUpTech(null), 2200);
      return () => window.clearTimeout(t);
    }
  }, [levelUpTech, setLevelUpTech]);

  useEffect(() => {
    if (screen !== 'victory') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'z' || e.key === 'Z' || e.key === ' ') {
        e.preventDefault();
        confirmVictory();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [screen, confirmVictory]);

  if (!player) return null;

  const closeOverlay = () => {
    setScreen('playing');
    engineRef.current?.setMode('world');
  };

  return (
    <div className="game-screen">
      <div className="game-frame">
        <GameCanvas key={engineVersion} engine={engineRef.current} />

        {battleTransition && <div className="battle-transition-flash" aria-hidden />}

        {(screen === 'dialogue' || game.dialogueOpen) && engineRef.current && (
          <DialogueBox dialogue={engineRef.current.getDialogueEngine()} />
        )}

        {screen === 'battle' && battle && (
          <BattleUI
            battle={battle}
            inventory={player.inventory}
            onAction={handleBattleAction}
            levelUpName={
              levelUpTech ? getTechnology(levelUpTech.definitionId).name : null
            }
          />
        )}

        {screen === 'victory' && victorySummary && (
          <VictoryPanel summary={victorySummary} onContinue={confirmVictory} />
        )}

        {screen === 'heal' && <HealSequence onDone={completeHealSequence} />}

        {screen === 'menu' && (
          <PauseMenu
            onResume={resumeGame}
            onSave={saveGame}
            onSelect={(id) => {
              audioManager.playSfx('ui');
              if (id === 'party') setScreen('party');
              else if (id === 'techdex') setScreen('techdex');
              else if (id === 'inventory') setScreen('inventory');
              else if (id === 'quests') setScreen('quests');
              else if (id === 'map') setScreen('map');
              else if (id === 'settings') setScreen('settings');
              else if (id === 'engineer_card') setScreen('engineer_card');
            }}
          />
        )}

        {screen === 'inventory' && (
          <Inventory
            inventory={player.inventory}
            onUse={useItem}
            onDiscard={discardItem}
            onClose={closeOverlay}
          />
        )}

        {screen === 'techdex' && (
          <TechDex techDex={player.techDex} onClose={closeOverlay} />
        )}

        {screen === 'party' && (
          <TechnologyParty
            party={player.party}
            storage={player.storage}
            onSwap={swapParty}
            onToStorage={moveToStorage}
            onToParty={moveToParty}
            onUpgrade={tryUpgrade}
            onClose={closeOverlay}
            allowStorage={false}
          />
        )}

        {screen === 'storage' && (
          <TechnologyParty
            party={player.party}
            storage={player.storage}
            onSwap={swapParty}
            onToStorage={moveToStorage}
            onToParty={moveToParty}
            onUpgrade={tryUpgrade}
            onClose={closeOverlay}
            allowStorage
          />
        )}

        {screen === 'engineer_card' && (
          <EngineerCard player={player} onClose={closeOverlay} />
        )}

        {screen === 'quests' && (
          <QuestPanel player={player} onClose={closeOverlay} onQuiz={submitQuiz} />
        )}

        {screen === 'map' && <MiniMap player={player} onClose={closeOverlay} />}

        {screen === 'shop' && shopId && (
          <ShopPanel
            shopId={shopId}
            money={player.money}
            onBuy={buyItem}
            onClose={() => {
              setShopId(null);
              closeOverlay();
            }}
          />
        )}

        {screen === 'challenge' && challenge && (
          <ChallengePanel
            challenge={challenge}
            onAnswer={submitChallengeAnswer}
            onCancel={() => setScreen('battle')}
          />
        )}

        {screen === 'gym_puzzle' && gymPuzzle && (
          <GymPuzzlePanel
            puzzle={gymPuzzle}
            onAnswer={submitGymAnswer}
            onClose={closeOverlay}
          />
        )}

        {screen === 'settings' && (
          <SettingsPanel
            settings={settings}
            onChange={(s) => {
              setSettings(s);
              engineRef.current?.setSettings(s);
            }}
            onClose={closeOverlay}
            onReset={resetSave}
          />
        )}

        <div className="hud" aria-label="Status">
          <span>₿{player.money.toLocaleString()}</span>
          <button type="button" className="hud-menu" onClick={() => game.openMenu()}>
            M
          </button>
        </div>

        <div className="toast-stack">
          {toasts.map((t) => (
            <div key={t.id} className="toast">
              {t.text}
            </div>
          ))}
        </div>

        {levelUpTech && screen !== 'battle' && screen !== 'victory' && (
          <div className="level-up-banner floating">
            LEVEL UP! {getTechnology(levelUpTech.definitionId).name} → Lv
            {levelUpTech.level}
          </div>
        )}
      </div>

      <MobileControls
        engine={engineRef.current}
        visible={
          settings.showMobileControls ||
          (typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches)
        }
      />
    </div>
  );
}
