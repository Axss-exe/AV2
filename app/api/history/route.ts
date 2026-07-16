import { proxyGET } from '@/lib/proxy';

export async function GET() {
  return proxyGET('/api/history');
}
