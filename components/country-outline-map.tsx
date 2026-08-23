'use client';

import { useEffect, useMemo, useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { geoMercator } from 'd3-geo';
import type { Feature, Geometry } from 'geojson';

const GEO_URL = '/geo/monitored-countries.json';
const VIEW_WIDTH = 760;
const VIEW_HEIGHT = 520;
const PADDING = 36;

interface CountryOutlineMapProps {
  countryId: string;
  countryName: string;
}

export function CountryOutlineMap({ countryId, countryName }: CountryOutlineMapProps) {
  const [geoData, setGeoData] = useState<{ type: string; features: Feature<Geometry>[] } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(GEO_URL)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load boundary data');
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setGeoData(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedFeature = useMemo(() => {
    if (!geoData) return null;
    return (
      geoData.features.find(
        (f) => (f.properties as { id?: string } | null)?.id === countryId
      ) || null
    );
  }, [geoData, countryId]);

  // react-simple-maps' runtime contract for a function `projection` prop is a
  // ready-made, already-configured d3 GeoProjection instance (which is itself
  // callable) — not a `(width, height, config) => GeoProjection` factory, despite
  // what @types/react-simple-maps declares. Passing the instance directly keeps
  // its `.stream` method intact for internal geoPath rendering.
  const projection = useMemo(() => {
    const base = geoMercator();
    if (selectedFeature) {
      base.fitExtent(
        [
          [PADDING, PADDING],
          [VIEW_WIDTH - PADDING, VIEW_HEIGHT - PADDING],
        ],
        selectedFeature as never
      );
    }
    return base as unknown as (width: number, height: number, config: unknown) => ReturnType<typeof geoMercator>;
  }, [selectedFeature]);

  if (error) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            color: 'var(--text-dim)',
          }}
        >
          Boundary data unavailable.
        </span>
      </div>
    );
  }

  if (!geoData || !selectedFeature) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            color: 'var(--text-dim)',
          }}
        >
          Loading outline...
        </span>
      </div>
    );
  }

  return (
    <div
      style={{ width: '100%', height: '100%' }}
      role="img"
      aria-label={`Outline map of ${countryName}`}
    >
      <ComposableMap
        projection={projection}
        width={VIEW_WIDTH}
        height={VIEW_HEIGHT}
        style={{ width: '100%', height: '100%' }}
      >
        <Geographies geography={geoData}>
          {({ geographies }) =>
            geographies
              .filter((geo) => (geo.properties as { id?: string })?.id === countryId)
              .map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: {
                      fill: 'var(--bg-control)',
                      stroke: 'var(--text-primary)',
                      strokeWidth: 1.25,
                      outline: 'none',
                    },
                    hover: {
                      fill: 'var(--bg-control-active)',
                      stroke: 'var(--text-primary)',
                      strokeWidth: 1.25,
                      outline: 'none',
                    },
                    pressed: {
                      fill: 'var(--bg-control-active)',
                      stroke: 'var(--text-primary)',
                      strokeWidth: 1.25,
                      outline: 'none',
                    },
                  }}
                />
              ))
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
}
