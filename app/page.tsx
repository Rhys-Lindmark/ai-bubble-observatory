import Dashboard from '@/components/october-dashboard';
import { getDashboard } from '@/lib/dashboard-server';
export default async function Home() {
  const initial = await getDashboard();
  return <Dashboard initial={initial} />;
}
