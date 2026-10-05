# Historical price data audit — 2026-09-06

All numeric files below were downloaded and parsed locally. Monthly CSVs have columns `date,price`, dated at month start. Daily-to-monthly conversion is arithmetic mean of nonmissing daily observations, to match Shiller's monthly-average convention. No missing months were interpolated. Latest partial months are present; restrict historical validation to completed periods. `*_raw.csv` preserve the FRED source frequency.

| File in data/ | Verified nonmissing coverage | Source/download | Rights context |
|---|---|---|---|
| SHILLER_SP_monthly.csv | 1871-01–2026-09; 1,869 months | [Author page](https://shillerdata.com/); [download](https://img1.wsimg.com/blobby/go/e5e77e0b-59d1-44d9-ab25-4763ac982e53/downloads/70fec4f5-727f-4e53-b5f1-179af109c5fa/ie_data.xls?ver=1788371540009) | Author makes research data public, no explicit open redistribution license found. Cite Shiller. Raw `shiller.xls`, Data sheet, Date/P fields. September 2026 price is September 1 close, per workbook. |
| NASDAQCOM_monthly.csv | 1971-02–2026-09; 668 months; underlying 14,014 observations | [FRED/Nasdaq](https://fred.stlouisfed.org/series/NASDAQCOM); [downloadable table](https://fred.stlouisfed.org/data/NASDAQCOM.txt) | Nasdaq copyrighted; FRED labels pre-approval required. Publicly accessible does not mean openly redistributable. |
| NIKKEI225_monthly.csv | 1949-05–2026-09; 929 months; underlying 19,194 observations | [FRED/Nikkei](https://fred.stlouisfed.org/series/NIKKEI225); [table](https://fred.stlouisfed.org/data/NIKKEI225.txt) | Research download permitted. Nikkei requires permission for redistribution of data or reports containing its data. |
| SPASTT01CNM661N_monthly.csv | 1999-01–2026-06; 330 months | [FRED/OECD](https://fred.stlouisfed.org/series/SPASTT01CNM661N); [table](https://fred.stlouisfed.org/data/SPASTT01CNM661N.txt) | OECD attribution required; FRED copyright/citation tag. Broad Chinese share-price proxy, not assumed identical to SSE Composite. |
| CSUSHPINSA_monthly.csv | 1987-01–2026-06; 474 months | [FRED/S&P](https://fred.stlouisfed.org/series/CSUSHPINSA); [table](https://fred.stlouisfed.org/data/CSUSHPINSA.txt) | S&P copyright, FRED pre-approval-required tag. U.S. national home prices, not seasonally adjusted. |
| BTC_monthly.csv | 2010-07–2026-05; 191 months | [Coin Metrics official repository](https://github.com/coinmetrics/data); [raw CSV](https://raw.githubusercontent.com/coinmetrics/data/master/csv/btc.csv) | [CC BY-NC 4.0](https://github.com/coinmetrics/data/blob/master/README.md). Raw btc.csv PriceUSD starts 2010-07-18, ends 2026-05-23 in downloaded file. |
| GOLD_WB_monthly.csv | 1960-01–2024-12; 780 complete months | [World Bank commodity markets](https://www.worldbank.org/en/research/commodity-markets); [downloaded historical workbook](https://thedocs.worldbank.org/en/doc/5d903e848db1d1b83e0ec8f744e55570-0350012021/related/CMO-Historical-Data-Monthly.xlsx) | [CC BY 4.0](https://datacatalog.worldbank.org/search/dataset/0038238/commodity-prices-history-and-projections). Gold (UK), 99.5% fine, London afternoon fixing, average of daily rates. Historical snapshot sufficient for 1980 and 1995. |
| SOUTH_SEA_monthly_julian.csv | 1719-08–1720-11; **only 16 months** | [Yale research archive](https://som.yale.edu/centers/international-center-for-finance/data/historical-financial-research-data/south-seas-bubble-1720); [workbook](https://som.yale.edu/sites/default/files/2022-03/1720PriceDatabaseOctober5_10version.xlsx) | Academic research only; redistribution/commercial use prohibited without permission. Cite Frehen, Goetzmann, Rouwenhorst (2013), *New Evidence on the First Financial Bubble*, JFE 108(3), 585–607. Underlying SOUTH_SEA_raw_julian.csv: 393 observations, 1719-08-10–1720-11-25. |
| MISSISSIPPI_monthly_julian.csv | 1718-07–1720-11; **only 26 nonmissing months** | Same Yale workbook, British and French shares sheet | Same restrictions. MISSISSIPPI_raw_julian.csv: 405 observations, 1718-07-26–1720-11-14. |

The 1720 workbook has Julian and Gregorian date columns. For consistent complete dates the extracted series explicitly use the workbook's **Julian** column. The Gregorian column is incomplete. Do not silently compare these daily dates with Gregorian event dates; do not represent these tiny monthly samples as equivalent to modern long monthly histories.

## FRED parsing detail

The familiar graph/graph.csv endpoint returned HTTP 404. The `/data/SERIES.txt` URLs redirect to FRED HTML table pages. The first 1,000 observations appear as HTML rows; all remaining observations occur as `#YYYY-MM-DD| VALUE` entries in `div#extra-rows`. Both were parsed, numeric missing values discarded, duplicates removed and dates sorted. Raw HTML retained. Parsing only the extra rows or forgetting whitespace would truncate histories; the final named `*_raw.csv` and `*_monthly.csv` files correct this.

## Railway finding — unavailable numeric series

Campbell and Turner construct daily railway-stock indices for **1843–1850**, covering 442 companies. Their research reports a doubling from January 1843 to August 1845 and a subsequent large fall. [Primary working paper](https://mpra.ub.uni-muenchen.de/21820/1/MPRA_paper_21820.pdf). Campbell's [research site](https://www.railwaymania.co.uk/) confirms the episode. His work also has an established-railway index and a non-railway comparison index.

The authors' public sites and papers did not yield a verified numerical download in this audit. Campbell, Grossman and Turner (2021), *Before the Cult of Equity*, additionally construct monthly domestic sector indices 1829–1929, including railways, but a downloadable workbook was not found. [Research paper](https://www.quceh.org.uk/uploads/1/0/5/5/10558478/wp19-01.pdf). **Do not invent or chart-digitize a railway series and call it measured historical prices.** Railway is an excluded/missing-data case until author data are obtained.

## Candidate event labels independent of detector outputs

These are historical episode anchors, not parameter-tuned positive intervals. Use fixed, stated pre-peak evaluation windows and compute actual drawdowns separately. An historically named bubble is not uncontroversial proof of fundamental overvaluation.

| Episode | Anchor | Available price proxy | Independent historical support |
|---|---|---|---|
| South Sea | 1720 | South Sea shares; daily supplement only | Yale/Frehen et al., above |
| British railways | 1843–1845 boom | **Missing** | Campbell/Turner, above |
| US 1929 | 1929-09 peak; 1929-10 crash | Shiller S&P Composite | [Federal Reserve History](https://www.federalreservehistory.org/essays/stock-market-crash-of-1929) (describes Dow; S&P is a related proxy) |
| Japan | late 1980s / 1989 peak | Nikkei 225 | [Bank of Japan research](https://www.imes.boj.or.jp/research/papers/english/me19-s1-14.pdf) |
| Dot-com | 2000-03 | Nasdaq Composite | [Primary research](https://arxiv.org/abs/cond-mat/0004263); [market participant history](https://www.goldmansachs.com/our-firm/history/moments/2000-dot-com-bubble) |
| US housing | 2006 | Case-Shiller national | [Federal Reserve History](https://www.federalreservehistory.org/essays/great-recession-and-its-aftermath); [Fed research](https://www.federalreserve.gov/econres/feds/monetary-policy-and-the-housing-bubble.htm) |
| China 2007 | 2007 | OECD Chinese share index proxy | [Research on 2005–2007 bubble](https://arxiv.org/abs/0909.1007); [NBER discussion of both episodes](https://www.nber.org/papers/w25040.pdf) |
| China 2015 | 2015-06 | OECD Chinese share index proxy | [NBER](https://www.nber.org/papers/w25040.pdf) |
| Bitcoin 2017 | 2017-12 | Coin Metrics PriceUSD | [Federal Reserve San Francisco](https://www.frbsf.org/research-and-insights/publications/economic-letter/2018/05/how-futures-trading-changed-bitcoin-prices/) |
| Bitcoin 2021 | 2021–2022 cycle | Coin Metrics PriceUSD | [BIS crypto shocks and retail losses](https://www.bis.org/publications/bulletin-69-crypto-shocks-and-retail-losses) (cycle context; exact month anchor should be declared separately) |

There are **eight** modern monthly episodes in the ten-row requested historical set, plus South Sea as a short-data supplement and railways missing. Bitcoin 2013 is an additional research-documented candidate ([ETH research](https://arxiv.org/abs/1804.06261)), but only ~41 months of earlier PriceUSD are available by late 2013; it cannot meet a 60-month minimum. Do not quietly replace missing cases simply to advertise ten successful backtests.

## Controls and interpretation

Use all eligible months outside fixed event exclusion zones, across the same continuous series, for a background alarm-rate denominator. They are **background months**, not proven bubble-free ground truth. A useful independently fixed control sensitivity excludes ±24 months around historical event anchors; report overlap and exclusions exactly. Show controls that include quiet trends and drawdowns, so a detector cannot succeed just by classifying any rapid rise or any crash as a bubble. Potential prespecified display windows: Shiller 1946–1950 and 1962–1966; Nasdaq 1991–1994; Nikkei 1977–1981; US housing 1990–1994; China 2011–2013. These choices are analyst-selected examples, not externally certified negatives.

Do not compute precision as if all unlabeled months were known negatives. The few episodes are dependent across assets/cycles; retrospective case-study hit rate does not establish calibrated probability or out-of-sample forecast performance.
