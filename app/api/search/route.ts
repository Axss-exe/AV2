import { proxyGET } from '@/lib/proxy';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') ?? '';
  return proxyGET(`/api/search?q=${encodeURIComponent(q)}`);
}
