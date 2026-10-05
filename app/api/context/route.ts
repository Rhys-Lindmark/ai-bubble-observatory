import { getContext } from '@/lib/context-server';
export async function GET() {
  return Response.json(await getContext(), {
    headers: { 'Cache-Control': 'no-store' },
  });
}
