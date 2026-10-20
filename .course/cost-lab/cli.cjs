'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {pricing,fixture,summarize,importStream}=require('./engine.cjs');
const money=n=>n===null?'unknown':'$'+n.toFixed(6);
function print(trace){const r=summarize(trace);console.log('\n'+r.job+'\n'+r.evidence+'\n');for(const x of r.requests)console.log(x.stage.padEnd(17)+money(x.estimate.usd??null)+(x.estimate.known?'  '+x.estimate.tier:'  '+x.estimate.reason));console.log('\nAPI-equivalent usage: '+money(r.api_equivalent_usd)+'\nHuman active time: '+r.human_minutes+' min ($'+r.human_value_usd.toFixed(2)+' illustrative value)\nCompleted and accepted: '+(r.accepted?'yes':'not established')+'\nBilled cash: unknown; check your provider account\nRates checked: '+pricing.verified_on+'\n');return r;}
async function main(){
 const args=process.argv.slice(2),command=args.shift()||'help';let trace;
 if(command==='demo'||command==='serve')trace=fixture();
 else if(command==='import'){
  if(!args[0])throw Error('Usage: node cost-lab import /path/to/stream.jsonl [--serve]');
  trace=importStream(fs.readFileSync(path.resolve(args.shift()),'utf8'),'My observed job');
 }else{console.log('Claude Code: the cost of a finished job\n\n  node cost-lab demo           Zero-credit example and cost breakdown\n  node cost-lab serve          Interactive visual on localhost\n  node cost-lab import FILE    Summarize one supplied stream-json log\n  node cost-lab import FILE --serve\n\nNo model calls, credentials, integrations, or log scanning.\nRead labs/daily-cost/README.md for the 20-minute exercise.');return;}
 const report=print(trace);const root=path.resolve(__dirname,'../..');const dir=path.join(root,'.local/cost-lab');fs.mkdirSync(dir,{recursive:true});const file=path.join(dir,'report-'+Date.now()+'.json');fs.writeFileSync(file,JSON.stringify({trace,report},null,2)+'\n');console.log('Saved metadata-only report: '+path.relative(root,file));
 if(command!=='serve'&&!args.includes('--serve'))return;
 const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');if(url.pathname==='/data'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({trace,pricing}));}
  else if(url.pathname==='/engine.js'){res.setHeader('Content-Type','text/javascript');res.end(fs.readFileSync(path.join(__dirname,'engine.cjs')));}
  else if(url.pathname==='/'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(fs.readFileSync(path.join(__dirname,'visual.html')));}
  else{res.statusCode=404;res.end('Not found');}
 });
 server.listen(0,'127.0.0.1',()=>console.log('\nVisual exercise: http://127.0.0.1:'+server.address().port+'\nCtrl+C stops the server.'));
}
module.exports={main,print};
