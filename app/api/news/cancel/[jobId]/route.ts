import { proxyPOST } from '@/lib/proxy';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  return proxyPOST(`/api/news/cancel/${jobId}`, req);
}
