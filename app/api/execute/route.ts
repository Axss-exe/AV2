import { proxyPOSTWithTimeout } from '@/lib/proxy';

export async function POST(req: Request) {
  // Roadmap generation can legitimately exceed the generic proxy timeout.
  // Keep the connection open so the client receives the backend's final JSON.
  return proxyPOSTWithTimeout('/api/execute', req, 10 * 60 * 1000);
}
