import { useGameState } from './hooks/useGameState';
import { TitleScreen } from './screens/TitleScreen';
import { GameScreen } from './screens/GameScreen';
import { CreditsScreen } from './screens/CreditsScreen';
import { TechDex } from './components/TechDex';
import { SettingsPanel } from './components/SettingsPanel';
import { technologies } from './data/technologies';
import './App.css';

function App() {
  const game = useGameState();

  if (game.screen === 'title') {
    return (
      <div className="app-shell">
        <TitleScreen
          hasSave={game.hasSave}
          onNewGame={game.startNewGame}
          onContinue={game.continueGame}
          onTechDex={() => game.setScreen('techdex')}
          onSettings={() => game.setScreen('settings')}
          onCredits={() => game.setScreen('credits')}
        />
      </div>
    );
  }

  if (game.screen === 'credits') {
    return (
      <div className="app-shell">
        <CreditsScreen onClose={() => game.setScreen('title')} />
      </div>
    );
  }

  if (game.screen === 'techdex' && !game.player) {
    const emptyDex = Object.fromEntries(
      technologies.map((t) => [
        t.id,
        { discovered: false, registered: false, timesEncountered: 0 },
      ]),
    );
    return (
      <div className="app-shell">
        <TechDex techDex={emptyDex} onClose={() => game.setScreen('title')} />
      </div>
    );
  }

  if (game.screen === 'settings' && !game.player) {
    return (
      <div className="app-shell">
        <SettingsPanel
          settings={game.settings}
          onChange={game.setSettings}
          onClose={() => game.setScreen('title')}
          onReset={game.resetSave}
        />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <GameScreen game={game} />
    </div>
  );
}

export default App;
