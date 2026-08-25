import { proxyPOST } from '@/lib/proxy';

export async function POST(req: Request) {
  return proxyPOST('/api/news', req);
}
