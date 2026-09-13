import Link from 'next/link'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { AuthForm } from '@/components/auth-form'
import { auth } from '@/lib/auth'

export default async function SignInPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect('/atis-dashboard')

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-primary px-6 py-12 text-text-primary">
      <section className="flex w-full max-w-md flex-col gap-8 rounded border border-border bg-bg-secondary p-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-text-secondary">ATIS</p>
          <h1 className="mt-3 text-3xl font-semibold">Sign in</h1>
          <p className="mt-2 text-sm text-text-secondary">Continue to the intelligence workspace.</p>
        </div>
        <AuthForm mode="sign-in" />
        <p className="text-sm text-text-secondary">No account? <Link className="underline" href="/sign-up">Create one</Link></p>
      </section>
    </main>
  )
}
