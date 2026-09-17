'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, X, Check, Loader2 } from 'lucide-react'
import { useProfile, resolveDisplayName } from '@/lib/use-profile'
import { UserAvatar } from '@/components/user-avatar'

const AVATAR_SIZE = 256

/**
 * Resizes/crops a selected image file to a centered square and returns a
 * compressed JPEG data URL — so avatars fill their circle without stretching
 * and stay small enough to persist inline.
 */
async function fileToSquareDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const side = Math.min(bitmap.width, bitmap.height)
  const sx = (bitmap.width - side) / 2
  const sy = (bitmap.height - side) / 2

  const canvas = document.createElement('canvas')
  canvas.width = AVATAR_SIZE
  canvas.height = AVATAR_SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE)
  bitmap.close?.()
  return canvas.toDataURL('image/jpeg', 0.85)
}

export function ProfileEditor() {
  const { data: profile, isLoading, mutate } = useProfile()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [displayName, setDisplayName] = useState<string | null>(null)
  const [image, setImage] = useState<string | null | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  if (isLoading || !profile) return null

  // Local edits fall back to the persisted values until touched.
  const nameValue = displayName ?? resolveDisplayName(profile)
  const imageValue = image === undefined ? profile.image : image
  const dirty =
    (displayName !== null && displayName.trim() !== (profile.displayName ?? '').trim()) ||
    (image !== undefined && image !== profile.image)

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setError(null)
    setSaved(false)
    try {
      const dataUrl = await fileToSquareDataUrl(file)
      setImage(dataUrl)
    } catch {
      setError('That image could not be processed. Try another file.')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault()
    const name = nameValue.trim()
    if (name.length < 1) {
      setError('Please enter a name to be referred to.')
      return
    }
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const res = await fetch('/api/profile/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: name, image: imageValue }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(json.error ?? 'Something went wrong. Please try again.')
      }
      await mutate()
      setDisplayName(null)
      setImage(undefined)
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <motion.div
            key={imageValue ?? nameValue[0]}
            initial={{ scale: 0.92, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          >
            <UserAvatar name={nameValue} image={imageValue} size={64} />
          </motion.div>
          {imageValue && (
            <button
              type="button"
              onClick={() => { setImage(null); setSaved(false) }}
              aria-label="Remove picture"
              className="absolute -right-1 -top-1 flex items-center justify-center rounded-full border"
              style={{ width: 22, height: 22, background: 'var(--bg-control-active)', borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}
            >
              <X size={12} strokeWidth={2} />
            </button>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors"
            style={{ background: 'var(--bg-control)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
          >
            <Upload size={13} strokeWidth={1.75} />
            {imageValue ? 'Change picture' : 'Upload picture'}
          </button>
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            Square crop, never stretched. Your initial is used otherwise.
          </span>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="sr-only" aria-hidden="true" tabIndex={-1} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="profile-display-name" className="text-[11px] font-medium uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>
          Name to be referred to
        </label>
        <input
          id="profile-display-name"
          value={nameValue}
          onChange={(e) => { setDisplayName(e.target.value); setSaved(false) }}
          maxLength={60}
          className="w-full max-w-sm rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors"
          style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
          aria-invalid={Boolean(error)}
        />
      </div>

      {error && (
        <p className="text-xs" style={{ color: '#ff6b63' }} role="alert">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving || !dirty}
          className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-opacity disabled:opacity-50"
          style={{ background: 'var(--accent-fg)', color: 'var(--accent-fg-contrast, #0a0a0a)' }}
        >
          {saving ? (
            <>
              <Loader2 size={15} strokeWidth={2} className="animate-spin" />
              Saving
            </>
          ) : (
            'Save changes'
          )}
        </button>
        {saved && !dirty && (
          <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: 'var(--accent-fg)' }}>
            <Check size={14} strokeWidth={2} />
            Saved
          </span>
        )}
      </div>
    </form>
  )
}
