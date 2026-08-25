import {
  Scale, Building2, Gem, Briefcase, User, Landmark,
  Map as MapIcon, Globe, FileText, type LucideIcon,
} from 'lucide-react';

/**
 * Canonical entity types used across the ATIS entity explorer.
 * The backend is inconsistent (entity_type may be "company", "unknown", or
 * missing), so we normalize everything to this closed set and fall back to
 * inferring the type from the vault path.
 */
export type EntityType =
  | 'business'
  | 'commodity'
  | 'government'
  | 'infrastructure'
  | 'person'
  | 'region'
  | 'law'
  | 'country'
  | 'unknown';

interface TypeMeta {
  label: string;
  color: string;
  icon: LucideIcon;
}

const TYPE_META: Record<EntityType, TypeMeta> = {
  business:       { label: 'Business',       color: '#0a84ff', icon: Briefcase },
  commodity:      { label: 'Commodity',      color: '#ffd60a', icon: Gem },
  government:     { label: 'Government',     color: '#ff9f0a', icon: Landmark },
  infrastructure: { label: 'Infrastructure', color: '#30d158', icon: Building2 },
  person:         { label: 'Person',         color: '#64d2ff', icon: User },
  region:         { label: 'Region',         color: '#ff6b35', icon: MapIcon },
  law:            { label: 'Law',            color: '#ff453a', icon: Scale },
  country:        { label: 'Country',        color: '#5ac8fa', icon: Globe },
  unknown:        { label: 'Entity',         color: '#8e8e93', icon: FileText },
};

/** Map noisy raw type strings from the backend to our canonical set. */
function normalizeRaw(raw?: string | null): EntityType | null {
  if (!raw) return null;
  const t = raw.toLowerCase().trim();
  if (!t || t === 'unknown') return null;
  if (['business', 'company', 'companies', 'organization', 'organisation', 'firm', 'corporation'].includes(t)) return 'business';
  if (['commodity', 'commodities', 'mineral', 'resource'].includes(t)) return 'commodity';
  if (['government', 'gov', 'ministry', 'agency', 'authority', 'regulator'].includes(t)) return 'government';
  if (['infrastructure', 'facility', 'asset', 'utility'].includes(t)) return 'infrastructure';
  if (['person', 'people', 'individual'].includes(t)) return 'person';
  if (['region', 'province', 'district', 'area'].includes(t)) return 'region';
  if (['law', 'legislation', 'act', 'statute', 'regulation'].includes(t)) return 'law';
  if (['country', 'nation', 'state'].includes(t)) return 'country';
  // Pass through if it already matches a canonical key
  if (t in TYPE_META) return t as EntityType;
  return null;
}

/** Infer type from a vault path like "Zimbabwe/Zimbabwe Businesses/Foo.md". */
function inferFromPath(path?: string | null): EntityType | null {
  if (!path) return null;
  const p = path.toLowerCase();
  if (p.includes('businesses') || p.includes('/companies') || p.includes('companies/')) return 'business';
  if (p.includes('commodities') || p.includes('commodity')) return 'commodity';
  if (p.includes('government')) return 'government';
  if (p.includes('infrastructure')) return 'infrastructure';
  if (p.includes('people')) return 'person';
  if (p.includes('region')) return 'region';
  return null;
}

/**
 * Resolve the best entity type from an explicit value plus the vault path.
 * Explicit (non-"unknown") wins; otherwise fall back to path inference.
 */
export function resolveEntityType(explicit?: string | null, path?: string | null): EntityType {
  return normalizeRaw(explicit) ?? inferFromPath(path) ?? 'unknown';
}

export function entityTypeMeta(type: EntityType): TypeMeta {
  return TYPE_META[type] ?? TYPE_META.unknown;
}

/** Convenience: resolve + return full meta in one call. */
export function resolveTypeMeta(explicit?: string | null, path?: string | null): TypeMeta {
  return entityTypeMeta(resolveEntityType(explicit, path));
}
