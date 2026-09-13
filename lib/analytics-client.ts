export type ClientEvent = {
  eventType: string
  feature?: string
  route?: string
  sessionId?: string
  tier?: string
  payload?: Record<string, unknown>
}

export function trackUserEvent(event: ClientEvent) {
  if (typeof window === 'undefined' || !event.eventType) return
  void fetch('/api/analytics/events', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...event, route: event.route ?? window.location.pathname }),
    keepalive: true,
  }).catch(() => undefined)
}
