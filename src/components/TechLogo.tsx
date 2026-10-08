import { useEffect, useState } from 'react';
import {
  getLogoMeta,
  getTechLogoPlate,
  getTechLogoUrl,
  techLogoNeedsDarkPlate,
  techLogoNeedsLightPlate,
} from '../data/logos';
import { getTechnology } from '../data/technologies';

interface Props {
  technologyId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  /** Dim / silhouette for undiscovered TechDex entries */
  silhouette?: boolean;
}

export function TechLogo({
  technologyId,
  size = 'md',
  className = '',
  silhouette = false,
}: Props) {
  const [failed, setFailed] = useState(false);
  const url = getTechLogoUrl(technologyId);
  const def = getTechnology(technologyId);
  const meta = getLogoMeta(technologyId, def.color);
  const initials = def.name.slice(0, 2).toUpperCase();
  const lightPlate = techLogoNeedsLightPlate(technologyId);
  const darkPlate = techLogoNeedsDarkPlate(technologyId);
  const plate = silhouette ? '#2a2a2a' : getTechLogoPlate(technologyId, def.color);

  // Reset error state when tech/url changes (hot reload / party switch)
  useEffect(() => {
    setFailed(false);
  }, [technologyId, url]);

  if (!url || failed) {
    return (
      <div
        className={`tech-logo tech-logo-${size} tech-logo-fallback ${className}`}
        style={{ background: silhouette ? '#555' : def.color }}
        aria-label={def.name}
      >
        <span>{silhouette ? '?' : initials}</span>
      </div>
    );
  }

  return (
    <div
      className={`tech-logo tech-logo-${size} tech-logo-ink-${meta.ink} ${
        lightPlate ? 'tech-logo-light' : ''
      } ${darkPlate ? 'tech-logo-dark' : ''} ${
        silhouette ? 'tech-logo-silhouette' : ''
      } ${className}`}
      style={{ background: plate }}
      aria-label={def.name}
    >
      <img src={url} alt="" draggable={false} onError={() => setFailed(true)} />
    </div>
  );
}
