'use strict';
const pricing=typeof module==='object'?require('./pricing.json'):globalThis.LAB_PRICING;
function nonnegative(x,name){if(!Number.isFinite(x)||x<0)throw Error(name+' must be a nonnegative number');return x;}
function requestCost(r){
 const spec=pricing.models[r.model];if(!spec)return {known:false,reason:'Unpriced model '+r.model};
 const fields=['input','output','write5m','write1h','read'];for(const key of fields)nonnegative(r[key]??0,key);
 if(r.unresolved_cache_write)return {known:false,reason:'Cache-write TTL breakdown is missing'};
 const prompt=(r.input||0)+(r.write5m||0)+(r.write1h||0)+(r.read||0);const tier=spec.threshold&&prompt>spec.threshold?'long':'standard';const rates=spec[tier];
 const parts=Object.fromEntries(fields.map(k=>[k,(r[k]||0)*rates[k]/1e6]));return {known:true,tier,prompt_tokens:prompt,parts,usd:Object.values(parts).reduce((a,b)=>a+b,0)};
}
function summarize(trace){
 const seen=new Map();for(const r of trace.requests){if(!r.id)throw Error('Each request needs a stable id');seen.set(r.id,r);}
 const requests=[...seen.values()].map(r=>({...r,estimate:requestCost(r)}));const unknown=requests.filter(r=>!r.estimate.known);const known=requests.reduce((sum,r)=>sum+(r.estimate.usd||0),0);
 const human=trace.human||{};const minutes=nonnegative(human.active_minutes??0,'active minutes');const hourly=nonnegative(human.hourly_value_usd??0,'hourly value');const tools=trace.tool_charges_usd==null?null:nonnegative(trace.tool_charges_usd,'tool charges');
 return {job:trace.job,evidence:trace.evidence,accepted:trace.accepted===true,requests,request_count:requests.length,unpriced_requests:unknown.length,known_api_equivalent_usd:known,api_equivalent_usd:unknown.length?null:known,tool_charges_usd:tools,human_minutes:minutes,human_value_usd:minutes/60*hourly,estimated_job_value_cost_usd:unknown.length||tools===null?null:known+tools+minutes/60*hourly,billed_cash_usd:null,notes:['API-equivalent list-price estimate is not an invoice.','Do not add API-equivalent usage to a subscription fee for included usage.','Human time value is a planning assumption; waiting time is not active work.','Acceptance requires checking the promised output, not just a successful response.']};
}
function fixture(){return {job:'Prototype and check a revenue-pilot analysis',evidence:'SIMULATED teaching fixture, not measured account usage',accepted:true,tool_charges_usd:0,human:{active_minutes:8,hourly_value_usd:60},requests:[{id:'draft',stage:'Draft',model:'claude-haiku-5-5',input:20000,output:2500,write5m:10000,read:0},{id:'review',stage:'Check',model:'claude-haiku-5-5',input:3000,output:1200,read:30000},{id:'repair',stage:'Repair',model:'claude-haiku-5-5',input:2500,output:1000,read:30000}]};}
// Last usage snapshot for a stable message id wins. Multiple content blocks can repeat usage.
function importStream(text,job){
 const records=new Map();let malformed=0,result=false;
 for(const line of text.split(/\r?\n/)){if(!line.trim())continue;let e;try{e=JSON.parse(line);}catch{malformed++;continue;}
  if(e.type==='result')result=true;
  const m=e.type==='assistant'?e.message:null;if(!m?.id||!m.usage)continue;const u=m.usage;const c=u.cache_creation||{};const w5=c.ephemeral_5m_input_tokens??0,w1=c.ephemeral_1h_input_tokens??0,total=u.cache_creation_input_tokens??0;
  records.set(m.id,{id:m.id,stage:'Observed request',model:m.model,input:u.input_tokens??0,output:u.output_tokens??0,read:u.cache_read_input_tokens??0,write5m:w5,write1h:w1,unresolved_cache_write:total!==w5+w1});
 }
 if(!records.size)throw Error('No assistant message ids with usage found. Supply a Claude stream-json export, not a plain transcript.');
 return {job,evidence:'OBSERVED token metadata from supplied stream-json; prompts and tool contents excluded',accepted:false,tool_charges_usd:null,human:{active_minutes:0,hourly_value_usd:0},requests:[...records.values()],capture:{result_event_present:result,malformed_lines:malformed,completeness:'Partial stream coverage possible. Background calls, other sessions and provider adjustments may be absent.'}};
}
if(typeof module==='object')module.exports={pricing,requestCost,summarize,fixture,importStream};else globalThis.CostEngine={pricing,requestCost,summarize,fixture,importStream};

function businessCase(c){
 const keys=['opportunities','baseline_rate','pilot_rate','sale_usd','margin_rate','api_plan_usd','other_tools_usd','paid_review_usd','operations_usd','setup_usd','before_hours','after_hours','hourly_value_usd','verified_cash_reduction_usd'];
 for(const k of keys)nonnegative(c[k]??0,k);
 for(const k of ['baseline_rate','pilot_rate','margin_rate'])if(c[k]>1)throw Error(k+' must be between 0 and 1');
 const added_sales=c.opportunities*(c.pilot_rate-c.baseline_rate),added_revenue=added_sales*c.sale_usd,contribution=added_revenue*c.margin_rate;
 const run_cost=c.api_plan_usd+c.other_tools_usd+c.paid_review_usd+c.operations_usd;
 const released_hours=c.before_hours-c.after_hours,capacity_value=released_hours*c.hourly_value_usd;
 const incremental=c.mode==='revenue'?contribution:c.verified_cash_reduction_usd;
 const net=incremental-run_cost;
 return {added_sales,added_revenue_usd:added_revenue,incremental_contribution_usd:contribution,recurring_run_cost_usd:run_cost,one_time_setup_usd:c.setup_usd,net_recurring_usd:net,simple_setup_payback_months:net>0?c.setup_usd/net:null,released_hours,capacity_value_usd:capacity_value,verified_cash_reduction_usd:c.verified_cash_reduction_usd,evidence:'Hypothetical scenario. Validate lift, quality, delivery capacity and cash realization in a pilot. Capacity value is separate from realized cash savings.'};
}
if(typeof module==='object')module.exports.businessCase=businessCase;else globalThis.CostEngine.businessCase=businessCase;
