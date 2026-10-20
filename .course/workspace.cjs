'use strict';
const segmenter = new Intl.Segmenter(undefined, {granularity: 'grapheme'});
const ansi = /\x1b\[[0-?]*[ -/]*[@-~]/g;
function width(text) {
  let n = 0;
  for (const {segment} of segmenter.segment(String(text).replace(ansi, ''))) {
    const cp = segment.codePointAt(0);
    if (/^\p{Mark}+$/u.test(segment)) continue;
    n += /[\p{Extended_Pictographic}\p{Regional_Indicator}\ufe0f]/u.test(segment) || cp >= 0x1100 && (cp <= 0x115f || cp >= 0x2329 && cp <= 0x232a || cp >= 0x2e80 && cp <= 0xa4cf || cp >= 0xac00 && cp <= 0xd7a3 || cp >= 0xf900 && cp <= 0xfaff || cp >= 0xfe10 && cp <= 0xfe6f || cp >= 0xff01 && cp <= 0xff60 || cp >= 0xffe0 && cp <= 0xffe6 || cp >= 0x20000) ? 2 : 1;
  }
  return n;
}
function clip(text, columns) {
  if (width(text) <= columns) return text;
  let out = '', used = 0;
  for (const {segment} of segmenter.segment(String(text))) {
    const cells = width(segment);
    if (used + cells > columns - 1) break;
    out += segment; used += cells;
  }
  return out + '…';
}
function fill(text, columns) { return text + ' '.repeat(Math.max(0, columns - width(text))); }
// Preserve all exercise text, but give headings and code distinct reading roles.
function documentLines(raw, columns, wrap) {
  let code = false, firstTitle = true;
  const lines = [];
  for (let [sourceLine,line] of raw.split('\n').entries()) {
    if (line.startsWith('```')) { code = !code; continue; }
    if (/^# /.test(line) && firstTitle) { firstTitle = false; continue; }
    const heading = !code && /^#{1,6} /.test(line);
    if (heading) line = line.replace(/^#{1,6} /, '');
    for (const part of wrap(line, Math.max(12, columns - (code ? 2 : 0))))
      lines.push({text: (code ? '  ' : '') + part, kind: heading ? 'heading' : code ? 'code' : 'text', sourceLine});
  }
  while (lines[0]?.text === '') lines.shift();
  return lines;
}
function createDocumentLayout() {
  let cachedText, cachedWidth, cachedDocument;
  return (text, columns, wrap) => {
    if (text !== cachedText || columns !== cachedWidth) {
      cachedDocument = documentLines(text, columns, wrap);
      cachedText = text; cachedWidth = columns;
    }
    return cachedDocument;
  };
}
function lessonFrame(model, {columns, rows}, style, wrap, requestedTop = 0, anchor = null, layout = null) {
  const w = Math.max(18, columns - 4), h = Math.max(5, rows - 2);
  if (columns < 40 || rows < 14) return {lines: ['Course workspace', '', clip('Enlarge this window or use node go --plain.', w), '', 'q quit'], top: 0, page: 1};
  const wide = columns >= 112, rail = wide ? 27 : 0, contentWidth = Math.min(86, w - rail);
  const document = layout ? layout(model.text, contentWidth, wrap) : documentLines(model.text, contentWidth, wrap);
  const title = wrap(model.title, contentWidth);
  const header = [style.dim('CLAUDE CODE ZERO TO HERO'), style.dim(clip(model.pathLabel + '  /  ' + model.position + ' of ' + model.total + '  /  ' + model.part,contentWidth)), ...title.map(style.bold), ''];
  const footerCount = 5;
  const page = Math.max(1, h - header.length - footerCount);
  const anchorIndex=anchor===null?-1:document.findIndex(l=>l.sourceLine===anchor);
  if(anchorIndex>=0)requestedTop=anchorIndex;
  const top = Math.max(0, Math.min(requestedTop, Math.max(0, document.length - page)));
  const content = document.slice(top, top + page).map(l => l.kind === 'heading' ? style.accent(l.text) : l.kind === 'code' ? style.dim(l.text) : l.text);
  while (content.length < page) content.push('');
  let lines = [...header, ...content];
  if (wide) {
    const sidebar = [style.dim('EXERCISES'), '', ...model.lessons.map(l => (l.current ? style.accent(clip('› ' + l.label, rail - 3)) : style.dim('  ' + clip(l.label, rail - 5))))];
    lines = lines.map((line, i) => fill(sidebar[i] || '', rail - 3) + style.dim('│ ') + line);
  }
  const action = w < 70 ? 'Enter Work · c Check · n '+(model.atEnd?'Finish':'Next') : 'Enter  Work with ' + model.agentLabel + '    c  Check    n  ' + (model.atEnd ? 'Finish this path' : 'Next');
  const help = w < 70 ? '↑↓/Space · l List · ? Help · q Quit' : '↑↓ scroll  Space page  l Exercises  ? Help  q Quit';
  lines.push(style.dim('─'.repeat(w)), (w<70?clip(action,w):style.bold('Enter  Work with '+model.agentLabel)+action.slice(('Enter  Work with '+model.agentLabel).length)), clip(help, w), style.dim(clip(model.notice || 'Work: ' + model.workPath, w)), style.dim('Lines ' + (top + 1) + '–' + Math.min(top + page, document.length) + ' of ' + document.length));
  return {lines, top, page, sourceLine:document[top]?.sourceLine};
}
function graphemes(text) { return [...segmenter.segment(text)].map(s => s.segment); }
module.exports = {createDocumentLayout, width, clip, fill, documentLines, lessonFrame, graphemes};
