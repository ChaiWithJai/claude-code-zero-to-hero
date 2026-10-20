'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {plainText,wrap,actions}=require('../terminal.cjs');
test('readable exercise text preserves prompt code and link destinations without terminal control sequences',()=>{const text=plainText('# Task\n\n```text\nRead inputs/.\n```\n[Reading](READING.md)\n\x1b[2J');assert.match(text,/Read inputs\//);assert.match(text,/Reading \(READING.md\)/);assert.doesNotMatch(text,/[#`\x1b]/);});
test('long words and paths wrap without dropping content',()=>{const input='a'.repeat(85);assert.equal(wrap(input,32).join(''),input);assert.ok(wrap(input,32).every(s=>s.length<=32));});
test('last lab replaces next with a finish action on both course paths',()=>{const {createWorkshop}=require('../workshop.cjs');const path=require('node:path'),w=createWorkshop(path.resolve(__dirname,'../..'));for(const key of ['live','signature']){const ids=w.route(key).labs;const first=actions(w,{path:key,lab:ids[0]},'Claude Code'),last=actions(w,{path:key,lab:ids.at(-1)},'Claude Code');assert.equal(first.length,5);assert.ok(first.some(a=>a.value==='next'));assert.ok(!last.some(a=>a.value==='next'));assert.ok(last.some(a=>a.value==='finish'));assert.ok(!last.some(a=>['hint','example'].includes(a.value)));}});
const {lessonFrame,width,documentLines}=require('../workspace.cjs');
const identity={dim:s=>s,bold:s=>s,accent:s=>s};
const model={title:'Direct your first sidekick',pathLabel:'Live workshop',position:4,total:8,part:'Core practice',text:'# Direct your first sidekick\n\nMake a checked comparison.\n\n## Try it\n'+Array.from({length:25},(_,i)=>(i+1)+'. Check a supplied fact.').join('\n')+'\n\n```text\nPreserve missing delivery as unknown.\n```',agentLabel:'Claude Code',workPath:'my-work/03-first-sidekick/lab',atEnd:false,lessons:[{label:'Choose your wish',current:false},{label:'Direct your first sidekick',current:true}]};
test('exercise instructions are visible immediately and controls stay in place while scrolling',()=>{const top=lessonFrame(model,{columns:80,rows:24},identity,wrap,0),next=lessonFrame(model,{columns:80,rows:24},identity,wrap,8);assert.ok(top.lines.some(l=>l.includes('Try it')));assert.deepEqual(top.lines.slice(-5,-1),next.lines.slice(-5,-1));assert.ok(next.top>top.top);assert.ok(top.lines.some(l=>l.includes('Enter  Work with Claude')));});
test('task layout fits small, normal and wide viewports in display cells',()=>{for(const [columns,rows]of [[40,16],[44,16],[80,24],[120,32]]){const f=lessonFrame(model,{columns,rows},identity,wrap);assert.ok(f.lines.length<=rows);assert.ok(f.lines.every(l=>width(l)<=columns));assert.ok(f.lines.some(l=>l.includes('q Quit')));}assert.ok(lessonFrame(model,{columns:120,rows:32},identity,wrap).lines.some(l=>l.includes('EXERCISES')));});
test('prompt content and Unicode graphemes survive reading layout',()=>{assert.equal(width('界'),2);assert.equal(width('👩‍💻'),2);const text='界'.repeat(30);assert.equal(wrap(text,20).join(''),text);assert.ok(wrap(text,20).every(l=>width(l)<=20));assert.ok(documentLines(model.text,76,wrap).some(l=>l.kind==='code'&&l.text.includes('Preserve missing delivery as unknown.')));});

test('scrolling reuses layout; resizing and changed content invalidate it',()=>{
 const {createDocumentLayout}=require('../workspace.cjs');const layout=createDocumentLayout();let calls=0;const measured=(...a)=>{calls++;return wrap(...a)};
 const a=lessonFrame(model,{columns:80,rows:24},identity,measured,0,null,layout);const first=calls;
 const b=lessonFrame(model,{columns:80,rows:24},identity,measured,8,null,layout);
 assert.equal(calls-first,1); // Only the short title is wrapped again.
 assert.ok(b.top>a.top);
 lessonFrame(model,{columns:44,rows:24},identity,measured,0,null,layout);assert.ok(calls>first+2);
 const old=layout(model.text,40,wrap);assert.notEqual(layout(model.text+'\nNew content',40,wrap),old);
});
