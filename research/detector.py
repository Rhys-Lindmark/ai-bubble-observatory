"""Price-only rolling PSY-style diagnostic. Protocol is frozen separately.
No future observations enter a month-end statistic or its bootstrap.
"""
import hashlib
import numpy as np

def suffix_df(prices, minimum=14):
    """Intercept DF t-statistic for every suffix, returning supremum per row."""
    p=np.atleast_2d(np.asarray(prices,dtype=float))
    x=p[:,:-1]; y=np.diff(p,axis=1)
    def sums(a): return np.cumsum(a[:,::-1],axis=1)[:,minimum-2:]
    n=np.arange(minimum-1,p.shape[1],dtype=float)[None,:]
    sx,sy,sxx,syy,sxy=sums(x),sums(y),sums(x*x),sums(y*y),sums(x*y)
    xx=sxx-sx*sx/n; yy=syy-sy*sy/n; xy=sxy-sx*sy/n
    with np.errstate(divide='ignore',invalid='ignore'):
        slope=xy/xx; sse=yy-xy*xy/xx
        stats=slope*np.sqrt(xx)/np.sqrt(sse/(n-2))
    stats[(xx<=1e-18)|(sse<=1e-18)]=np.nan
    return np.nanmax(stats,axis=1)

def diagnostic(prices, key, draws=1999, minimum=14):
    p=np.asarray(prices,dtype=float)
    if len(p)<minimum or not np.isfinite(p).all() or np.any(p<=0): raise ValueError('Invalid positive price window')
    p=p/p[0]*100.0
    obs=float(suffix_df(p,minimum)[0])
    if not np.isfinite(obs): return None
    delta=np.diff(p); drift=delta.mean(); residual=delta-drift
    seed=int.from_bytes(hashlib.sha256(('20260906|'+key).encode()).digest()[:4],'big')
    rng=np.random.RandomState(seed)
    signs=rng.randint(0,2,size=(draws,len(delta)))*2-1
    boot=np.concatenate([np.zeros((draws,1)),np.cumsum(drift+signs*residual,axis=1)],axis=1)
    null=suffix_df(boot,minimum)
    if not np.isfinite(null).all(): raise ValueError('Degenerate bootstrap')
    percentile=100*(1-(1+np.count_nonzero(null>=obs))/(draws+1))
    return {'statistic':obs,'percentile':float(percentile),'critical95':float(np.percentile(null,95))}

def monitor(dates, prices, key, endpoints=None, window=60, minimum=14, draws=1999):
    dates=list(dates);prices=np.asarray(prices,dtype=float); result=[]
    wanted=set(endpoints) if endpoints is not None else set(dates)
    # Include preceding two months to determine persistence without backdating the signal.
    indices={i for i,d in enumerate(dates) if d in wanted and i>=window-1}
    expanded=set(j for i in indices for j in [i-2,i-1,i] if j>=window-1)
    cache={}
    for i in sorted(expanded):
        raw=diagnostic(prices[i-window+1:i+1],key+'|'+dates[i]+f'|{window}',draws,minimum)
        if raw is not None: cache[i]=raw
    for i in sorted(indices):
        if i not in cache: continue
        r=cache[i]; active=all(j in cache and cache[j]['percentile']>=95 for j in [i-2,i-1,i])
        result.append({'date':dates[i],**r,'warning':active,'price':float(prices[i])})
    return result
