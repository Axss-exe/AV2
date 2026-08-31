import type { Metadata } from 'next';
import { AtisSymbol } from '@/components/brand';
import { DemoAccessGate } from '@/components/demo-access-gate';

export const metadata: Metadata = {
  title: 'ATIS Pilot Briefing — Africa Trade Intelligence System',
  description:
    'An orientation briefing for the ATIS Zimbabwe pilot — what ATIS is, how the demo works, and what feedback we are looking for.',
};

// This page is intentionally locked to a strict black-and-white system
// regardless of the app's light/dark theme preference — it functions as a
// printed-style briefing document, not a themed dashboard surface.
const INK = '#0a0a0a';
const HAIRLINE = 'rgba(10, 10, 10, 0.12)';
const BODY = 'rgba(10, 10, 10, 0.72)';
const DIM = 'rgba(10, 10, 10, 0.45)';

const CAPABILITIES: { n: string; title: string; body: string }[] = [
  {
    n: '01',
    title: 'Ask ATIS',
    body: 'Ask questions in natural language about the information available in the system. Start broad, then ask follow-up questions to investigate a specific issue.',
  },
  {
    n: '02',
    title: 'Explore Evidence',
    body: 'Review the underlying documents and information used to support ATIS responses. Use these to distinguish source evidence from AI interpretation.',
  },
  {
    n: '03',
    title: 'Explore Entities',
    body: 'Investigate companies, organisations, people, government institutions, projects, and other entities identified within the knowledge base.',
  },
  {
    n: '04',
    title: 'Explore Relationships',
    body: 'Follow connections between entities and see how different pieces of evidence may relate. Treat AI-discovered relationships as leads that may require verification.',
  },
  {
    n: '05',
    title: 'Follow Stories',
    body: 'Look at developments as connected events rather than isolated pieces of information. Use this to understand how an issue has developed over time.',
  },
  {
    n: '06',
    title: 'Read RITA Intelligence',
    body: 'Review RITA\u2019s reports on new developments. These are designed to explain what happened, what it connects to, and why it may matter, rather than simply repeating the news.',
  },
  {
    n: '07',
    title: 'Investigate Further',
    body: 'When ATIS surfaces something interesting, use the entities, evidence, relationships, and stories to dig deeper rather than stopping at the initial answer.',
  },
];

