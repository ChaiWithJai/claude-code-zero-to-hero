"""Exercise actual terminal I/O without accounts, user work or paid model calls."""
import atexit,codecs,fcntl,json,os,pty,re,select,shutil,signal,struct,subprocess,tempfile,termios,time,unicodedata
from pathlib import Path
source=Path(__file__).resolve().parents[2]
base=Path(tempfile.mkdtemp(prefix='course-terminal-'))
shutil.copytree(source,base/'repo',ignore=shutil.ignore_patterns('.git','.local','my-work','node_modules'))
root=base/'repo';node=shutil.which('node');processes=[]
env=dict(os.environ,TERM='xterm-256color',NO_COLOR='1')
def cleanup():
 for p in processes:
  if p.poll() is None:p.kill();p.wait()
 shutil.rmtree(base,ignore_errors=True)
atexit.register(cleanup)
class Terminal:
 def __init__(self,args=(),rows=24,cols=80):
  self.master,self.slave=pty.openpty();self.resize(rows,cols)
  self.p=subprocess.Popen([node,'go',*args],cwd=root,stdin=self.slave,stdout=self.slave,stderr=self.slave,env=env,start_new_session=True)
  processes.append(self.p);self.raw='';self.decoder=codecs.getincrementaldecoder('utf-8')('replace')
 def resize(self,rows,cols):
  self.rows,self.cols=rows,cols
  fcntl.ioctl(self.slave,termios.TIOCSWINSZ,struct.pack('HHHH',rows,cols,0,0))
  if hasattr(self,'p'):os.kill(self.p.pid,signal.SIGWINCH)
 def read(self):
  if select.select([self.master],[],[],.04)[0]:
   try:self.raw+=self.decoder.decode(os.read(self.master,65536))
   except OSError:pass
  # A bounded VT screen model: cursor addressing, erasure and line wrapping.
  grid=[[' ']*self.cols for _ in range(self.rows)];r=c=0;i=0
  while i<len(self.raw):
   ch=self.raw[i]
   if ch=='\x1b':
    m=re.match(r'\x1b\[([0-?]*)([ -/]*)([@-~])',self.raw[i:])
    if not m:break
    args,_,op=m.groups();i+=len(m[0]);nums=[int(n or '0') for n in args.split(';')] if not args.startswith('?') else []
    if op in ['H','f']:r=max(0,(nums[0] or 1)-1);c=max(0,(nums[1] if len(nums)>1 else 1)-1)
    elif op=='J' and args=='2':grid=[[' ']*self.cols for _ in range(self.rows)]
    elif op=='K' and r<self.rows:
     for col in range(c,self.cols):grid[r][col]=' '
    elif op=='h' and args=='?1049':grid=[[' ']*self.cols for _ in range(self.rows)];r=c=0
    continue
   i+=1
   if ch=='\r':c=0;continue
   if ch=='\n':r+=1;continue
   if ord(ch)<32:continue
   if c>=self.cols:r+=1;c=0
   if r>=self.rows:grid.pop(0);grid.append([' ']*self.cols);r=self.rows-1
   grid[r][c]=ch;c+=2 if unicodedata.east_asian_width(ch) in ['W','F'] else 1
  return '\n'.join(''.join(row).rstrip() for row in grid)
 def expect(self,text):
  until=time.time()+5;screen=''
  while time.time()<until:
   screen=self.read()
   if text in screen:return screen
  raise AssertionError(f'Missing {text!r} in {screen!r}')
 def send(self,s):os.write(self.master,s.encode())
 def choose(self,n):self.send(str(n)+'\r')
 def close(self):
  until=time.time()+5
  while self.p.poll() is None and time.time()<until:self.read()
  assert self.p.poll() is not None,'Process did not exit: '+self.read()
  self.read();mode=termios.tcgetattr(self.slave)
  assert mode[3]&termios.ICANON and mode[3]&termios.ECHO,'Terminal mode was not restored'
  os.close(self.master);os.close(self.slave)
bin=base/'bin';bin.mkdir();fake=bin/'claude';fake.write_text('#!/bin/sh\nprintf "TEST AGENT READY\\n"\nread line\nexit 0\n');fake.chmod(0o755);env['PATH']=str(bin)+':'+env['PATH']
results=[]
t=Terminal();t.expect('How are you learning?');t.send('\x1b[B\r');t.expect('Choose an exercise');t.send('\x1b[F');t.expect('Leave with an honest');assert not (root/'.local/progress.json').exists(),'Preview changed course progress';t.send('\r');screen=t.expect('Finish this path');assert 'Next lab' not in screen;assert 'Try it' in screen
# Scroll without clearing the screen, then visit help and return to the same place.
old=len(t.raw);t.send(' ');screen=t.expect('Keep');assert '\x1b[2J' not in t.raw[old:];assert '\x1b[?2026h' in t.raw[old:];line=re.search(r'Lines [^\n]+',screen)[0]
t.send('?');t.expect('More options');t.choose(1);t.expect('A hint');t.send('\x1b');screen=t.expect('Finish this path');assert line in screen,'Reading position lost after hint'
t.send('n');t.expect('Save my place and exit');t.choose(2);t.expect('Finish this path');t.send('q');t.close();results.append('Signature final exercise: preview without mutation, task visible on entry, incremental synchronized rendering, hint/return preserves position, finish/stay and clean quit')
# Default restart resumes directly, without a second Continue/Read menu.
t=Terminal();t.expect('Try it');assert 'Welcome back' not in t.read();t.send('q');t.close()
# A distinct exercise and a stand-in agent exercise the actual process handoff.
t=Terminal(['--lab','03','--path','live']);t.expect('Try it');original=(root/'.local/progress.json').read_bytes();t.send('\x1b[200~n\nc\n\x1b[201~');t.expect('Paste task text into');assert (root/'.local/progress.json').read_bytes()==original;t.send(' ');screen=t.expect('Starting prompt');before=(root/'.local/progress.json').read_bytes();t.send('l');t.expect('Choose an exercise');t.send('\x1b[200~wish\x1b[201~');t.expect('Choose a meaningful wish');assert (root/'.local/progress.json').read_bytes()==before;t.send('\x1b');t.expect('Starting prompt');t.resize(16,44);t.expect('Enter Work');t.resize(24,80);t.expect('Enter  Work');t.send('\r');t.expect('TEST AGENT READY');t.send('done\n');screen=t.expect('Back from Claude Code');assert 'Direct your first sidekick' in screen;t.send('\x03');t.close();results.append('Live lab 03: task-first direct jump, searchable/pasted previews without progress mutation, paste cannot execute controls, resize, fake-agent handoff/return and Ctrl+C restoration')
# The older numbered interface remains available with no ANSI controls.
t=Terminal(['--plain']);t.expect('Welcome back');t.raw='';t.send('1\n');t.expect('What would you like to do?');t.expect('>');t.raw='';t.send('3\n');t.expect('Create outputs/comparison.csv');t.expect('q. Quit');t.expect('>');t.send('q\n');t.close();assert '\x1b' not in t.raw;results.append('Plain mode: numeric selection, failed-check recovery, no ANSI escapes and clean exit')
print(json.dumps({'passed':results,'model_calls':0,'scope':'Real macOS/Linux PTYs in an isolated fixture. Fake Claude only.'},indent=2))
