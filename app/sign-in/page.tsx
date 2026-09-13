import Link from 'next/link'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { AuthForm } from '@/components/auth-form'
import { AtisSymbol } from '@/components/brand'
import { auth } from '@/lib/auth'

const pathway = [
  {
    number: '01',
    label: 'PILOT',
    price: 'FREE',
    title: 'Explore ATIS.',
    description: 'Selected access while ATIS is being developed and validated.',
    points: [
      'Explore the core ATIS intelligence environment',
      'Investigate real questions',
      'Use RITA and available intelligence workflows',
      'Access the current ATIS knowledge environment',
      'Help identify where better intelligence is needed',
    ],
    note: 'Pilot access is selected rather than publicly open.',
  },
  {
    number: '02',
    label: 'CLIENT',
    price: '$19 / MONTH',
    title: 'Go deeper with ATIS.',
    description: 'Deeper access for users ready to work with ATIS beyond the pilot.',
    points: [
      'Expanded intelligence access',
      'More datasets as they become available',
      'More niche and sector-specific intelligence',
      'Greater investigation depth',
      'Persistent access to the ATIS environment',
      'Capabilities released beyond the pilot',
    ],
    note: 'Client access is not simply more features. It is access to a deeper intelligence environment.',
  },
  {
    number: '03',
    label: 'RESEARCH',
    price: 'WHEN THE ANSWER DOES NOT EXIST YET',
    title: 'Build the intelligence required to answer it.',
    description: 'Some questions require more than existing data.',
    points: [
      'Substantial data collection and validation',
      'Organization of fragmented evidence',
      'Structured analysis and synthesis',
    ],
    note: 'Research can be commissioned by investors, ministries, institutions, or other organizations when the resulting intelligence has strategic value.',
  },
]

export default async function SignInPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect('/atis-dashboard')

  return (
    <main className="min-h-screen bg-bg-primary text-text-primary">
      <div className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col">
        <section className="order-2 flex flex-col px-6 py-10 sm:px-10 lg:px-14 lg:py-14 xl:px-20">
          <header className="flex items-start justify-between gap-8">
            <div>
              <p className="font-mono text-sm font-medium tracking-[0.2em]">ATIS</p>
              <p className="mt-2 max-w-xs text-xs uppercase leading-5 tracking-[0.12em] text-text-muted">Africa Trade Intelligence System</p>
            </div>
            <p className="hidden max-w-[180px] text-right font-mono text-[10px] uppercase leading-5 tracking-[0.14em] text-text-dim sm:block">Controlled pilot<br />Zimbabwe / 2026</p>
          </header>

          <div className="mt-16 max-w-3xl sm:mt-24">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">A working intelligence environment</p>
            <h1 className="mt-5 max-w-2xl text-balance text-4xl font-medium leading-[1.05] tracking-[-0.04em] sm:text-6xl">Intelligence for questions that are difficult to answer.</h1>
            <p className="mt-7 max-w-xl text-pretty text-base leading-7 text-text-secondary sm:text-lg">ATIS organizes fragmented economic information into connected, contextual intelligence — starting in Zimbabwe.</p>
          </div>

          <div className="mt-16 max-w-3xl sm:mt-20">
            <div className="flex items-center justify-between border-b border-border-default pb-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">The access pathway</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-dim">Explore → deepen → build</p>
            </div>
            <div className="flex flex-col">
              {pathway.map((item) => (
                <article key={item.number} className="grid gap-5 border-b border-border-default py-7 sm:grid-cols-[44px_minmax(0,1fr)_minmax(180px,0.6fr)] sm:gap-7">
                  <p className="font-mono text-xs text-text-dim">{item.number}</p>
                  <div>
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                      <p className="font-mono text-xs font-medium tracking-[0.16em]">{item.label}</p>
                      <p className="font-mono text-[10px] tracking-[0.12em] text-text-muted">{item.price}</p>
                    </div>
                    <h2 className="mt-3 text-xl font-medium tracking-[-0.02em]">{item.title}</h2>
                    <p className="mt-2 max-w-md text-sm leading-6 text-text-secondary">{item.description}</p>
                    <p className="mt-4 max-w-md border-l border-border-active pl-3 text-xs leading-5 text-text-muted">{item.note}</p>
                  </div>
                  <ul className="flex flex-col gap-2 text-xs leading-5 text-text-secondary sm:pt-1">
                    {item.points.map((point) => <li key={point} className="flex gap-2"><span className="text-text-dim">—</span><span>{point}</span></li>)}
                  </ul>
                </article>
              ))}
            </div>
          </div>

          <section className="mt-14 max-w-3xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">Built for difficult information environments</p>
            <p className="mt-5 max-w-2xl text-lg leading-7 tracking-[-0.01em]">Reliable information is not always easy to find, connect, or validate in Zimbabwe and across African markets.</p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">ATIS is being built locally to organize that complexity into structured intelligence that people can return to. Access to structured intelligence can reduce the need to repeatedly commission basic information gathering.</p>
            <div className="mt-8 grid gap-6 border-t border-border-default pt-6 sm:grid-cols-3">
              <div><p className="font-mono text-[10px] tracking-[0.14em]">LOCAL CONTEXT</p><p className="mt-2 text-xs leading-5 text-text-muted">Understanding the environment</p></div>
              <div><p className="font-mono text-[10px] tracking-[0.14em]">STRUCTURED INTELLIGENCE</p><p className="mt-2 text-xs leading-5 text-text-muted">Connecting fragmented information</p></div>
              <div><p className="font-mono text-[10px] tracking-[0.14em]">INTEGRITY</p><p className="mt-2 text-xs leading-5 text-text-muted">Clear sources. Transparent process. No shortcuts.</p></div>
            </div>
          </section>

          <section className="mt-14 max-w-3xl pb-2">
            <div className="border-y border-border-default py-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">The research flywheel</p>
              <p className="mt-4 text-sm leading-7 text-text-secondary">Question <span className="px-2 text-text-dim">↓</span> Intelligence gap <span className="px-2 text-text-dim">↓</span> Research <span className="px-2 text-text-dim">↓</span> Structured ATIS knowledge <span className="px-2 text-text-dim">↓</span> Better answers <span className="px-2 text-text-dim">↓</span> Better investment decisions</p>
            </div>
          </section>
        </section>

        <section className="order-1 border-b border-border-default bg-bg-secondary px-6 py-4 sm:px-10 lg:sticky lg:top-0 lg:z-20 lg:px-14 xl:px-20" style={{ backgroundColor: 'var(--bg-secondary)', opacity: 1 }}>
          <div className="mx-auto flex w-full max-w-[1340px] flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
            <Link href="https://aksos.net" className="flex shrink-0 items-center gap-3 text-text-primary" aria-label="Back to AKSOS">
              <AtisSymbol size={28} />
              <span><span className="block font-mono text-sm font-medium tracking-[0.2em]">ATIS</span><span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.14em] text-text-muted">Secure intelligence access</span></span>
            </Link>
            <div className="flex min-w-0 flex-1 items-center justify-between gap-5 lg:justify-end">
              <div className="hidden min-w-0 xl:block"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Continue to ATIS</p><p className="mt-1 text-xs text-text-secondary">Enter your existing account.</p></div>
              <AuthForm mode="sign-in" />
              <div className="flex shrink-0 items-center gap-3"><p className="hidden text-xs leading-5 text-text-secondary sm:block">Controlled access. <Link className="underline underline-offset-4" href="/sign-up">Create an account</Link></p><Link href="https://aksos.net" className="rounded border border-border-default bg-bg-primary px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-text-primary transition hover:border-border-active">Back to AKSOS</Link></div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
