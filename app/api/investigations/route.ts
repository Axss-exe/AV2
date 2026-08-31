import { proxyGET, proxyPOST } from '@/lib/proxy';

// Investigation state is owned by Render/Main.py, not Next.js/Neon.
export async function GET() {
  return proxyGET('/api/investigations');
}

export async function POST(req: Request) {
  return proxyPOST('/api/investigations', req);
}
