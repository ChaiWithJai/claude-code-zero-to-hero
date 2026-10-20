'use strict';
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const PARTS = ['lab', 'homework', 'extension'];
const PATHS = ['live', 'signature'];
function createWorkshop(root) {
  root = fs.realpathSync(root);
  const data = JSON.parse(fs.readFileSync(path.join(root, '.course/catalog.json'), 'utf8'));
  function labById(id) {
    const lab = data.labs.find(l => l.id === id || l.slug === id);
    if (!lab) throw new Error('Choose a lab number from the list.');
    return lab;
  }
  function route(key) {
    if (!PATHS.includes(key)) throw new Error('Choose live or signature.');
    return data.paths[key];
  }
  // Destinations are fixed beneath this checkout. Never follow a learner-created symlink.
  function safe(relative) {
    const target = path.resolve(root, relative);
    if (!target.startsWith(root + path.sep)) throw new Error('Work must stay inside this checkout.');
    let current = root;
    for (const segment of path.relative(root, target).split(path.sep)) {
      current = path.join(current, segment);
      try { if (fs.lstatSync(current).isSymbolicLink()) throw new Error('This work path contains a symbolic link. Use an ordinary folder: ' + path.relative(root, current)); }
      catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
    return target;
  }
  function ensureDir(relative) {
    const target = safe(relative);
    fs.mkdirSync(target, { recursive: true });
    return target;
  }
  function copyMissing(from, to) {
    safe(path.relative(root, to));
    fs.mkdirSync(to, { recursive: true });
    for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) throw new Error('A source file is a symbolic link.');
      const src = path.join(from, entry.name), dst = path.join(to, entry.name);
      safe(path.relative(root, dst));
      if (entry.isDirectory()) copyMissing(src, dst);
      else {
        try { fs.writeFileSync(dst, fs.readFileSync(src), { flag: 'wx' }); }
        catch (error) { if (error.code !== 'EEXIST') throw error; }
      }
    }
  }
  function state() {
    const file = safe('.local/progress.json');
    try {
      const x = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (!x || typeof x !== 'object' || !PATHS.includes(x.path) || !PARTS.includes(x.part) || !data.labs.some(l => l.id === x.lab)) return null;
      return { path: x.path, lab: x.lab, part: x.part };
    } catch (error) {
      if (error.code !== 'ENOENT' && !(error instanceof SyntaxError)) throw error;
      return null;
    }
  }
  function save(selection) {
    route(selection.path); labById(selection.lab);
    if (!PARTS.includes(selection.part)) throw new Error('Choose lab, homework, or extension.');
    ensureDir('.local');
    const file = safe('.local/progress.json');
    fs.writeFileSync(file, JSON.stringify(selection, null, 2) + '\n');
  }
  function prepare(id, part = 'lab', pathKey = 'live', agent = 'claude') {
    const lab = labById(id); route(pathKey);
    if (!['claude','codex'].includes(agent)) throw new Error('Choose claude or codex.');
    if (!PARTS.includes(part)) throw new Error('Choose lab, homework, or extension.');
    const source = path.join(root, 'labs', lab.slug, part);
    const relative = path.join('my-work', lab.slug, part);
    const dir = ensureDir(relative);
    copyMissing(source, dir);
    copyMissing(path.join(root, 'labs', lab.slug, 'inputs'), path.join(dir, 'inputs'));
    ensureDir(path.join(relative, 'outputs'));
    if (agent === 'codex') {
      const instructions = safe(path.join(relative, 'AGENTS.md'));
      try { fs.writeFileSync(instructions, fs.readFileSync(path.join(dir, 'CLAUDE.md'), 'utf8'), {flag:'wx'}); }
      catch (error) { if (error.code !== 'EEXIST') throw error; }
    }
    const selection = { path: pathKey, lab: lab.id, part };
    save(selection);
    return { ...selection, labData: lab, dir, relative };
  }
  function read(id, name = 'lab/INSTRUCTIONS.md') {
    const lab = labById(id);
    if (!['lab/INSTRUCTIONS.md','homework/INSTRUCTIONS.md','extension/INSTRUCTIONS.md','HINTS.md','EXAMPLE.md'].includes(name)) throw new Error('Unknown reading.');
    return fs.readFileSync(path.join(root, 'labs', lab.slug, name), 'utf8');
  }
  function check(id, part = 'lab') {
    const lab = labById(id);
    if (!PARTS.includes(part)) throw new Error('Unknown part.');
    const dir = safe(path.join('my-work', lab.slug, part));
    if (!fs.existsSync(dir)) return { ok: false, messages: ['Open this activity first to create your workspace.'] };
    if (lab.id === '03' && part === 'lab' || lab.id === '04' && part === 'lab') {
      const file = safe(path.join('my-work', lab.slug, part, 'outputs/comparison.csv'));
      if (!fs.existsSync(file)) return { ok: false, messages: ['Create outputs/comparison.csv, then check again.'] };
      return checkComparison(fs.readFileSync(file, 'utf8'));
    }
    const file = safe(path.join('my-work', lab.slug, part, 'outputs/NOTES.md'));
    if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8').trim().length < 30)
      return { ok: false, messages: ['Keep your attempt and evidence in outputs/NOTES.md (at least a few specific sentences).'] };
    return { ok: true, messages: ['Your notes are present. This checks the file, not the quality of your reasoning.', ...lab.review.map(x => 'Review: ' + x)] };
  }
  function launchAgent(dir, agent = 'claude', run = cp.spawnSync) {
    if (!['claude','codex'].includes(agent)) throw new Error('Choose claude or codex.');
    const label = agent === 'codex' ? 'Codex' : 'Claude Code';
    safe(path.relative(root, dir));
    // No shell interpolation: task text and account information are never passed as command strings.
    const options = { cwd: dir, stdio: 'inherit' };
    let result;
    if (process.platform === 'win32') {
      // Windows npm/native installers may expose a .cmd shim. Its fixed filename is the only shell command.
      result = run('cmd.exe', ['/d', '/s', '/c', agent], options);
    } else result = run(agent, [], options);
    if (result.error || result.status !== 0) return label + ' did not start or exited with an error. Your work is saved. Use SETUP.md or continue with the supplied examples.';
    return 'Back from ' + label + '. Inspect your outputs before continuing.';
  }
  function launchClaude(dir) { return launchAgent(dir); }
  return { data, root, labById, route, state, save, prepare, read, check, launchClaude, launchAgent, safe };
}
// RFC-style quoted cells, CRLF, and quoted newlines; errors are reported as recovery instructions.
function parseCSV(text) {
  text = text.replace(/^\uFEFF/, '');
  const rows = []; let row = [], cell = '', quoted = false, closed = false;
  for (let i=0; i<text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i+1] === '"') { cell += '"'; i++; }
      else if (c === '"') { quoted = false; closed = true; }
      else cell += c;
    } else if (c === '"') {
      if (cell !== '' || closed) throw new Error('Unexpected quote in a CSV cell.');
      quoted = true;
    } else if (c === ',') { row.push(cell); cell = ''; closed = false; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i+1] === '\n') i++;
      row.push(cell); if (row.some(x => x.trim() !== '')) rows.push(row);
      row=[];cell='';closed=false;
    } else {
      if (closed && c.trim()) throw new Error('Unexpected text after a quoted cell.');
      if (!closed) cell += c;
    }
  }
  if (quoted) throw new Error('A quoted CSV cell is not closed.');
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows;
}
function checkComparison(text) {
  const messages=[];
  let rows;
  try { rows=parseCSV(text); } catch (e) { return { ok:false,messages:[e.message+' Ask your sidekick to write a valid CSV and try again.'] }; }
  const headers=['option','price_usd','width_cm','warranty_years','delivery_days','source_id','meets_width_limit','unknowns'];
  if (!rows.length || headers.some(h=>!rows[0].map(x=>x.trim().toLowerCase()).includes(h)))
    return { ok:false,messages:['Use the eight column names given in the lab instructions.'] };
  const head=rows.shift().map(x=>x.trim().toLowerCase());
  if(new Set(head).size!==head.length)return {ok:false,messages:['Each column needs a unique name.']};
  const expected={cedar:[180,100,1,'unknown','DESK-A','yes'],harbor:[240,120,3,'7','DESK-B','no'],birch:[280,95,2,'14','DESK-C','yes']};
  const seen=new Set();
  for(const cells of rows){
    if(cells.length!==head.length){messages.push('A row has a different number of cells from the header.');continue;}
    const r=Object.fromEntries(head.map((h,i)=>[h,cells[i].trim()]));const name=r.option.toLowerCase();const ex=expected[name];
    if(!ex){messages.push('Use only the three supplied options.');continue;}
    if(seen.has(name))messages.push('Each option should appear once.');seen.add(name);
    ['price_usd','width_cm','warranty_years'].forEach((h,i)=>{if(Number(r[h])!==ex[i])messages.push(r.option+': check '+h+' against the source card.');});
    if(r.delivery_days.toLowerCase()!==ex[3])messages.push(r.option+': preserve the supplied delivery value or unknown.');
    if(r.source_id.toUpperCase()!==ex[4])messages.push(r.option+': check the source ID.');
    if(r.meets_width_limit.toLowerCase()!==ex[5])messages.push(r.option+': check the 105 cm width limit.');
    if(name==='cedar'&&!r.unknowns.toLowerCase().includes('delivery'))messages.push('Cedar: name the missing delivery information.');
  }
  if(seen.size!==3||rows.length!==3)messages.push('Include exactly one row for each of the three options.');
  return { ok:messages.length===0,messages:messages.length?messages:['The supplied facts and width constraint match.','Now explain two source checks and your decision in outputs/NOTES.md. This check does not grade that explanation.'] };
}
module.exports={createWorkshop,parseCSV,checkComparison,PARTS,PATHS};
