import { getDashboard } from '@/lib/dashboard-server';
export async function GET() {
  const d = await getDashboard();
  const rows = [
    [
      'company',
      'ticker',
      'period_end',
      'cash_capex_usd',
      'operating_cash_flow_usd',
      'revenue_usd',
      'operating_income_usd',
      'cash_flow_residual_usd',
      'source',
      'checked_at',
    ],
    ...d.companies.map((c) => [
      c.name,
      c.ticker,
      c.end,
      c.current.capex.value,
      c.current.ocf.value,
      c.current.revenue.value,
      c.current.operatingIncome.value,
      c.current.ocf.value - c.current.capex.value,
      c.sourceUrl,
      c.checkedAt,
    ]),
  ];
  const csv = rows
    .map((row) =>
      row.map((v) => '"' + String(v).replaceAll('"', '""') + '"').join(','),
    )
    .join('\r\n');
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="ai-bubble-monitor-${d.asOf}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