export default function AtisDemoPage() {
  return (
    <div style={{ background: '#ffffff', color: INK, minHeight: '100vh' }}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between px-6 md:px-12"
        style={{ height: 72, borderBottom: `1px solid ${HAIRLINE}` }}
      >
        <div className="flex items-center gap-2.5">
          <AtisSymbol size={22} color={INK} />
          <span
            className="font-mono font-semibold"
            style={{ fontSize: 13, letterSpacing: '0.08em', color: INK }}
          >
            ATIS
          </span>
        </div>
        <span
          className="font-mono uppercase"
          style={{ fontSize: 10, letterSpacing: '0.16em', color: DIM }}
        >
          Pilot / Zimbabwe
        </span>
      </header>

      <main>
        {/* ── Hero / Introduction ──────────────────────────────────────── */}
        <section
          className="flex flex-col items-center px-6 md:px-12 pt-20 md:pt-28 pb-16 md:pb-20 text-center"
          style={{ borderBottom: `1px solid ${HAIRLINE}` }}
        >
          <AtisSymbol size={56} color={INK} className="mb-10 md:mb-12" />

          <h1
            className="font-sans font-semibold tracking-tight text-4xl md:text-6xl text-balance"
            style={{ color: INK, maxWidth: 780 }}
          >
            Africa Trade Intelligence System
          </h1>

          <div
            className="flex flex-col gap-5 mt-10 text-left"
            style={{ maxWidth: 620 }}
          >
            <p className="leading-relaxed text-[15px] md:text-base" style={{ color: BODY }}>
              ATIS is an early-stage intelligence platform designed to help you explore
              complex information by connecting evidence, entities, relationships, events,
              and emerging stories.
            </p>
            <p className="leading-relaxed text-[15px] md:text-base" style={{ color: BODY }}>
              The current demo focuses on Zimbabwe and uses a Retrieval-Augmented
              Generation (RAG) approach: ATIS retrieves relevant information from its
              knowledge base and gives that evidence to the AI before generating an
              answer.
            </p>
            <p className="leading-relaxed text-[15px] md:text-base" style={{ color: BODY }}>
              RITA (Relationship Intelligence &amp; Triage Analyst) adds another layer by
              looking at how new information connects to what is already known, turning
              news and developments into contextual intelligence rather than simply
              summarising headlines.
            </p>
          </div>
        </section>

        {/* ── Pilot Notice ─────────────────────────────────────────────── */}
        <section className="px-6 md:px-12 py-14 md:py-16">
          <div
            className="mx-auto p-7 md:p-9"
            style={{ maxWidth: 680, border: `1px solid ${HAIRLINE}` }}
          >
            <span
              className="font-mono uppercase"
              style={{ fontSize: 10, letterSpacing: '0.16em', color: DIM }}
            >
              Pilot
            </span>
            <p className="leading-relaxed text-[15px] mt-4" style={{ color: BODY }}>
              This is a pilot, so some relationships and AI-generated analysis are
              experimental and should be treated as leads for investigation rather than
              verified facts.
            </p>
            <p className="leading-relaxed text-[15px] mt-4" style={{ color: BODY }}>
              The goal of the demo is to get honest feedback on what works, what doesn&apos;t,
              what is missing, and how you would actually use ATIS in practice.
            </p>
          </div>
        </section>

        {/* ── What You Can Do ──────────────────────────────────────────── */}
        <section
          className="px-6 md:px-12 py-14 md:py-16"
          style={{ borderTop: `1px solid ${HAIRLINE}` }}
        >
          <div className="mx-auto" style={{ maxWidth: 680 }}>
            <h2 className="font-sans font-semibold text-2xl md:text-3xl mb-8 md:mb-10" style={{ color: INK }}>
              What you can do
            </h2>
            <ol>
              {CAPABILITIES.map((item, i) => (
                <li
                  key={item.n}
                  className="flex gap-5 md:gap-7 py-5"
                  style={{
                    borderTop: i === 0 ? 'none' : `1px solid ${HAIRLINE}`,
                  }}
                >
                  <span
                    className="font-mono shrink-0 pt-0.5"
                    style={{ fontSize: 13, color: DIM, letterSpacing: '0.02em' }}
                    aria-hidden="true"
                  >
                    {item.n} &mdash;
                  </span>
                  <div>
                    <h3 className="font-sans font-semibold text-base mb-1.5" style={{ color: INK }}>
                      {item.title}
                    </h3>
                    <p className="leading-relaxed text-sm" style={{ color: BODY }}>
                      {item.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Feedback Prompt ──────────────────────────────────────────── */}
        <section
          className="px-6 md:px-12 py-16 md:py-20 text-center"
          style={{ borderTop: `1px solid ${HAIRLINE}` }}
        >
          <div className="mx-auto flex flex-col gap-5" style={{ maxWidth: 560 }}>
            <p className="font-sans font-semibold text-xl md:text-2xl text-balance" style={{ color: INK }}>
              Please try to break the system.
            </p>
            <p className="leading-relaxed text-[15px] md:text-base" style={{ color: BODY }}>
              Ask difficult questions, challenge its answers, look for missing evidence,
              test whether relationships make sense, and note where the system gives you
              something useful that you would not have found easily yourself.
            </p>
            <p className="leading-relaxed text-[15px] md:text-base" style={{ color: DIM }}>
              The demo is not asking you to prove that ATIS works. It is asking you to
              help us discover where it works, where it doesn&apos;t, and what it needs to
              become genuinely useful.
            </p>
          </div>
        </section>

        {/* ── Enter Demo ───────────────────────────────────────────────── */}
        <section className="px-6 md:px-12 pb-24 md:pb-28">
          <DemoAccessGate />
        </section>
      </main>
    </div>
  );
}
