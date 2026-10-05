import { getMarket } from '@/lib/market-server';
export async function GET() { return Response.json(await getMarket(), { headers: { 'Cache-Control': 'no-store' } }); }
