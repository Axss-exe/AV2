'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useProfile, resolveDisplayName } from '@/lib/use-profile'

type DayPart = 'morning' | 'afternoon' | 'evening' | 'night'

function getDayPart(hour: number): DayPart {
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 22) return 'evening'
  return 'night'
}

const GREETING_WORD: Record<DayPart, string> = {
  morning: 'Good morning',
  afternoon: 'Good afternoon',
  evening: 'Good evening',
  night: 'Working late',
}

// Warm, human sublines — as if a trusted intelligence secretary is briefing you.
const SECRETARY_LINES: Record<DayPart, string[]> = {
  morning: [
    'Your desk is ready. I gathered the overnight intelligence and flagged what needs your eye first.',
    'The feeds refreshed while you were away — I have the morning briefing laid out for you below.',
  ],
  afternoon: [
    'Welcome back. The wires stayed busy through midday; here is where things stand this afternoon.',
    'Good to have you. I kept an eye on the desk — the afternoon developments are summarized below.',
  ],
  evening: [
    'Good to see you this evening. I have kept watch — the day’s developments are ready for review.',
    'The desk is winding down. I pulled together everything that moved today so you are fully caught up.',
  ],
  night: [
    'The wires are quiet at this hour. I have everything laid out so nothing slips past you.',
    'Burning the midnight oil — understood. Here is the latest, ready whenever you are.',
  ],
}

export function DashboardGreeting() {
  const { data: profile } = useProfile()
  const [part, setPart] = useState<DayPart | null>(null)
  const [line, setLine] = useState('')

  useEffect(() => {
    const p = getDayPart(new Date().getHours())
    setPart(p)
    const options = SECRETARY_LINES[p]
    setLine(options[Math.floor(Math.random() * options.length)])
  }, [])

  const name = resolveDisplayName(profile)
  const greetingWord = part ? GREETING_WORD[part] : 'Welcome back'
  const words = `${greetingWord}, ${name}`.split(' ')

  return (
    <div aria-live="polite">
      <style>{`
        @keyframes atis-name-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes atis-scanline {
          0%   { transform: translateX(-100%); opacity: 0; }
          40%  { opacity: 1; }
          100% { transform: translateX(340%); opacity: 0; }
        }
      `}</style>

      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 'clamp(22px, 3vw, 34px)',
          color: 'var(--text-primary)',
          lineHeight: 1.15,
          marginBottom: 8,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0 0.32em',
        }}
      >
        {words.map((word, i) => {
          const isName = i >= words.length - 1
          return (
            <motion.span
              key={`${word}-${i}`}
              initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.5, delay: 0.08 * i, ease: [0.2, 0.8, 0.2, 1] }}
              style={
                isName
                  ? {
                      backgroundImage:
                        'linear-gradient(90deg, var(--text-primary) 0%, var(--accent-fg) 50%, var(--text-primary) 100%)',
                      backgroundSize: '200% 100%',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                      animation: 'atis-name-shimmer 5s linear infinite',
                    }
                  : undefined
              }
            >
              {word}
            </motion.span>
          )
        })}
      </h1>

      {/* Futuristic scanline under the greeting */}
      <div style={{ position: 'relative', height: 1, width: 120, marginBottom: 12, background: 'var(--border-default)', overflow: 'hidden' }} aria-hidden="true">
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: '40%',
            background: 'linear-gradient(90deg, transparent, var(--accent-fg), transparent)',
            animation: 'atis-scanline 3.2s ease-in-out infinite',
          }}
        />
      </div>

      <motion.p
        key={line}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
        style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: 13, color: 'var(--text-dim)', marginBottom: 14, maxWidth: 620, lineHeight: 1.55 }}
        dangerouslySetInnerHTML={{ __html: line }}
      />
    </div>
  )
}
