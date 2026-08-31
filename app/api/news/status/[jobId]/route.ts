import { proxyGET } from '@/lib/proxy';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  return proxyGET(`/api/news/status/${jobId}`);
}
