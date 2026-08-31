'use client';

import { FormEvent, useState } from 'react';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import Link from 'next/link';

export function DemoAccessGate() {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/demo-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });
      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        setError(result.error ?? 'Access denied.');
        return;
      }
      // Use a full navigation so the newly-set HTTP-only cookie is included
      // when the protected dashboard request reaches the proxy.
      window.location.replace('/atis-dashboard');
    } catch {
      setError('Unable to verify access. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex min-h-[70vh] items-center justify-center px-6 py-20">
      <div className="w-full max-w-md border border-black/15 p-8 md:p-10">
        <LockKeyhole size={20} strokeWidth={1.5} aria-hidden="true" />
        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-black/45">
          Restricted pilot access
        </p>
        <h1 className="mt-4 font-sans text-3xl font-semibold tracking-tight text-black">
          Join the ATIS demo
        </h1>
        <p className="mt-4 text-sm leading-6 text-black/65">
          Enter the passcode provided with your pilot invitation to continue.
        </p>
        <form onSubmit={submit} className="mt-8 flex flex-col gap-3">
          <label htmlFor="demo-passcode" className="font-mono text-[10px] uppercase tracking-[0.12em] text-black/50">
            Passcode
          </label>
          <input
            id="demo-passcode"
            type="password"
            value={passcode}
            onChange={(event) => setPasscode(event.target.value)}
            autoComplete="current-password"
            autoFocus
            required
            className="h-12 border border-black/20 bg-white px-4 font-mono text-sm text-black outline-none transition-colors placeholder:text-black/35 focus:border-black"
            placeholder="Enter passcode"
          />
          {error ? <p className="text-sm text-red-700" role="alert">{error}</p> : null}
          <button
            type="submit"
            disabled={loading || !passcode.trim()}
            className="mt-2 inline-flex h-12 items-center justify-center gap-2 bg-black px-5 font-mono text-xs uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Verifying…' : 'Join demo'}
            {!loading ? <ArrowRight size={14} aria-hidden="true" /> : null}
          </button>
        </form>
        <Link href="/" className="mt-6 inline-block font-mono text-[10px] uppercase tracking-[0.12em] text-black/45 underline underline-offset-4 hover:text-black">
          Return to briefing
        </Link>
      </div>
    </section>
  );
}
