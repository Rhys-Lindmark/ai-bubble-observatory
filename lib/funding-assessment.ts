export function fundingAssessment(
  capex: number,
  ocf: number,
  priorCapex: number,
  priorOcf: number,
) {
  const remainder = ocf - capex,
    previous = priorOcf - priorCapex;
  const direction =
    remainder < previous
      ? 'shrinking'
      : remainder > previous
        ? 'growing'
        : 'unchanged';
  return {
    headline:
      remainder < 0
        ? 'A cash funding gap.'
        : `${direction === 'unchanged' ? 'An' : 'A'} ${direction} cash cushion.`,
    evidence:
      remainder < 0
        ? 'Capital investment exceeds operating cash generation.'
        : `Cash remaining after capital investment is ${direction} versus the corresponding prior-year periods.`,
    remainder,
    ratioDirection:
      ocf > 0 && priorOcf > 0
        ? capex / ocf > priorCapex / priorOcf
          ? 'Up from'
          : capex / ocf < priorCapex / priorOcf
            ? 'Down from'
            : 'Unchanged from'
        : 'Compare with',
  };
}
