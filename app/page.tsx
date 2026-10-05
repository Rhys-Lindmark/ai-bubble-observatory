import Dashboard from '@/components/assessment-dashboard';
import { getDashboard } from '@/lib/dashboard-server';
import { getMarket } from '@/lib/market-server';
import { getContext } from '@/lib/context-server';
export default async function Home() {
  const [initial, context, market] = await Promise.all([getDashboard(), getContext(), getMarket()]);
  return <Dashboard initial={initial} context={context} market={market} />;
}
