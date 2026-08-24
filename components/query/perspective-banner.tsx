import { flagFor } from '@/lib/intelligence-view-model';

interface PerspectiveBannerProps {
  perspectiveCountry?: string;
  perspectiveCountryCode?: string;
  sourceCountries: string[];
  cached?: boolean;
  elapsedSeconds?: number;
}

export function PerspectiveBanner({
  perspectiveCountry,
  perspectiveCountryCode,
  sourceCountries,
  cached,
  elapsedSeconds,
}: PerspectiveBannerProps) {
  if (!perspectiveCountry && sourceCountries.length === 0 && cached === undefined) return null;

  return (
    <div className="flex items-center gap-3 flex-wrap mb-3">
      {perspectiveCountry && (
        <div
          className="flex items-center gap-2"
          style={{
            border: '1px solid var(--accent-warning)',
            borderRadius: 8,
            padding: '5px 10px',
            background: 'color-mix(in srgb, var(--accent-warning) 10%, transparent)',
          }}
        >
          <span style={{ fontSize: 13 }} aria-hidden="true">
            {flagFor(perspectiveCountry, perspectiveCountryCode)}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              fontSize: 10,
              color: 'var(--accent-warning)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Perspective · {perspectiveCountry}
          </span>
        </div>
      )}

      {sourceCountries.map((country) => (
        <div
          key={country}
          className="flex items-center gap-2"
          style={{
            border: '1px solid var(--border-hover)',
            borderRadius: 8,
            padding: '5px 10px',
            background: 'var(--bg-surface)',
          }}
        >
          <span style={{ fontSize: 13 }} aria-hidden="true">
            {flagFor(country)}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              fontSize: 10,
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Source · {country}
          </span>
        </div>
      ))}

      {cached !== undefined && (
        <div className="flex items-center gap-2 ml-auto">
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: cached ? 'var(--text-dim)' : 'var(--accent-warning)',
              flexShrink: 0,
            }}
            aria-hidden="true"
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 500,
              fontSize: 10,
              color: 'var(--text-dim)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {cached ? 'Analysis Stable' : 'Freshly Computed'}
            {typeof elapsedSeconds === 'number' ? ` · ${elapsedSeconds.toFixed(1)}s` : ''}
          </span>
        </div>
      )}
    </div>
  );
}
