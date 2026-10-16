import SP500Exposure from '@/components/sp500-exposure';
import DemandEconomics from '@/components/demand-economics';
import EconomicComparisons from '@/components/economic-comparisons';
import AiMargins from '@/components/ai-margins';
import { getMarket } from '@/lib/market-server';
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
  const [initial, context, market] = await Promise.all([getDashboard(), getContext(), getMarket()]);
  return (
    <>
      <div className="ab-page" id="financial-comparisons"><p><a href="/">← Back to the five-lens dashboard</a></p><h1>Historical and financial comparisons</h1><p>These source vintages vary. Company valuation snapshots below retain September dates; October broad-tech context is on the main dashboard.</p><EconomicComparisons data={initial} market={market} /><AiMargins /><details className="ab-details"><summary>Valuation concentration and earlier financing research · retained source vintages</summary><SP500Exposure /><DemandEconomics capex={initial.aggregate.capex} /></details></div>
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
