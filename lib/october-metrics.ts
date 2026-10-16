export function gpuEconomics(cost: number, price: number, utilization: number, variableCost = .8, years = 3, discountRate = .12) {
  if (![cost, price, utilization, variableCost, years, discountRate].every(Number.isFinite) || cost <= 0 || utilization < 0 || utilization > 1 || years <= 0 || discountRate < 0) throw new Error('Invalid scenario');
  const factor = discountRate === 0 ? years : (1 - (1 + discountRate) ** -years) / discountRate;
  const cash = 8760 * utilization * (price - variableCost);
  return {cash, npv: cash * factor - cost, payback: cash > 0 ? cost / cash : null, breakEven: price > variableCost ? cost / (8760 * (price - variableCost) * factor) : null};
}
export function containsReleasePeriods(cached: {companies: {id: string; end: string}[]}, release: {companies: {id: string; end: string}[]}) {
  return release.companies.every(r => cached.companies.some(c => c.id === r.id && c.end >= r.end));
}
