import Link from 'next/link'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { AuthForm } from '@/components/auth-form'
import { auth } from '@/lib/auth'

export default async function SignUpPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect('/atis-dashboard')

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-primary px-6 py-12 text-text-primary">
      <section className="flex w-full max-w-md flex-col gap-8 rounded border border-border bg-bg-secondary p-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-text-secondary">ATIS</p>
          <h1 className="mt-3 text-3xl font-semibold">Create account</h1>
          <p className="mt-2 text-sm text-text-secondary">Set up your secure intelligence workspace.</p>
        </div>
        <AuthForm mode="sign-up" />
        <p className="text-sm text-text-secondary">Already have an account? <Link className="underline" href="/sign-in">Sign in</Link></p>
      </section>
    </main>
  )
}
