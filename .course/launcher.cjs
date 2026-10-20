'use strict';
const fs=require('node:fs');
const path=require('node:path');
const cp=require('node:child_process');
const {createInterface}=require('node:readline/promises');
const {createWorkshop,PARTS,PATHS}=require('./workshop.cjs');
function parseArgs(args){
 const out={};
 const values=['--path','--lab','--part'];const switches=['--list','--doctor','--check','--hint','--example','--resume','--claude','--help'];
 for(let i=0;i<args.length;i++){
  const key=args[i];
  if(values.includes(key)){if(!args[i+1]||args[i+1].startsWith('--'))throw Error('Add a value after '+key);out[key.slice(2)]=args[++i];}
  else if(switches.includes(key))out[key.slice(2)]=true;
  else throw Error('Unknown option '+key+'. Use node go --help.');
 }
 if(out.path&&!PATHS.includes(out.path))throw Error('Use --path live or --path signature.');
 if(out.part&&!PARTS.includes(out.part))throw Error('Use --part lab, homework, or extension.');
 return out;
}
function header(){console.log('\nClaude Code Zero to Hero\nChoose a wish. Build your understanding. Practice with your sidekick.\n');}
function showSelection(w,s){
 console.log('\n'+s.labData.id+' · '+s.labData.title+' / '+s.part+'\n');
 console.log(w.read(s.lab,s.part+'/INSTRUCTIONS.md'));
 console.log('\nYour work: '+s.relative+'\nYour existing files are kept.\n');
}
async function main(){
 const w=createWorkshop(path.resolve(__dirname,'..'));const opts=parseArgs(process.argv.slice(2));
 if(opts.help){console.log('Start: node go\nJump: node go --path live --lab 03\nParts: --part lab | homework | extension\nOther options: --list, --resume, --hint, --example, --check, --doctor\nAdd --lab to choose a specific activity; otherwise your last activity is used.\nNo dependencies to install. No Git commands are run by the launcher.');return;}
 if(opts.doctor){
  console.log('Node.js '+process.versions.node+' — ready.');
  try{fs.accessSync(w.root,fs.constants.W_OK);console.log('Practice folder — writable.');}catch{console.log('Practice folder — read-only. Extract or clone into a folder you can write to.');process.exitCode=1;}
  const command=process.platform==='win32'?'cmd.exe':'claude';const args=process.platform==='win32'?['/d','/s','/c','claude --version']:['--version'];
  const r=cp.spawnSync(command,args,{encoding:'utf8',timeout:5000});
  console.log(!r.error&&r.status===0?'Claude Code — found.':'Claude Code — not found or not ready. See SETUP.md; you can still use observer practice.');
  console.log('Next: node go');return;
 }
 if(opts.list){const key=opts.path||'live';console.log(w.route(key).title+'\n');for(const id of w.route(key).labs){const l=w.labById(id);console.log(l.id+' · '+l.title);}console.log('\nHomework and extensions are available from each lab.');return;}
 let last=w.state();
 if(opts.lab||opts.check||opts.hint||opts.example||opts.resume||opts.claude){
  const id=opts.lab||last?.lab;if(!id)throw Error('Choose a lab first: node go --list');
  const lab=w.labById(id);const part=opts.part||((last?.lab===lab.id)?last.part:'lab');const key=opts.path||last?.path||'live';
  if(opts.check){const result=w.check(lab.id,part);result.messages.forEach(x=>console.log(x));if(!result.ok)process.exitCode=1;return;}
  if(opts.hint||opts.example){console.log(w.read(lab.id,opts.hint?'HINTS.md':'EXAMPLE.md'));return;}
  const s=w.prepare(lab.id,part,key);showSelection(w,s);if(opts.claude)console.log(w.launchClaude(s.dir));return;
 }
 header();
 if(!process.stdin.isTTY){console.log('Use an interactive terminal to choose a path, or jump directly:\n  node go --path live --lab 01\n  node go --list');return;}
 const rl=createInterface({input:process.stdin,output:process.stdout});
 let cancelled=false;rl.on('SIGINT',()=>{cancelled=true;rl.close();});
 async function choose(title,items){
  console.log('\n'+title);items.forEach((x,i)=>console.log('  '+(i+1)+'. '+x.label));console.log('  0. Exit');
  while(!cancelled){let answer;try{answer=await rl.question('\nChoose a number: ');}catch(error){if(cancelled)return null;throw error;}
   if(answer.trim()==='0')return null;
   const n=Number(answer.trim());if(Number.isInteger(n)&&n>=1&&n<=items.length)return items[n-1].value;
   console.log('Choose one of the listed numbers, or 0 to exit.');
  }return null;
 }
 try{
  let pathKey=opts.path;let selection;
  if(last&&!pathKey){const answer=await choose('Welcome back.',[{label:'Continue '+last.lab+' · '+w.labById(last.lab).title+' / '+last.part,value:'resume'},{label:'Choose a path and lab',value:'choose'}]);if(!answer)return;if(answer==='resume'){pathKey=last.path;selection=w.prepare(last.lab,last.part,pathKey);}}
  if(!selection){
   if(!pathKey)pathKey=await choose('How are you learning today?',[{label:'Live workshop — follow along with the room',value:'live'},{label:'Signature course — explore in sequence',value:'signature'}]);if(!pathKey)return;
   const id=await choose(w.route(pathKey).title,w.route(pathKey).labs.map(id=>({label:w.labById(id).title,value:id})));if(!id)return;
   selection=w.prepare(id,'lab',pathKey);
  }
  while(selection&&!cancelled){
   showSelection(w,selection);
   const action=await choose('What would help next?',[
    {label:'Start Claude Code in this workspace',value:'claude'},
    {label:'Check my work',value:'check'},
    {label:'Get a hint',value:'hint'},
    {label:'Compare with an example (reveals a worked approach)',value:'example'},
    {label:'Choose homework or an extension',value:'part'},
    {label:'Move to the next lab',value:'next'},
    {label:'Choose another lab or learning path',value:'choose'}]);
   if(!action)return;
   if(action==='claude')console.log(w.launchClaude(selection.dir));
   else if(action==='check')w.check(selection.lab,selection.part).messages.forEach(x=>console.log(x));
   else if(action==='hint'||action==='example')console.log(w.read(selection.lab,action==='hint'?'HINTS.md':'EXAMPLE.md'));
   else if(action==='part'){
    const part=await choose('Same topic, different practice.',[{label:'Core lab',value:'lab'},{label:'Homework — revisit this in your own life',value:'homework'},{label:'Extension — try a further challenge',value:'extension'}]);if(!part)return;selection=w.prepare(selection.lab,part,pathKey);
   }else if(action==='next'){
    const labs=w.route(pathKey).labs;const index=labs.indexOf(selection.lab);if(index<0||index===labs.length-1){console.log('You reached the end of this path. Keep your plan and choose your next use.');continue;}selection=w.prepare(labs[index+1],'lab',pathKey);
   }else if(action==='choose'){
    const key=await choose('Choose your path.',[{label:'Live workshop',value:'live'},{label:'Signature course',value:'signature'}]);if(!key)return;pathKey=key;
    const id=await choose(w.route(pathKey).title,w.route(pathKey).labs.map(id=>({label:w.labById(id).title,value:id})));if(!id)return;selection=w.prepare(id,'lab',pathKey);
   }
  }
 }finally{rl.close();}
}
module.exports={main,parseArgs};
