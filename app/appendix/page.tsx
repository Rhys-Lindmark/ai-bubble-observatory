import HistoricalCash from '@/components/historical-cash';
import RailwayRevenue from '@/components/railway-revenue';
import HousingValuation from '@/components/housing-valuation';
import ForecastLedger from '@/components/forecast-ledger';
import { HistoricalCashSources } from '@/components/historical-cash';
import UsageEvidence from '@/components/usage-evidence';
import SupplyEvidence from '@/components/valuation-supply';
import DemandPanel from '@/components/demand-panel';
import ObservatoryAppendix from '@/components/observatory-appendix';
import Dashboard from '@/components/dashboard';
import { getDashboard } from '@/lib/dashboard-server';
import { getContext } from '@/lib/context-server';
export default async function Appendix() {
  const [initial, context] = await Promise.all([getDashboard(), getContext()]);
  return (
    <>
      <ObservatoryAppendix>
        <ForecastLedger />
      </ObservatoryAppendix>
      <DemandPanel appendix />
      <div className="ab-page">
        <HistoricalCash current={initial.aggregate} />
        <RailwayRevenue />
        <HousingValuation />
      </div>
      <HistoricalCashSources />
      <div className="ab-page">
        <SupplyEvidence appendix />
        <UsageEvidence />
      </div>
      <div className="ob-legacy">
        <Dashboard initial={initial} context={context} />
      </div>
    </>
  );
}
