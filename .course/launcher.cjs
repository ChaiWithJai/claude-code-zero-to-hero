'use strict';
const fs=require('node:fs');
const path=require('node:path');
const cp=require('node:child_process');
const {createTerminal,overview,actions,wrap}=require('./terminal.cjs');
const {createWorkshop,PARTS,PATHS}=require('./workshop.cjs');
function parseArgs(args){
 const out={};
 const values=['--path','--lab','--part','--agent'];const switches=['--list','--doctor','--check','--hint','--example','--resume','--claude','--start','--help','--plain'];
 for(let i=0;i<args.length;i++){
  const key=args[i];
  if(values.includes(key)){if(!args[i+1]||args[i+1].startsWith('--'))throw Error('Add a value after '+key);out[key.slice(2)]=args[++i];}
  else if(switches.includes(key))out[key.slice(2)]=true;
  else throw Error('Unknown option '+key+'. Use node go --help.');
 }
 if(out.path&&!PATHS.includes(out.path))throw Error('Use --path live or --path signature.');
 if(out.part&&!PARTS.includes(out.part))throw Error('Use --part lab, homework, or extension.');
 if(out.agent&&!['claude','codex'].includes(out.agent))throw Error('Use --agent claude or --agent codex.');
 return out;
}
function header(){console.log('\nClaude Code Zero to Hero\nChoose a wish. Build your understanding. Practice with your sidekick.\n');}
function showSelection(w,s){
 console.log('\n'+s.labData.id+' · '+s.labData.title+' / '+s.part+'\n');
 console.log(wrap(w.read(s.lab,s.part+'/INSTRUCTIONS.md'),Math.min(88,process.stdout.columns||80)).join('\n'));
 console.log('\nYour work: '+s.relative+'\nYour existing files are kept.\n');
}
async function main(){
 const w=createWorkshop(path.resolve(__dirname,'..'));const opts=parseArgs(process.argv.slice(2));
 const agent=opts.agent||'claude';const agentLabel=agent==='codex'?'Codex':'Claude Code';
 const prepare=(...args)=>w.prepare(...args,agent);
 if(opts.help){console.log('Start: node go\nJump: node go --path live --lab 03\nParts: --part lab | homework | extension\nOther options: --list, --resume, --hint, --example, --check, --doctor\nAdd --lab to choose a specific activity; otherwise your last activity is used.\nCodex: add --agent codex. Add --start to launch the selected agent.\nUse --plain for numbered prompts without screen redraws.\nNo dependencies to install. No Git commands are run by the launcher.');return;}
 if(opts.doctor){
  console.log('Node.js '+process.versions.node+' — ready.');
  try{fs.accessSync(w.root,fs.constants.W_OK);console.log('Practice folder — writable.');}catch{console.log('Practice folder — read-only. Extract or clone into a folder you can write to.');process.exitCode=1;}
  const command=process.platform==='win32'?'cmd.exe':agent;const args=process.platform==='win32'?['/d','/s','/c',agent+' --version']:['--version'];
  const r=cp.spawnSync(command,args,{encoding:'utf8',timeout:5000});
  console.log(!r.error&&r.status===0?agentLabel+' — found.':agentLabel+' — not found or not ready. See SETUP.md; you can still use observer practice.');
  console.log('Next: node go');return;
 }
 if(opts.list){const key=opts.path||'live';console.log(w.route(key).title+'\n');for(const id of w.route(key).labs){const l=w.labById(id);console.log(l.id+' · '+l.title);}console.log('\nHomework and extensions are available from each lab.');return;}
 let last=w.state(),initialSelection;
 if(opts.lab||opts.check||opts.hint||opts.example||opts.resume||opts.claude||opts.start){
  const id=opts.lab||last?.lab;if(!id)throw Error('Choose a lab first: node go --list');
  const lab=w.labById(id);const part=opts.part||((last?.lab===lab.id)?last.part:'lab');const key=opts.path||last?.path||'live';
  if(opts.check){const result=w.check(lab.id,part);result.messages.forEach(x=>console.log(x));if(!result.ok)process.exitCode=1;return;}
  if(opts.hint||opts.example){console.log(w.read(lab.id,opts.hint?'HINTS.md':'EXAMPLE.md'));return;}
  const s=prepare(lab.id,part,key);if(process.stdin.isTTY&&!opts.claude&&!opts.start){initialSelection=s;}else{showSelection(w,s);if(opts.claude||opts.start)console.log(w.launchAgent(s.dir,agent));return;}
 }
 if(!process.stdin.isTTY){header();console.log('Use an interactive terminal to choose a path, or jump directly:\n  node go --path live --lab 01\n  node go --list');return;}
 const ui=createTerminal({plain:opts.plain});let selection=initialSelection,pathKey=initialSelection?.path||opts.path,notice='',focus=0;
 const choosePath=()=>ui.menu('How are you learning?',[{label:'Live workshop',value:'live'},{label:'Signature course',value:'signature'}]);
 async function chooseLab(key){const ids=w.route(key).labs;return ui.menu('Choose an exercise',ids.map((id,i)=>({label:w.labById(id).title,value:id})),{context:[w.route(key).title]});}
 try{
  if(last&&!pathKey&&!selection){const answer=await ui.menu('Welcome back',[{label:'Continue '+w.labById(last.lab).title,value:'resume'},{label:'Browse the course',value:'browse'}],{context:[w.route(last.path).title+' · '+last.part],back:false});if(!answer)return;if(answer==='resume'){pathKey=last.path;selection=prepare(last.lab,last.part,pathKey);}}
  while(!selection&&!ui.closed){if(!pathKey)pathKey=await choosePath();if(!pathKey)return;const id=await chooseLab(pathKey);if(id)selection=prepare(id,'lab',pathKey);else pathKey=null;}
  while(selection&&!ui.closed){
   const ids=w.route(pathKey).labs,position=ids.indexOf(selection.lab);const context=[w.route(pathKey).title+' · Exercise '+(position+1)+' of '+ids.length+' · '+(selection.part==='lab'?'Core practice':selection.part),selection.labData.title,overview(w,selection),'Work: '+selection.relative];
   const action=await ui.menu('What would you like to do?',actions(w,selection,agentLabel),{context,back:false,notice,selected:focus});notice='';if(!action)return;focus=actions(w,selection,agentLabel).findIndex(x=>x.value===action);
   if(action==='read'){await ui.read(selection.labData.title,w.read(selection.lab,selection.part+'/INSTRUCTIONS.md'));focus=1;}
   else if(action==='agent'){notice=await ui.suspend(()=>w.launchAgent(selection.dir,agent));focus=2;}
   else if(action==='check'){const r=w.check(selection.lab,selection.part);await ui.read('Review your work',r.messages.join('\n\n'));}
   else if(action==='next'){selection=prepare(ids[position+1],'lab',pathKey);focus=0;}
   else if(action==='finish'){const end=await ui.menu('You reached the end of this path',[{label:'Save my place and exit',value:'exit'},{label:'Stay with this exercise',value:'stay'}],{context:['Your work is saved in '+selection.relative+'.','Keep your seven-day plan and choose one opportunity to try. This is a place to stop, not a grade.']});if(end==='exit'||ui.closed)return;}
   else if(action==='more'){
    const extra=await ui.menu('More options',[{label:'Get a hint',value:'hint'},{label:'Show a worked example (reveals the approach)',value:'example'},{label:'Homework or extension',value:'part'},{label:'Browse exercises',value:'browse'},{label:'Change learning path',value:'path'}],{context:[selection.labData.title]});
    if(extra==='hint'||extra==='example')await ui.read(extra==='hint'?'A hint':'Worked example',w.read(selection.lab,extra==='hint'?'HINTS.md':'EXAMPLE.md'));
    else if(extra==='part'){const part=await ui.menu('Choose your practice',[{label:'Core exercise',value:'lab'},{label:'Homework',value:'homework'},{label:'Extension',value:'extension'}]);if(part)selection=prepare(selection.lab,part,pathKey);}
    else if(extra==='browse'){const id=await chooseLab(pathKey);if(id)selection=prepare(id,'lab',pathKey);}
    else if(extra==='path'){const key=await choosePath();if(key){const id=await chooseLab(key);if(id){pathKey=key;selection=prepare(id,'lab',pathKey);}}}
   }
  }
 }finally{ui.close();console.log(selection?'Your work is saved. Run node go to continue.':'Run node go whenever you are ready.');}

}
module.exports={main,parseArgs};
