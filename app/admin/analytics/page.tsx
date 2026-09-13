import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/admin'
import { getAdminAnalytics } from '@/lib/admin-analytics'
import { AnalyticsDashboard } from './analytics-dashboard'

export default async function AdminAnalyticsPage() {
  const admin = await getAdminUser()
  if (!admin) redirect('/atis-dashboard')
  const analytics = await getAdminAnalytics()
  return <AnalyticsDashboard analytics={analytics} />
}
