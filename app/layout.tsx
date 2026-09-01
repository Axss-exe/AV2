import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import { ATISProvider } from '@/lib/context'
import { EntityProvider } from '@/components/entity-provider'
import { ThemeProvider, themeNoFlashScript } from '@/components/theme-provider'

// Inter Display — ATIS editable production font (Regular + Medium).
const _interDisplay = localFont({
  src: [
    { path: '../public/fonts/InterDisplay-Regular.otf', weight: '400', style: 'normal' },
    { path: '../public/fonts/InterDisplay-Medium.otf', weight: '500', style: 'normal' },
  ],
  variable: '--font-inter-display',
  display: 'swap',
})

// IBM Plex Mono — evidence IDs / metadata / system states.
const _ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-ibm-plex-mono',
})

export const metadata: Metadata = {
  title: 'ATIS — Africa Trade & Intelligence System',
  description: 'Professional intelligence dashboard for African trade analysis. Real-time insights, validation traces, and market intelligence.',
  generator: 'v0.app',
  icons: {
    icon: '/brand/atis-symbol.svg',
    shortcut: '/brand/atis-symbol.svg',
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark light',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0A' },
    { media: '(prefers-color-scheme: light)', color: '#F4F3EF' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${_interDisplay.variable} ${_ibmPlexMono.variable} bg-bg-primary`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeNoFlashScript }} />
      </head>
      <body className="antialiased bg-bg-primary text-text-primary font-sans" suppressHydrationWarning>
        <ThemeProvider>
          <ATISProvider>
            <EntityProvider>
              {children}
            </EntityProvider>
          </ATISProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
