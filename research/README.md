# Price-exuberance research v1

This is an experimental diagnostic, not a calibrated probability of a speculative bubble or crash. The original accounting score remains in old API snapshots and is labeled retired in the user interface.

Frozen specification: see protocol.json. Selected historical events and contrast windows: cases.json. Both were written before running detector results. Gold source was changed from a deleted FRED series to the World Bank series before the benchmark ran. No detector parameters were tuned to these cases. The 120-month variant is a separate sensitivity, not a replacement selected for better results.

To reproduce, install Python with NumPy and pandas. Place positive monthly `date,price` CSVs listed in DATA_SOURCES.md under `research/data/`, along with the official French 49-industry/factor monthly returns file `ken-french-monthly-returns.csv`. The data manifest contains source download URLs and coverage. Preserve source citations and restrictions; raw proprietary price series are not distributed by this site.

Run, in order:

1. `python run_benchmark.py`
2. `python current_sensitivity.py`
3. `python simulations.py`
4. `python independent_audit.py`

The retained data in the original build workspace live under work/bubble-validation/data. Raw downloads and parsing scripts are retained there. Final original research results are published at /api/validation with underlying price observations removed. Site/data/validation.json additionally bundles the simulation and independent-audit outputs with citations and display names.

Latest French monthly publication acquired: July2026. Nasdaq comparison: August2026. Current research output is a manually recomputed snapshot; it does not update just because visitors refresh the page. Separate SEC/Federal Reserve feeds continue to refresh automatically.

Benchmark conclusions: primary60-month test detects7/10 selected episodes and alerts in2/10 contrast windows. Contrast windows do not establish absence of speculative bubbles;1954 is explicitly called exuberant in PSY. The120-month sensitivity detects7/8 evaluable cases and alerts in1/8 evaluable contrasts, with different coverage. This is not proof of low real-world false-positive/false-negative rates. Ten episodes are selected, partly dependent, and mostly familiar to the method's literature.

Historical replays use source observation dates and revised/backfilled data. They are not original publication-vintage backtests. In particular, the US national housing index launched after its2006peak. Warning persistence starts on the third month, with no backdating. All first-warning dates in case tables mean first active month inside that case's evaluation window, not the original onset of an episode.
