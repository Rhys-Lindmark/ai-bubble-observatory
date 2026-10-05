import json, pathlib, hashlib, time
import numpy as np
import pandas as pd
from detector import monitor
ROOT=pathlib.Path(__file__).parent
protocol=json.loads((ROOT/'protocol.json').read_text()); cases=json.loads((ROOT/'cases.json').read_text())
source_files=sorted((ROOT/'data').glob('*_monthly.csv'))
series={}
for f in source_files:
 d=pd.read_csv(f); d['date']=pd.to_datetime(d['date']).dt.strftime('%Y-%m');d=d[d.date<='2026-08']; d=d.dropna(subset=['price'])
 assert d.date.is_unique
 series[f.name.replace('_monthly.csv','')]=d
r=pd.read_csv(ROOT/'data/ken-french-monthly-returns.csv');r['date']=pd.to_datetime(r.date).dt.strftime('%Y-%m')
r=r.dropna(subset=['Chips','Hardw','Softw'])
for col in ['Chips','Hardw','Softw','Mkt']:
 series['FF_'+col]=pd.DataFrame({'date':r.date,'price':100*np.cumprod(1+r[col])})
series['AI_PROXY']=pd.DataFrame({'date':r.date,'price':100*np.cumprod(1+r[['Chips','Hardw','Softw']].mean(axis=1))})
series['AI_PROXY'].to_csv(ROOT/'data/AI_PROXY_monthly.csv',index=False)

def months(start,end):return list(pd.period_range(start,end,freq='M').astype(str))
def event_dates(c):
 peak=pd.Period(c['peak'],freq='M');return months(str(peak-12),str(peak-1))
def calc(c,w=60):
 d=series.get(c['series']); wanted=event_dates(c) if 'peak'in c else months(c['start'],c['end'])
 if d is None:return {**c,'status':'unavailable','reason':'Numeric series not acquired'}
 # No filling skipped months or using a later revision to fabricate a missing observation.
 full=months(d.date.iloc[0],d.date.iloc[-1]);assert list(d.date)==full, c['series']+' has missing calendar months'
 points=monitor(d.date,d.price,c['series'],wanted,window=w,minimum=14 if w==60 else 20)
 active=[p for p in points if p['warning']]
 out={**c,'windowStart':wanted[0],'windowEnd':wanted[-1],'observations':len(points),'status':'evaluated' if len(points)==12 else 'insufficient','warning':bool(active),'firstWarning':active[0]['date'] if active else None,'maxPercentile':max([p['percentile']for p in points],default=None),'points':points}
 if 'peak'in c and active:out['leadMonths']=pd.Period(c['peak'],'M').ordinal-pd.Period(active[0]['date'],'M').ordinal
 if 'peak'not in c:
  future=d[(d.date>=c['end'])&(d.date<=str(pd.Period(c['end'],'M')+24))].price.to_numpy()
  out['forward24mMaxDrawdown']=float(np.min(future/np.maximum.accumulate(future)-1)) if len(future)==25 else None
 return out
out={'protocol':protocol,'protocolSha256':hashlib.sha256((ROOT/'protocol.json').read_bytes()).hexdigest(),'caseSha256':hashlib.sha256((ROOT/'cases.json').read_bytes()).hexdigest(),'generatedAt':pd.Timestamp.utcnow().isoformat(),'events':[],'controls':[],'excluded':cases['excluded'],'sensitivity':[],'current':[]}
for kind in ['events','controls']:
 for c in cases[kind]:
  t=time.time();result=calc(c);out[kind].append(result); print(c['id'],result['status'],result.get('warning'),round(time.time()-t,2),flush=True)
for c in cases['events']+cases['controls']:
 result=calc(c,120);out['sensitivity'].append(result)
 print('sensitivity',c['id'],result['status'],result.get('warning'),flush=True)
for name in ['AI_PROXY','FF_Chips','FF_Hardw','FF_Softw','FF_Mkt','NASDAQCOM']:
 d=series[name]; points=monitor(d.date,d.price,name,months('2023-01',d.date.iloc[-1]));out['current'].append({'id':name,'asOf':d.date.iloc[-1],'latest':points[-1],'history':points})
 print('current',name,points[-1]['percentile'],flush=True)
e=[c for c in out['events']if c['status']=='evaluated'];c=[c for c in out['controls']if c['status']=='evaluated']
out['summary']={'eventsTested':len(e),'eventsDetected':sum(x['warning']for x in e),'eventsMissed':sum(not x['warning']for x in e),'controlsTested':len(c),'controlAlerts':sum(x['warning']for x in c),'controlQuiet':sum(not x['warning']for x in c)}
(ROOT/'results.json').write_text(json.dumps(out,indent=2,allow_nan=False))
print(json.dumps(out['summary']),flush=True)
