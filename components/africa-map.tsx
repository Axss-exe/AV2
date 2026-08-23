'use client';

import { useEffect, useRef } from 'react';

// Coordinates for monitored countries
const MONITORED_COUNTRIES: {
  name: string;
  lat: number;
  lng: number;
  gdp: string;
  gdp_growth: string;
  capital: string;
  flag: string;
}[] = [
  { name: 'Kenya', lat: -1.286389, lng: 36.817223, gdp: '$118.1B', gdp_growth: '+5.4%', capital: 'Nairobi', flag: '🇰🇪' },
  { name: 'Tanzania', lat: -6.369028, lng: 34.888822, gdp: '$84.0B', gdp_growth: '+5.1%', capital: 'Dodoma', flag: '🇹🇿' },
  { name: 'Nigeria', lat: 9.072264, lng: 7.491302, gdp: '$477.4B', gdp_growth: '+3.1%', capital: 'Abuja', flag: '🇳🇬' },
  { name: 'Ghana', lat: 5.603717, lng: -0.187, gdp: '$76.4B', gdp_growth: '+2.9%', capital: 'Accra', flag: '🇬🇭' },
  { name: 'Ethiopia', lat: 9.145, lng: 40.489673, gdp: '$156.1B', gdp_growth: '+6.1%', capital: 'Addis Ababa', flag: '🇪🇹' },
  { name: 'Rwanda', lat: -1.940278, lng: 29.873888, gdp: '$13.3B', gdp_growth: '+8.2%', capital: 'Kigali', flag: '🇷🇼' },
  { name: 'Uganda', lat: 1.373333, lng: 32.290275, gdp: '$49.3B', gdp_growth: '+5.7%', capital: 'Kampala', flag: '🇺🇬' },
  { name: 'Zimbabwe', lat: -20.1, lng: 28.9, gdp: '$26.7B', gdp_growth: '+3.4%', capital: 'Harare', flag: '🇿🇼' },
];

interface AfricaMapProps {
  onCountryClick?: (name: string) => void;
}

export function AfricaMap({ onCountryClick }: AfricaMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('leaflet').Map | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;
    if (mapRef.current) return; // Already initialised

    // Dynamic import to avoid SSR
    import('leaflet').then((L) => {
      // Fix default icon paths
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const map = L.map(containerRef.current!, {
        center: [5, 25],
        zoom: 3,
        zoomControl: true,
        scrollWheelZoom: true,
        attributionControl: true,
      });

      mapRef.current = map;

      // Dark basemap tile layer
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          maxZoom: 19,
        }
      ).addTo(map);

      // Custom circle marker icon
      MONITORED_COUNTRIES.forEach((country) => {
        const circle = L.circleMarker([country.lat, country.lng], {
          radius: 8,
          fillColor: 'var(--text-primary)',
          fillOpacity: 0.9,
          color: 'var(--border-default)',
          weight: 1.5,
        }).addTo(map);

        const popupContent = `
          <div style="font-family: var(--font-sans); min-width: 180px; background: var(--bg-surface); padding: 0; border-radius: 8px; overflow: hidden;">
            <div style="padding: 12px 14px; border-bottom: 1px solid var(--border-default);">
              <div style="font-size: 10px; font-weight: 600; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px;">
                ${country.flag} Monitored Country
              </div>
              <div style="font-size: 15px; font-weight: 700; color: var(--text-primary);">${country.name}</div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Capital: ${country.capital}</div>
            </div>
            <div style="padding: 10px 14px; display: flex; gap: 20px;">
              <div>
                <div style="font-size: 13px; font-weight: 700; color: var(--text-primary);">${country.gdp}</div>
                <div style="font-size: 9px; font-weight: 600; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px;">GDP</div>
              </div>
              <div>
                <div style="font-size: 13px; font-weight: 700; color: var(--text-primary);">${country.gdp_growth}</div>
                <div style="font-size: 9px; font-weight: 600; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px;">Growth</div>
              </div>
            </div>
          </div>
        `;

        circle.bindPopup(popupContent, {
          maxWidth: 240,
          className: 'atis-popup',
        });

        circle.on('click', () => {
          onCountryClick?.(country.name);
        });

        circle.on('mouseover', () => circle.openPopup());

        // Country label
        L.tooltip({
          permanent: true,
          direction: 'right',
          offset: [10, 0],
          className: 'atis-label',
        })
          .setContent(country.name)
          .setLatLng([country.lat, country.lng])
          .addTo(map);
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <style>{`
        .atis-popup .leaflet-popup-content-wrapper {
          background: var(--bg-surface) !important;
          border: 1px solid var(--border-default) !important;
          border-radius: 10px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.6) !important;
          padding: 0 !important;
        }
        .atis-popup .leaflet-popup-tip-container {
          display: none !important;
        }
        .atis-popup .leaflet-popup-content {
          margin: 0 !important;
        }
        .atis-label {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          font-family: var(--font-sans) !important;
          font-size: 10px !important;
          font-weight: 600 !important;
          color: var(--text-tertiary) !important;
          letter-spacing: 0.04em !important;
          text-transform: uppercase !important;
          pointer-events: none !important;
        }
        .leaflet-control-attribution {
          background: rgba(10,10,10,0.8) !important;
          color: var(--text-dim) !important;
          font-size: 9px !important;
        }
        .leaflet-control-attribution a {
          color: var(--text-muted) !important;
        }
        .leaflet-control-zoom a {
          background: var(--bg-surface) !important;
          color: var(--text-primary) !important;
          border-color: var(--border-default) !important;
        }
        .leaflet-control-zoom a:hover {
          background: var(--border-default) !important;
        }
        .leaflet-container {
          background: var(--bg-primary) !important;
        }
      `}</style>
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', borderRadius: 'inherit' }}
        aria-label="Interactive map of monitored African countries"
        role="application"
      />
    </>
  );
}
