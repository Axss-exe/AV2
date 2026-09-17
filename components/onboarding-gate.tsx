'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, ArrowRight, Loader2 } from 'lucide-react'
import { useProfile } from '@/lib/use-profile'
import { UserAvatar } from '@/components/user-avatar'
import { AtisSymbol } from '@/components/brand'

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

export function OnboardingGate() {
  const { data: profile, isLoading, mutate } = useProfile()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [displayName, setDisplayName] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Only surfaces for a signed-in user who has not completed onboarding.
  if (isLoading || !profile || profile.onboarded) return null

  const previewName = displayName.trim() || profile.name

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setError(null)
    try {
      const dataUrl = await fileToSquareDataUrl(file)
      setImage(dataUrl)
    } catch {
      setError('That image could not be processed. Try another file.')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const name = displayName.trim()
    if (name.length < 1) {
      setError('Please tell us what to call you.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/profile/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: name, image }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(json.error ?? 'Something went wrong. Please try again.')
      }
      await mutate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        key="onboarding"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ background: 'color-mix(in srgb, var(--bg-primary) 78%, transparent)', backdropFilter: 'blur(10px)' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
      >
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-strong)', boxShadow: '0 30px 80px -20px rgba(0,0,0,0.6)' }}
        >
          {/* Futuristic top accent sweep */}
          <div className="relative h-1 w-full overflow-hidden" style={{ background: 'var(--border-default)' }}>
            <motion.div
              className="absolute inset-y-0 w-1/3"
              style={{ background: 'linear-gradient(90deg, transparent, var(--accent-fg), transparent)' }}
              animate={{ x: ['-120%', '360%'] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          <div className="p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-2.5">
              <AtisSymbol size={22} />
              <span className="font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: 'var(--text-dim)' }}>
                Set up your workspace
              </span>
            </div>

            <h2 id="onboarding-title" className="text-balance text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Welcome to ATIS.
            </h2>
            <p className="mt-2 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
              Let&apos;s personalize your desk. Tell us what to call you and, if you like, add a picture.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-6">
              {/* Live avatar preview + upload */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <motion.div
                    key={image ?? previewName[0]}
                    initial={{ scale: 0.9, opacity: 0.6 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                  >
                    <UserAvatar name={previewName} image={image} size={64} />
                  </motion.div>
                  {image && (
                    <button
                      type="button"
                      onClick={() => setImage(null)}
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
                    {image ? 'Change picture' : 'Upload picture'}
                  </button>
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    Optional. We&apos;ll use your first initial otherwise.
                  </span>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="sr-only" aria-hidden="true" tabIndex={-1} />
                </div>
              </div>

              {/* Display name */}
              <div className="flex flex-col gap-2">
                <label htmlFor="display-name" className="text-[11px] font-medium uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>
                  What should we call you?
                </label>
                <input
                  id="display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={60}
                  autoFocus
                  placeholder="e.g. Tanaka"
                  className="w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors"
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                  aria-invalid={Boolean(error)}
                />
              </div>

              {error && (
                <p className="text-xs" style={{ color: 'var(--accent-danger)' }} role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting || displayName.trim().length < 1}
                className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-opacity disabled:opacity-50"
                style={{ background: 'var(--accent-fg)', color: 'var(--accent-fg-contrast, #0a0a0a)' }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={15} strokeWidth={2} className="animate-spin" />
                    Setting up
                  </>
                ) : (
                  <>
                    Enter ATIS
                    <ArrowRight size={15} strokeWidth={2} />
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
