import json,pathlib
import pandas as pd
import numpy as np
from detector import monitor
root=pathlib.Path(__file__).parent
j=json.loads((root/'results.json').read_text());r=pd.read_csv(root/'data/ken-french-monthly-returns.csv');r['date']=pd.to_datetime(r.date).dt.strftime('%Y-%m');r=r.dropna(subset=['Chips','Hardw','Softw'])
series={x:pd.DataFrame({'date':r.date,'price':100*np.cumprod(1+r[x[3:]])}) for x in ['FF_Chips','FF_Hardw','FF_Softw','FF_Mkt']}
series['AI_PROXY']=pd.read_csv(root/'data/AI_PROXY_monthly.csv')
d=pd.read_csv(root/'data/NASDAQCOM_monthly.csv');d['date']=pd.to_datetime(d.date).dt.strftime('%Y-%m');series['NASDAQCOM']=d[d.date<='2026-08']
for c in j['current']:
 d=series[c['id']];pts=monitor(d.date,d.price,c['id'],[d.date.iloc[-1]],window=120,minimum=20);c['sensitivity120']=pts[-1];print(c['id'],pts[-1]['percentile'],pts[-1]['warning'])
(root/'results.json').write_text(json.dumps(j,indent=2,allow_nan=False))
