import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import * as Sentry from '@sentry/nextjs'
import { DashboardView } from '@/components/dashboard/DashboardView'
import { getServerUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'My trips · Barcelona Route',
  robots: { index: false, follow: false },
}
export const dynamic = 'force-dynamic'

const TRIP_COLUMNS =
  'id, created_at, trip_days, budget, interests, payment_status, arrival, departure'

export default async function DashboardPage() {
  const user = await getServerUser()

  if (!user) redirect('/')

  const supabase = await createClient()

  const email = (user.email ?? '').replace(/"/g, '')
  const { data: trips, error } = await supabase
    .from('trips')
    .select(TRIP_COLUMNS)
    .or(`user_id.eq.${user.id},user_email.eq."${email}"`)
    .order('created_at', { ascending: false })
    .limit(20)


  if (error) {
    Sentry.captureException(error, { tags: { component: 'DashboardPage' } })
    throw new Error(`Failed to load trips: ${error.message}`)
  }

  return <DashboardView user={user} trips={trips ?? []} />
}