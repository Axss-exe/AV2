import { proxyPOST } from '@/lib/proxy';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyPOST(`/api/investigations/${encodeURIComponent(id)}/queries`, req);
}
