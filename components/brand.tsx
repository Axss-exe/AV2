import type { CSSProperties } from 'react';

/**
 * ATIS logo marks.
 *
 * Rendered as CSS masks so the outlined SVG geometry (the brand master) is
 * preserved exactly while being painted with `currentColor` — this keeps the
 * mark monochrome and theme-adaptive (White on Obsidian, Obsidian on Paper)
 * per the brand guide. Geometry is never stretched or recoloured per element.
 */

export function AtisSymbol({
  size = 24,
  color,
  className,
  title = 'ATIS symbol',
}: {
  size?: number;
  color?: string;
  className?: string;
  title?: string;
}) {
  const style: CSSProperties = {
    width: size,
    height: size,
    color,
    flexShrink: 0,
  };
  return (
    <span
      role="img"
      aria-label={title}
      className={`atis-mark atis-mark--symbol${className ? ` ${className}` : ''}`}
      style={style}
    />
  );
}

export function AtisWordmark({
  height = 20,
  color,
  className,
  title = 'ATIS',
}: {
  height?: number;
  color?: string;
  className?: string;
  title?: string;
}) {
  // Wordmark master viewBox is 900×180 (5:1).
  const style: CSSProperties = {
    height,
    width: height * 5,
    color,
    flexShrink: 0,
  };
  return (
    <span
      role="img"
      aria-label={title}
      className={`atis-mark atis-mark--wordmark${className ? ` ${className}` : ''}`}
      style={style}
    />
  );
}
