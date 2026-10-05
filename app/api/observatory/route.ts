import data from '@/data/observatory.json';
export async function GET() { return Response.json(data, { headers: { 'Content-Disposition': 'attachment; filename="observatory-research.json"' } }); }
