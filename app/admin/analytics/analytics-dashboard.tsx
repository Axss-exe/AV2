'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'

type Analytics = {
  summary: { users?: number; events?: number; questions?: number; activeDays?: number }
  daily: { day: string; count: number }[]
  events: { eventType: string; count: number }[]
  features: { feature: string; count: number }[]
  tiers: { tier: string; count: number }[]
  questions: { id: string; question: string; feature: string | null; tier: string | null; createdAt: string }[]
}

const chartConfig = {
  count: { label: 'Events', color: 'var(--chart-1)' },
  questions: { label: 'Questions', color: 'var(--chart-2)' },
}

export function AnalyticsDashboard({ analytics }: { analytics: Analytics }) {
  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-2">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Admin intelligence</p>
          <h1 className="text-3xl font-semibold tracking-tight">User behavior analytics</h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">A live view of authenticated ATIS usage, feature demand, and the questions users are asking.</p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Unique users', analytics.summary.users ?? 0],
            ['Tracked events', analytics.summary.events ?? 0],
            ['Questions captured', analytics.summary.questions ?? 0],
            ['Active days', analytics.summary.activeDays ?? 0],
          ].map(([label, value]) => (
            <Card key={label as string}>
              <CardHeader className="pb-2"><CardDescription>{label}</CardDescription><CardTitle className="text-3xl">{value}</CardTitle></CardHeader>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <Card>
            <CardHeader><CardTitle>Activity trend</CardTitle><CardDescription>Events recorded over the last 30 days.</CardDescription></CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[260px] w-full">
                <LineChart data={analytics.daily} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={30} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line dataKey="count" type="monotone" stroke="var(--color-count)" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Usage by tier</CardTitle><CardDescription>Events attributed to each workspace tier.</CardDescription></CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[260px] w-full">
                <BarChart data={analytics.tiers} accessibilityLayer layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="tier" type="category" tickLine={false} axisLine={false} width={70} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card><CardHeader><CardTitle>Top features</CardTitle><CardDescription>Where tracked activity is concentrated.</CardDescription></CardHeader><CardContent><div className="flex flex-col gap-3">{analytics.features.map((item) => <div key={item.feature} className="flex items-center justify-between border-b pb-3 text-sm last:border-0"><span>{item.feature}</span><span className="font-mono text-muted-foreground">{item.count}</span></div>)}</div></CardContent></Card>
          <Card><CardHeader><CardTitle>Event types</CardTitle><CardDescription>Most common recorded behaviors.</CardDescription></CardHeader><CardContent><div className="flex flex-col gap-3">{analytics.events.map((item) => <div key={item.eventType} className="flex items-center justify-between border-b pb-3 text-sm last:border-0"><span>{item.eventType}</span><span className="font-mono text-muted-foreground">{item.count}</span></div>)}</div></CardContent></Card>
        </section>

        <Card>
          <CardHeader><CardTitle>Recent questions</CardTitle><CardDescription>Raw questions captured from authenticated query submissions.</CardDescription></CardHeader>
          <CardContent><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b text-xs uppercase tracking-wider text-muted-foreground"><th className="px-3 py-3">Question</th><th className="px-3 py-3">Feature</th><th className="px-3 py-3">Tier</th><th className="px-3 py-3">Captured</th></tr></thead><tbody>{analytics.questions.map((item) => <tr key={item.id} className="border-b last:border-0"><td className="max-w-xl px-3 py-3">{item.question}</td><td className="px-3 py-3 text-muted-foreground">{item.feature ?? '—'}</td><td className="px-3 py-3 text-muted-foreground">{item.tier ?? '—'}</td><td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</td></tr>)}</tbody></table></div></CardContent>
        </Card>
      </div>
    </main>
  )
}
