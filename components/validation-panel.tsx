'use client';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from './ui/accordion';
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from './ui/table';
import research from '../data/validation.json';
const current = research.current.find((c) => c.id === 'AI_PROXY')!;
const summary = research.summary;
const month = (s: string) =>
  new Date(s + '-15T12:00:00Z').toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
const pct = (n: number) => n.toFixed(1);
const names = research.currentNames as Record<string, string>;
function Link({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a className="evidence-link" href={href} target="_blank" rel="noreferrer">
      {children} ↗
    </a>
  );
}
export default function ValidationPanel() {
  return (
    <section className="validation-panel" id="validation">
      <div className="research-heading">
        <div>
          <p className="eyebrow">A NEW MODEL / TESTED BEFORE INTERPRETATION</p>
          <h2>Price exuberance, with its track record attached.</h2>
          <p>
            The original 65 measured spending pressure. This diagnostic asks a
            different question: are public-market prices following an unusually
            explosive path?
          </p>
        </div>
        <span className="research-pill">
          EXPERIMENTAL · NOT A CRASH PROBABILITY
        </span>
      </div>
      <div className="overview-grid">
        <article className="index-card validation-score">
          <div className="index-top">
            <span>PRICE-EXUBERANCE PERCENTILE</span>
            <span>RESEARCH V1</span>
          </div>
          <div className="index-number">
            <strong>{pct(current.latest.percentile)}</strong>
            <span>/ 100</span>
          </div>
          <p className="index-summary">
            {current.latest.warning
              ? 'A persistent price-exuberance warning.'
              : 'No persistent warning in the aggregate proxy.'}
          </p>
          <p>
            Reference rank under an additive random-walk null. A value of{' '}
            {pct(current.latest.percentile)} is <b>not</b> an{' '}
            {pct(current.latest.percentile)}% chance of a bubble or crash.
          </p>
          <div className="validation-score-foot">
            <span>
              Monthly data through <b>{month(current.asOf)}</b>
            </span>
            <span>
              120-month sensitivity:{' '}
              <b>{pct(current.sensitivity120.percentile)}</b>
            </span>
          </div>
          <p className="research-small">
            Frozen warning rule: percentile ≥95 for three consecutive months.
            Neither aggregate specification triggers now. This does not
            establish that AI assets are fairly valued.
          </p>
        </article>
        <article className="panel historical-plot">
          <div className="plot-heading">
            <b>AI-exposed industry basket</b>
            <span>MONTHLY · REFERENCE PERCENTILE</span>
          </div>
          <figure
            className="comparison-chart"
            aria-label={`Experimental AI price-exuberance percentile ${pct(current.latest.percentile)} in ${month(current.asOf)}. Accessible monthly table below.`}
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={0}
              initialDimension={{ width: 600, height: 255 }}
            >
              <AreaChart
                data={current.history}
                margin={{ left: -20, right: 12, top: 12, bottom: 6 }}
              >
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={month}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                  minTickGap={60}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <ReferenceLine
                  y={95}
                  stroke="var(--chart-2)"
                  strokeDasharray="4 4"
                />
                <Tooltip
                  labelFormatter={(v) => month(String(v))}
                  formatter={(v) => [
                    `${Number(v).toFixed(1)}/100`,
                    'Reference percentile',
                  ]}
                  contentStyle={{
                    background: 'var(--background)',
                    color: 'var(--foreground)',
                    border: '1px solid var(--border)',
                  }}
                />
                <Area
                  type="stepAfter"
                  dataKey="percentile"
                  stroke="var(--foreground)"
                  fill="var(--foreground)"
                  fillOpacity={0.05}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </figure>
          <p className="research-small">
            Equal-weight, monthly-rebalanced French industry portfolios:
            electronic equipment, computers, and software. Total returns,
            including dividends; not an investable pure-AI index. This is not a
            direct price series for OpenAI, Anthropic, or SpaceX/xAI; AI
            exposure has not been verified constituent by constituent.
          </p>
          <Link href={research.sources[3].url}>
            Source and portfolio definitions
          </Link>
        </article>
      </div>
      <div className="validation-readouts">
        <div>
          <strong>
            {summary.eventsDetected}/{summary.eventsTested}
          </strong>
          <span>Historical episodes detected</span>
        </div>
        <div>
          <strong>
            {summary.eventsMissed}/{summary.eventsTested}
          </strong>
          <span>Historical episodes missed</span>
        </div>
        <div>
          <strong>
            {summary.controlAlerts}/{summary.controlsTested}
          </strong>
          <span>Contrast windows with an alert</span>
        </div>
        <p>
          <b>Not yet a low-error bubble detector.</b> Ten selected episodes are
          a small, partly dependent sample. Contrast periods are not certified
          non-bubbles. These counts cannot calibrate crash probabilities.
        </p>
      </div>
      <Accordion className="research-accordion">
        <AccordionItem value="cases">
          <AccordionTrigger>
            Inspect all 10 historical cases, all 10 contrasts, and excluded
            episodes
          </AccordionTrigger>
          <AccordionContent>
            <p>
              A hit means an active warning during the 12 months strictly before
              the historical peak month. Persistence starts on the third
              qualifying month; it is never backdated. Dates below are first
              active warnings <b>within that evaluation window</b>, not
              necessarily the detector’s original onset. These are revised-data,
              observation-date replays, not release-vintage trading backtests.
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Episode / peak</TableHead>
                  <TableHead>60-month test</TableHead>
                  <TableHead>Warning in window</TableHead>
                  <TableHead>120-month sensitivity</TableHead>
                  <TableHead>Limitation / source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {research.events.map((e) => {
                  const s = research.sensitivity.find((x) => x.id === e.id)!;
                  return (
                    <TableRow key={e.id}>
                      <TableCell>
                        <b>{e.name}</b>
                        <br />
                        {month(e.peak)}
                      </TableCell>
                      <TableCell>{e.warning ? 'Detected' : 'Missed'}</TableCell>
                      <TableCell>
                        {e.firstWarning ? month(e.firstWarning) : '—'}
                      </TableCell>
                      <TableCell>
                        {s.status === 'evaluated'
                          ? s.warning
                            ? 'Detected'
                            : 'Missed'
                          : 'Insufficient history'}
                      </TableCell>
                      <TableCell className="ledger-note">
                        {e.note} <Link href={e.source}>Evidence</Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <p className="table-caption">
              The same 12-month evaluation length is used for predeclared
              contrasts. Alerts are false-alarm candidates, not proven false
              positives about fundamental value. In particular, the original PSY
              paper discusses 1954 as an exuberance episode. Selected contrasts
              do not estimate the population false-positive rate.
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contrast window</TableHead>
                  <TableHead>Alert?</TableHead>
                  <TableHead>First active month in window</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {research.controls.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.warning ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      {c.firstWarning ? month(c.firstWarning) : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="validation-exclusions">
              {research.excluded.map((e) => (
                <p key={e.name}>
                  <b>{e.name}:</b> {e.reason}{' '}
                  <Link href={e.source}>Source</Link>
                </p>
              ))}
            </div>
            <p>
              The 120-month check catches 7 of 8 evaluable events, with one
              alert across 8 evaluable contrasts. Its smaller denominator
              excludes some successes and one alert from the primary test. This
              sensitivity was not substituted for the frozen primary model after
              seeing results.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="formula">
          <AccordionTrigger>
            Read the formula, literature, validation checks, and limits
          </AccordionTrigger>
          <AccordionContent>
            <p>
              <b>First principles:</b> an asset is overvalued when its price
              exceeds the discounted cash flows it can sustain. Those cash flows
              and discount rates are uncertain. Explosive price growth is a
              diagnostic clue, not a measurement of the fundamental-value gap.
            </p>
            <div className="method-callout">
              ΔPₜ = α + βPₜ₋₁ + εₜ
              <br />
              BSADFₜ = maximum right-tailed t-statistic for β across backward
              windows
              <br />
              Percentile = 100 × [1 − (1 + bootstrap statistics ≥ observed
              statistic) / 2,000]
            </div>
            <p>
              Use 60 completed monthly price observations, suffixes of at least
              14 observations, an intercept and zero lagged differences. For
              each endpoint, generate 1,999 wild-bootstrap random walks using
              centered observed price changes, random ± signs, and the observed
              mean change as drift. A warning needs three consecutive percentile
              readings of at least 95.
            </p>
            <p>
              <b>Adaptation, not exact replication:</b> Phillips–Shi–Yu’s
              historical application used price/dividend ratios. This
              cross-asset test uses price levels and a rolling five-year
              history; the AI proxy uses total-return levels. It lacks
              fundamental denominators and uses a simpler endpoint bootstrap.
              The 14-observation minimum follows the published minimum-window
              rule for T=60. The three-month filter is our frozen operational
              choice.
            </p>
            <p>
              Formula and case selection were recorded before viewing detector
              results. No parameters were adjusted to make the ten selected
              episodes pass. Longer lookback results are disclosed separately.
              Famous cases used in the literature are not an untouched
              out-of-sample test, and China/Bitcoin repetitions and common
              global cycles reduce independence.
            </p>
            <p>
              Pointwise bootstrap reference ranks do not control the probability
              of any false alarm across repeated months. Wild resampling is not
              a guarantee against volatility shifts or ordinary compounding
              growth. A signal is neither a countdown nor a crash forecast.
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Process check (200 paths each)</TableHead>
                  <TableHead>Any warning during 12 months</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {research.simulations.results.map((s) => (
                  <TableRow key={s.process}>
                    <TableCell>{s.process.replaceAll('_', ' ')}</TableCell>
                    <TableCell>
                      {s.pathsWithWarning}/{s.paths} (
                      {(s.pathAlarmRate * 100).toFixed(1)}%)
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p>
              Ordinary-growth simulation: 8% annual expected return, 18%
              volatility. Volatility-shift check: 12% to 40% annual volatility.
              These synthetic results concern specified processes, not
              real-world bubble error rates.
            </p>
            <p>
              Independent verification: direct least-squares calculations match
              60 randomized windows; all 1,999 bootstrap draws were
              independently checked. Appending or altering future observations
              leaves earlier calculations unchanged. Publication lags, source
              revisions, and the housing index’s prelaunch backfill still
              prevent a true real-time claim.
            </p>
            <div>
              {research.sources.map((s) => (
                <p key={s.url}>
                  <Link href={s.url}>{s.title}</Link>
                </p>
              ))}
            </div>
            <p>
              Greenwood–Shleifer–You find that sharp run-ups increase crash risk
              but do not automatically imply poor subsequent returns. Their
              industry/market-adjusted run-up method and crash target differ
              from this explosive-price diagnostic; their published
              probabilities are not imported into this score.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="current">
          <AccordionTrigger>
            Inspect today’s proxies, monthly observations, and update status
          </AccordionTrigger>
          <AccordionContent>
            <p>
              “Current” means the latest completed month in each acquired
              source, not an intraday market reading. Different proxy dates and
              definitions are shown explicitly. The hardware proxy warns under
              the longer lookback even though the aggregate does not;
              aggregation can hide concentrated risk.
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proxy</TableHead>
                  <TableHead>Through</TableHead>
                  <TableHead>60-month percentile</TableHead>
                  <TableHead>120-month percentile</TableHead>
                  <TableHead>Persistent warning, 60 / 120</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {research.current.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{names[c.id]}</TableCell>
                    <TableCell>{month(c.asOf)}</TableCell>
                    <TableCell>{pct(c.latest.percentile)}</TableCell>
                    <TableCell>{pct(c.sensitivity120.percentile)}</TableCell>
                    <TableCell>
                      {c.latest.warning ? 'Yes' : 'No'} /{' '}
                      {c.sensitivity120.warning ? 'Yes' : 'No'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="table-caption">
              Accessible chart data: reference percentiles, not underlying
              market prices.
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>AI proxy percentile</TableHead>
                  <TableHead>Warning</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...current.history].reverse().map((p) => (
                  <TableRow key={p.date}>
                    <TableCell>{month(p.date)}</TableCell>
                    <TableCell>{pct(p.percentile)}</TableCell>
                    <TableCell>{p.warning ? 'Yes' : 'No'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p>
              <b>{research.publicationNote}</b>
            </p>
            <p>
              Full model-based bubble/crash probabilities require a defined
              outcome, broader comparison samples, untouched validation periods,
              and reliable fundamentals. Lab round valuations, power
              commitments, and Treasury rates remain separate evidence rather
              than arbitrary additions to this statistical rank.
            </p>
            <Link href="/api/validation">
              Download formula and computed research results (JSON)
            </Link>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
