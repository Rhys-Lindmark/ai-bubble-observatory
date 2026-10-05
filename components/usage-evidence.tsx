export default function UsageEvidence() {
  return (
    <section className="ab-section">
      <h2>
        Paid access is growing; profitability is still a separate question
      </h2>
      <div className="ab-three">
        <article>
          <h3>ChatGPT business users</h3>
          <p>
            <strong>5M → &gt;9M paying users</strong>
          </p>
          <p>
            August 2025 to February 2026 disclosure snapshots. Purchased
            business access, not measured daily use.
          </p>
          <p>
            <a href="https://openai.com/index/gpt-5-new-era-of-work/">
              2025 disclosure ↗
            </a>{' '}
            ·{' '}
            <a href="https://openai.com/index/scaling-ai-for-everyone/">
              2026 disclosure ↗
            </a>
          </p>
        </article>
        <article>
          <h3>Microsoft 365 Copilot</h3>
          <p>
            <strong>15M → &gt;30M paid seats</strong>
          </p>
          <p>
            January to July 2026 earnings-call disclosures. Licensed seats, not
            active users; no comparable absolute 2025 baseline verified.
          </p>
          <p>
            <a href="https://www.microsoft.com/en-us/investor/events/fy-2026/earnings-fy-2026-q2">
              January call ↗
            </a>{' '}
            ·{' '}
            <a href="https://www.microsoft.com/en-us/investor/events/fy-2026/earnings-fy-2026-q4">
              July call ↗
            </a>
          </p>
        </article>
        <article>
          <h3>Google processed tokens</h3>
          <p>
            <strong>&gt;480T → &gt;3.2 quadrillion / month</strong>
          </p>
          <p>
            May 2025 to May 2026 disclosures. Mixed paid, free and internal
            workloads; changing token mix prevents a constant-quality demand
            comparison.
          </p>
          <p>
            <a href="https://blog.google/innovation-and-ai/products/google-io-2025-all-our-announcements/">
              2025 disclosure ↗
            </a>{' '}
            ·{' '}
            <a href="https://blog.google/intl/en-in/company-news/technology/sundar-pichai-io-2026/">
              2026 disclosure ↗
            </a>
          </p>
        </article>
      </div>
      <p className="ab-note">
        Company-reported, irregular snapshots reviewed September 7, 2026. Do not
        sum overlapping populations or multiply seats/tokens by list prices to
        infer revenue. These measures do not establish retention, cash margins,
        paid GPU occupancy or infrastructure payback. Falling usage per paid
        seat or weaker renewals would weaken the demand thesis; sustained paid
        expansion with better margins would strengthen it.
      </p>
    </section>
  );
}
