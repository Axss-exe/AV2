import { proxyPOST } from '@/lib/proxy';

// Investigation state is owned by Render/Main.py, not Next.js/Neon.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyPOST(`/api/investigations/${encodeURIComponent(id)}/queries`, req);
}
