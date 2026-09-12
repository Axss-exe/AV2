import { proxyGET, proxyPOST } from '@/lib/proxy';

export async function GET() {
  return proxyGET('/api/investigations');
}

export async function POST(req: Request) {
  return proxyPOST('/api/investigations', req);
}
