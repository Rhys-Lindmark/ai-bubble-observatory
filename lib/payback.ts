/** Hypothetical equal annual cash recovery; initial investment excludes later upkeep. */
export function paybackHurdle(
  investment: number,
  years: number,
  rate: number,
  margin: number,
) {
  if (
    ![investment, years, rate, margin].every(Number.isFinite) ||
    investment <= 0 ||
    years <= 0 ||
    rate < 0 ||
    margin <= 0 ||
    margin > 1
  )
    throw new Error('Invalid scenario');
  const annualCash =
    investment * (rate === 0 ? 1 / years : rate / (1 - (1 + rate) ** -years));
  return {
    annualCash,
    annualRevenue: annualCash / margin,
    steadyCash: years * annualCash,
    steadyRevenue: (years * annualCash) / margin,
  };
}
