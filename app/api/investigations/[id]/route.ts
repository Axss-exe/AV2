import { proxyGET } from '@/lib/proxy';

// Investigation state is owned by Render/Main.py, not Next.js/Neon.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyGET(`/api/investigations/${encodeURIComponent(id)}`);
}
