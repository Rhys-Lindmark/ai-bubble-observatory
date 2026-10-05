"""Prespecified process checks; no labels or parameters fitted to bubble cases."""
import json,pathlib,time
import numpy as np
from detector import diagnostic
root=pathlib.Path(__file__).parent
rng=np.random.RandomState(77531);N=200;T=74
processes={
 'additive_random_walk':100+np.cumsum(rng.normal(0,1,(N,T)),axis=1),
 'ordinary_compounding_bull':100*np.exp(np.cumsum(rng.normal((.08-.5*.18**2)/12,.18/np.sqrt(12),(N,T)),axis=1)),
 'volatility_shift_no_bubble':100*np.exp(np.cumsum(rng.normal(0,1,(N,T))*np.r_[np.repeat(.12/np.sqrt(12),T//2),np.repeat(.40/np.sqrt(12),T-T//2)],axis=1)),
}
out=[]
for name,paths in processes.items():
 any_count=0;point_count=0
 for i,p in enumerate(paths):
  q=[]
  for end in range(T-14,T):
   r=diagnostic(p[end-59:end+1],f'simulation|{name}|{i}|{end}');q.append(r['percentile']>=95)
  active=[all(q[j-2:j+1])for j in range(2,len(q))]
  any_count+=int(any(active));point_count+=sum(q[-12:])
 out.append({'process':name,'paths':N,'evaluationMonthsPerPath':12,'pathsWithWarning':any_count,'pathAlarmRate':any_count/N,'pointwiseExceedances':point_count,'pointwiseExceedanceRate':point_count/(N*12)})
 print(out[-1],flush=True)
(root/'simulations.json').write_text(json.dumps({'seed':77531,'assumptions':{'ordinaryGrowthAnnual':.08,'ordinaryVolAnnual':.18,'volatilityShiftAnnual':[.12,.40],'drawsPerEndpoint':1999,'evaluation':'any active3month95percentile warning within12months'},'results':out},indent=2))
