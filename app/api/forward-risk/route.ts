import data from '@/data/forward-risk.json';
export async function GET() { return Response.json(data, { headers: { 'Content-Disposition': 'attachment; filename="forward-risk-research.json"' } }); }
