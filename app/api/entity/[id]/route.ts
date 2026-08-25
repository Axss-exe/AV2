import { proxyGET } from '@/lib/proxy';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // `id` here is the slug from the route segment (already URL-safe and decoded
  // by Next). Forward it as-is — do NOT re-encode, to avoid double-encoding.
  const { id } = await params;
  return proxyGET(`/api/entity/${id}`);
}
