// Scenario, not a forecast: keep the observed price fixed and vary earnings.
export function earningsScenario(pe: number, retainedPercent: number): number | null {
  return Number.isFinite(pe) && pe > 0 && Number.isFinite(retainedPercent) && retainedPercent > 0
    ? pe / (retainedPercent / 100) : null;
}
