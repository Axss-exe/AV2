import { proxyPOST } from '@/lib/proxy';

// Keep this route as a thin same-origin proxy. Report generation belongs to
// the Render backend's Main.py implementation, like every other ATIS action.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyPOST(`/api/investigations/${encodeURIComponent(id)}/report`, req);
}
