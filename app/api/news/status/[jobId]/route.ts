import { proxyGET } from '@/lib/proxy';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;
  return proxyGET(`/api/news/status/${encodeURIComponent(jobId)}`);
}
