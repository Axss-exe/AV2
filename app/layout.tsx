import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Lexend_Deca, Poppins, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ATISProvider } from '@/lib/context'

const _poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
})

const _lexendDeca = Lexend_Deca({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-display',
})

const _jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'ATIS — Africa Trade & Intelligence System',
  description: 'Professional intelligence dashboard for African trade analysis. Real-time insights, validation traces, and market intelligence.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${_poppins.variable} ${_lexendDeca.variable} ${_jetbrainsMono.variable} bg-bg-primary`}>
      <body className="antialiased bg-bg-primary text-text-primary font-sans">
        <ATISProvider>
          {children}
        </ATISProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
