'use strict';
const readline=require('node:readline');
const {lessonFrame,createDocumentLayout,width:cellWidth,graphemes}=require('./workspace.cjs');
// Navigation is independent of course state. No terminal output marks work complete.
function plainText(text){return String(text).replace(/\x1b\[[0-?]*[ -/]*[@-~]/g,'').replace(/\x1b/g,'').replace(/[\x00-\x08\x0b-\x1f\x7f]/g,'').replace(/^#{1,6}\s+/gm,'').replace(/^```[^\n]*\n?/gm,'').replace(/\[([^\]]+)\]\(([^)]+)\)/g,'$1 ($2)').replace(/\*\*([^*]+)\*\*/g,'$1').replace(/`([^`]+)`/g,'$1');}
function wrap(text,width=76){
 width=Math.max(12,width);const out=[];
 for(const line of plainText(text).split('\n')){
  if(!line.trim()){out.push('');continue;}
  const indent=/^\s*(?:[-*]|\d+\.)\s/.test(line)?'   ':'';let rest=line;
  while(cellWidth(rest)>width){
   let prefix='',used=0;for(const g of graphemes(rest)){const cells=cellWidth(g);if(used+cells>width)break;prefix+=g;used+=cells;}
   const space=prefix.lastIndexOf(' '),at=space>0&&cellWidth(prefix.slice(0,space))>width/3?space:prefix.length;
   out.push(rest.slice(0,at));rest=indent+rest.slice(at).trimStart();
  }
  out.push(rest);
 }
 return out;
}

function overview(w,s){const raw=w.read(s.lab,s.part+'/INSTRUCTIONS.md');const paragraphs=raw.split(/\n\s*\n/);return plainText(paragraphs.find(p=>p.trim()&&!p.startsWith('#'))||'Read the exercise before starting.').trim();}
function actions(w,s,agentLabel){const ids=w.route(s.path).labs,index=ids.indexOf(s.lab);return [{label:'Read the exercise',value:'read'},{label:'Work with '+agentLabel,value:'agent'},{label:'Check my work',value:'check'},{label:index===ids.length-1?'Finish this path':'Next lab',value:index===ids.length-1?'finish':'next'},{label:'More options',value:'more'}];}
function createTerminal({input=process.stdin,output=process.stdout,plain=false}={}){
 const rich=!plain&&input.isTTY&&output.isTTY&&process.env.TERM!=='dumb';const color=rich&&!('NO_COLOR'in process.env);const accent=s=>color?'\x1b[36m'+s+'\x1b[0m':s;const bold=s=>color?'\x1b[1m'+s+'\x1b[0m':s;const dim=s=>color?'\x1b[2m'+s+'\x1b[0m':s;let rl,active=false,pending=null,closed=false,previous=[],geometry='',activeKey=null,keyQueue=[],pasting=false,pasteText='';const positions=new Map();
 const size=()=>({width:Math.max(24,Math.min(100,(output.columns||80)-4)),height:Math.max(8,(output.rows||24)-4)});
 function enter(){if(!rich||active)return;active=true;previous=[];geometry='';readline.emitKeypressEvents(input,{escapeCodeTimeout:25});input.setRawMode(true);input.on('keypress',dispatch);input.resume();output.write('\x1b[?1049h\x1b[?25l\x1b[?2004h');}
 function leave(){if(!active)return;input.off('keypress',dispatch);keyQueue=[];pasting=false;pasteText='';try{input.setRawMode(false)}catch{}output.write('\x1b[?2004l\x1b[?2026l\x1b[0m\x1b[?25h\x1b[?1049l');input.pause();active=false;}
 function frame(lines){
  if(!rich)return;
  const nextGeometry=(output.columns||80)+'x'+(output.rows||24);
  const changedSize=geometry!==nextGeometry;geometry=nextGeometry;
  let update=changedSize?'\x1b[H\x1b[2J':'';
  for(let i=0;i<Math.max(lines.length,previous.length);i++)
   if(changedSize||lines[i]!==previous[i])update+='\x1b['+(i+1)+';1H'+(lines[i]||'')+'\x1b[K';
  previous=lines.slice();
  if(update)output.write('\x1b[?2026h'+update+'\x1b[?2026l');
 }

 function dispatch(str,key={}){if(key.name==='paste-start'){pasting=true;pasteText='';return;}if(key.name==='paste-end'){pasting=false;const text=pasteText;pasteText='';dispatch('',{name:'paste',text});return;}if(pasting){pasteText+=(str||'');return;}if(activeKey)activeKey(str,key);else keyQueue.push([str,key]);}
 function waitKey(draw,onKey){return new Promise(resolve=>{
  let finished=false;
  const done=v=>{if(finished)return;finished=true;clearTimeout(resizeTimer);activeKey=null;output.off('resize',resize);pending=null;resolve(v);};
  const key=(str,k={})=>{if(k.ctrl&&['c','d'].includes(k.name)){closed=true;done(null);return;}onKey(str,k,done);};
  let resizeTimer;const resize=()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(draw,25);};pending=()=>done(null);activeKey=key;output.on('resize',resize);draw();
  queueMicrotask(()=>{while(activeKey&&keyQueue.length){const [str,k]=keyQueue.shift();dispatch(str,k);}});
 });}

 async function menu(title,items,{context=[],back=true,selected=0,notice='',preview=null,filter=false}={}){
  if(closed)return null;
  if(!rich){if(!rl)rl=readline.createInterface({input,output,terminal:false});output.write('\n'+plainText(title)+'\n');for(const l of context)output.write(wrap(l,size().width).join('\n')+'\n');if(notice)output.write(plainText(notice)+'\n');items.forEach((x,i)=>output.write('  '+(i+1)+'. '+x.label+'\n'));output.write('  '+(back?'b. Back  ·  ':'')+'q. Quit\n');while(!closed){const answer=await new Promise(resolve=>{const close=()=>resolve('q');rl.once('close',close);rl.question('> ',a=>{rl.off('close',close);resolve(a)});});const a=answer.trim().toLowerCase();if(['q','0'].includes(a)){closed=true;return null;}if(a==='b'&&back)return null;const n=Number(a);if(Number.isInteger(n)&&n>0&&n<=items.length)return items[n-1].value;output.write('Enter a listed number'+(back?', b to go back':'')+', or q to quit.\n');}return null;}
  enter();let index=Math.min(selected,items.length-1),offset=0,query='';const matches=()=>items.filter(x=>!query||x.label.toLowerCase().includes(query.toLowerCase()));const draw=()=>{const {width,height}=size();const available=matches();index=Math.max(0,Math.min(index,available.length-1));const head=[bold('Claude Code Zero to Hero'),''];const contextLines=context.flatMap(x=>wrap(x,width));const reserved=6;const room=Math.max(0,height-reserved-3);head.push(...contextLines.slice(0,room),...(contextLines.length?['']:[]),bold(plainText(title)));if(filter)head.push('Find: '+query+(query?'':'type an exercise name'));if(notice)head.push(...wrap(notice,width).slice(0,2));const visible=Math.max(1,height-head.length-(preview?7:3));if(index<offset)offset=index;if(index>=offset+visible)offset=index-visible+1;const rows=available.slice(offset,offset+visible).map((x,i)=>{const n=offset+i;return (n===index?accent('› '):'  ')+plainText((n+1)+'. '+x.label).slice(0,width-2)});const details=preview&&available[index]?wrap(preview(available[index].value),width).slice(0,3):[];frame([...head,...(rows.length?rows:['No matching exercises. Backspace to change the search.']),...(details.length?['',...details]:[]),'',accent(filter?'↑↓ preview · Enter open · Esc back':width<60?'↑↓ · Enter · '+(back?'Esc back · ':'')+'q quit':'↑/↓ choose · Enter select · '+(back?'Esc back · ':'')+'q quit')]);};return waitKey(draw,(str,k,done)=>{const available=matches();if(k.name==='paste'){if(filter){query+=plainText(k.text).replace(/\s+/g,' ').trim();index=0;draw();}return;}if(filter&&k.name==='backspace'){query=query.slice(0,-1);index=0;draw();return;}if(filter&&/^[^\x00-\x1f\x7f]$/u.test(str||'')&&!k.ctrl&&!k.meta){query+=str;index=0;draw();return;}if(k.name==='up'){index=available.length?(index-1+available.length)%available.length:0;draw()}else if(k.name==='down'){index=available.length?(index+1)%available.length:0;draw()}else if(k.name==='home'){index=0;draw()}else if(k.name==='end'){index=available.length-1;draw()}else if(k.name==='return'&&available[index])done(available[index].value);else if(k.name==='escape'&&back)done(null);else if(str==='q'||str==='0'){closed=true;done(null)}else if(/^[1-9]$/.test(str||'')){const n=Number(str)-1;if(n<items.length){index=n;draw()}}});
 }
 async function read(title,text){
  if(closed)return;
  if(!rich){output.write('\n'+plainText(title)+'\n\n'+wrap(text,size().width).join('\n')+'\n');return;}
  enter();let top=0,cachedWidth,cachedLines;const draw=()=>{const {width,height}=size();if(width!==cachedWidth){cachedWidth=width;cachedLines=wrap(text,width);}const lines=cachedLines,page=Math.max(1,height-5);top=Math.max(0,Math.min(top,Math.max(0,lines.length-page)));frame([bold(title),'',...lines.slice(top,top+page),'',accent((width<60?'↑↓/Space · Esc/q return · ':'↑/↓ scroll · Space next · Esc/q return · ')+Math.min(top+page,lines.length)+'/'+lines.length)]);};await waitKey(draw,(str,k,done)=>{const page=Math.max(1,size().height-5);if(k.name==='escape'||k.name==='return'||str==='b')done();else if(k.name==='down'){top++;draw()}else if(k.name==='up'){top--;draw()}else if(k.name==='pagedown'||str===' '){top+=page;draw()}else if(k.name==='pageup'){top-=page;draw()}else if(k.name==='home'){top=0;draw()}else if(k.name==='end'){top=Number.MAX_SAFE_INTEGER;draw()}else if(str==='q')done()});
 }
 async function exercise(model){
  enter();const id=model.id;let place=positions.get(id)||{top:0},top=place.top,last;
  const layout=createDocumentLayout();
  const draw=()=>{last=lessonFrame(model,{columns:output.columns||80,rows:output.rows||24},{dim,bold,accent},wrap,top,place.columns&&place.columns!==output.columns?place.sourceLine:null,layout);top=last.top;place={top,sourceLine:last.sourceLine,columns:output.columns};positions.set(id,place);frame(last.lines);};
  return waitKey(draw,(str,k,done)=>{
   if(k.name==='paste'){model.notice='Paste task text into '+model.agentLabel+', not the course controls.';draw();}
   else if(k.name==='down'){top++;draw()}else if(k.name==='up'){top--;draw()}
   else if(k.name==='pagedown'||str===' '){top+=last.page;draw()}
   else if(k.name==='pageup'){top-=last.page;draw()}
   else if(k.name==='home'){top=0;draw()}else if(k.name==='end'){top=Number.MAX_SAFE_INTEGER;draw()}
   else if(k.name==='return'||str==='2')done('agent');
   else if(str==='c'||str==='3')done('check');
   else if(str==='n'||str==='4')done(model.atEnd?'finish':'next');
   else if(str==='l')done('browse');
   else if(str==='?'||str==='5')done('more');
   else if(str==='r'||str==='1')done('read');
   else if(str==='q'||str==='0'){closed=true;done(null)}
  });
 }
 async function suspend(fn){leave();if(rl){rl.close();rl=null;}try{return await fn()}finally{if(!closed)enter();}}
 const terminate=()=>{close();process.exit(143)},hangup=()=>{close();process.exit(129)};if(rich){process.once('exit',leave);process.once('SIGTERM',terminate);process.once('SIGHUP',hangup);}
 function close(){process.off('exit',leave);process.off('SIGTERM',terminate);process.off('SIGHUP',hangup);closed=true;if(pending)pending();if(rl)rl.close();leave();}
 return {menu,read,exercise,suspend,close,get closed(){return closed},rich};
}
module.exports={plainText,wrap,overview,actions,createTerminal};
