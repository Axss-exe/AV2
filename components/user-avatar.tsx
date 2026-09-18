'use client'

interface UserAvatarProps {
  /** The name the letter is derived from (chosen display name preferred). */
  name?: string | null
  /** Optional uploaded picture as a URL or data URL. */
  image?: string | null
  /** Pixel diameter of the avatar. */
  size?: number
  /** Font size for the fallback letter; defaults to a proportion of size. */
  fontSize?: number
  className?: string
}

/**
 * Circular user avatar. Renders the uploaded picture cropped to a perfect
 * circle (object-cover, so it never stretches), or falls back to the first
 * letter of the user's chosen name.
 */
export function UserAvatar({ name, image, size = 28, fontSize, className }: UserAvatarProps) {
  const letter = (name?.trim()?.[0] ?? 'A').toUpperCase()

  return (
    <div
      className={className}
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-control-active)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-sans)',
        fontWeight: 600,
        fontSize: fontSize ?? Math.round(size * 0.4),
        lineHeight: 1,
      }}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image || '/placeholder.svg'}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        letter
      )}
    </div>
  )
}
