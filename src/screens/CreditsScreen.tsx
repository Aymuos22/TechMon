export function CreditsScreen({ onClose }: { onClose: () => void }) {
  return (
    <div className="overlay-panel credits-panel">
      <h2>Credits</h2>
      <p>
        <strong>TECHMON: Code Frontier</strong>
      </p>
      <p>Build. Battle. Deploy.</p>
      <p>An original tech-collecting RPG.</p>
      <p>No Pokémon assets were used.</p>
      <p>Engine: React · TypeScript · Canvas</p>
      <p>Pixel world · Turn-based battles · Local saves</p>
      <button type="button" onClick={onClose}>
        Back
      </button>
    </div>
  );
}
