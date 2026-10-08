import type { GameSettings } from '../types/save';
import { audioManager } from '../game/audio/AudioManager';

interface Props {
  settings: GameSettings;
  onChange: (s: GameSettings) => void;
  onClose: () => void;
  onReset?: () => void;
}

export function SettingsPanel({ settings, onChange, onClose, onReset }: Props) {
  return (
    <div className="overlay-panel settings-panel">
      <header>
        <h2>Settings</h2>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </header>
      <label>
        Music Volume
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={settings.musicVolume}
          onChange={(e) => {
            const musicVolume = Number(e.target.value);
            audioManager.setMusicVolume(musicVolume);
            onChange({ ...settings, musicVolume });
          }}
        />
      </label>
      <label>
        SFX Volume
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={settings.sfxVolume}
          onChange={(e) => {
            const sfxVolume = Number(e.target.value);
            audioManager.setSfxVolume(sfxVolume);
            onChange({ ...settings, sfxVolume });
          }}
        />
      </label>
      <label>
        Text Speed
        <select
          value={settings.textSpeed}
          onChange={(e) =>
            onChange({
              ...settings,
              textSpeed: e.target.value as GameSettings['textSpeed'],
            })
          }
        >
          <option value="slow">Slow</option>
          <option value="normal">Normal</option>
          <option value="fast">Fast</option>
        </select>
      </label>
      <label className="checkbox">
        <input
          type="checkbox"
          checked={settings.showMobileControls}
          onChange={(e) => onChange({ ...settings, showMobileControls: e.target.checked })}
        />
        Show mobile controls
      </label>
      {onReset && (
        <button type="button" className="danger" onClick={onReset}>
          Reset Save Data
        </button>
      )}
    </div>
  );
}
