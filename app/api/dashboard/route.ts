import {
  getDashboard,
  getSnapshot,
  snapshotDates,
} from '@/lib/dashboard-server';
export async function GET(request: Request) {
  const day = new URL(request.url).searchParams.get('snapshot');
  if (day) {
    const value = await getSnapshot(day);
    return Response.json(value ?? { error: 'Snapshot not found' }, {
      status: value ? 200 : 404,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
  const data = await getDashboard();
  return Response.json(
    { ...data, snapshotDates: await snapshotDates() },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
