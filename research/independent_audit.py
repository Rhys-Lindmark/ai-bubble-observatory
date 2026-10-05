"""Independent numerical and temporal audit; no model tuning."""
import hashlib
import json
from pathlib import Path
import numpy as np
import pandas as pd
import detector
ROOT = Path(__file__).resolve().parent

def direct_suffix_max(prices, minimum):
    p = np.asarray(prices, dtype=float)
    stats = []
    for start in range(len(p)-minimum+1):
        z = p[start:]
        x, y = z[:-1], np.diff(z)
        X = np.column_stack([np.ones(len(x)), x])
        beta = np.linalg.lstsq(X, y, rcond=None)[0]
        residual = y-X@beta
        sse = residual@residual
        xx = (x-x.mean())@(x-x.mean())
        if xx>1e-18 and sse>1e-18:
            stats.append(beta[1]/np.sqrt((sse/(len(y)-2))/xx))
    return float(max(stats))

rng = np.random.RandomState(314159)
max_error=0.0
count=0
for window, minimum in [(60,14), (120,20)]:
    for k in range(30):
        p=100+np.cumsum(rng.normal(.3, 1.8, window)) if k%2 else 100*np.exp(np.cumsum(rng.normal(.005,.03,window)))
        direct = direct_suffix_max(p,minimum)
        fast = float(detector.suffix_df(p,minimum)[0])
        max_error=max(max_error,abs(direct-fast)); count+=1
        assert np.isclose(direct,fast,rtol=1e-8,atol=1e-8),(window,k,direct,fast)

# Reproduce the full frozen bootstrap with independent OLS, one fixed window.
p=100*np.exp(np.cumsum(rng.normal(.006,.035,60))); key='independent-bootstrap'; draws=1999
q=p/p[0]*100
obs=direct_suffix_max(q,14)
delta=np.diff(q);drift=delta.mean();residual=delta-drift
seed=int.from_bytes(hashlib.sha256(('20260906|'+key).encode()).digest()[:4],'big')
rr=np.random.RandomState(seed)
signs=rr.randint(0,2,size=(draws,len(delta)))*2-1
boot=np.column_stack([np.zeros(draws),np.cumsum(drift+signs*residual,axis=1)])
null=np.array([direct_suffix_max(row,14) for row in boot])
rank=100*(1-(1+sum(null>=obs))/(draws+1))
actual=detector.diagnostic(p,key,draws=draws,minimum=14)
assert rank==actual['percentile'],(rank,actual)
assert np.isclose(np.percentile(null,95),actual['critical95'],rtol=1e-8,atol=1e-8)

# Appending or changing observations after requested endpoints must not change outputs.
dates=list(pd.period_range('2000-01',periods=110,freq='M').astype(str))
prices=100*np.exp(np.cumsum(rng.normal(.005,.03,110)))
ends=dates[83:86]
a=detector.monitor(dates,prices,'prefix',ends)
b=detector.monitor(dates[:86],prices[:86],'prefix',ends)
mutated=prices.copy();mutated[86:]=np.linspace(1e5,1e9,24)
c=detector.monitor(dates,mutated,'prefix',ends)
assert a==b==c

# Isolate temporal persistence mechanics without relying on a chosen price trajectory.
original=detector.diagnostic
ranks={dates[59]:90,dates[60]:95,dates[61]:99,dates[62]:96,dates[63]:94}
def fake(p,key,draws=1999,minimum=14):
    date=key.split('|')[1]
    return {'percentile':ranks[date], 'statistic':1.0, 'critical95':.5}
try:
    detector.diagnostic=fake
    points=detector.monitor(dates[:64],prices[:64],'persistence',dates[59:64])
finally:
    detector.diagnostic=original
assert [p['warning'] for p in points]==[False,False,False,True,False],points

result={'randomOLSWindows':count,'maximumAbsoluteOLSStatisticError':max_error,
 'bootstrapDrawsIndependentlyRecomputed':draws,'independentBootstrapPercentile':rank,
 'bootstrapMatchesDirectOLS':True,'futureAppendAndMutationInvariant':True,
 'threeMonthPersistenceNotBackdated':True,
 'detectorSha256':hashlib.sha256((ROOT/'detector.py').read_bytes()).hexdigest()}
(ROOT/'independent-audit-results.json').write_text(json.dumps(result,indent=2))
print(json.dumps(result,indent=2))
