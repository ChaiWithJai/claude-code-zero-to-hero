import os,pty,fcntl,termios,struct,subprocess,select,time,shutil,tempfile,re,json,atexit,signal
from pathlib import Path
source=Path(__file__).resolve().parents[2]
base=Path(tempfile.mkdtemp(prefix='course-terminal-'))
shutil.copytree(source,base/'repo',ignore=shutil.ignore_patterns('.git','.local','my-work','node_modules'))
processes=[]
def cleanup():
 for p in processes:
  if p.poll() is None:p.kill();p.wait()
 shutil.rmtree(base,ignore_errors=True)
atexit.register(cleanup)
root=base/'repo'; env=dict(os.environ,TERM='xterm-256color',NO_COLOR='1')
node=shutil.which('node')
assert node, 'Node is required'
class Terminal:
 def __init__(self,args=[],rows=24,cols=80):
  self.master,self.slave=pty.openpty();self.original=termios.tcgetattr(self.slave);self.resize(rows,cols)
  self.p=subprocess.Popen([node,'go']+args,cwd=root,stdin=self.slave,stdout=self.slave,stderr=self.slave,env=env,start_new_session=True);processes.append(self.p);self.raw='';self.last=''
 def resize(self,rows,cols):fcntl.ioctl(self.slave,termios.TIOCSWINSZ,struct.pack('HHHH',rows,cols,0,0))
 def read(self):
  if select.select([self.master],[],[],.05)[0]:
   try:self.raw+=os.read(self.master,65536).decode(errors='replace')
   except OSError:pass
  self.last=re.sub(r'\x1b\[[0-?]*[ -/]*[@-~]','',self.raw.split('\x1b[H\x1b[2J')[-1])
  return self.last
 def expect(self,text):
  until=time.time()+5
  while time.time()<until:
   if text in self.read():return self.last
  raise AssertionError(f'Missing {text!r} in {self.last!r}')
 def send(self,s):os.write(self.master,s.encode())
 def choose(self,n):self.send(str(n)+'\r')
 def close(self):
  if self.p.poll() is None:self.send('\x03')
  self.p.wait(timeout=5);after=termios.tcgetattr(self.slave)
  assert after[3]&termios.ICANON and after[3]&termios.ECHO, 'Terminal mode was not restored'
  assert '\x1b[?1049l' in self.raw or '--plain' in self.p.args
  os.close(self.master);os.close(self.slave)
results=[]
t=Terminal();t.expect('How are you learning?');t.send('\x1b[B\r');t.expect('Choose an exercise');t.send('\x1b[F\r');screen=t.expect('Finish this path');assert 'Next lab' not in screen;assert '# ' not in screen;assert screen.count('Choose your next seven days')==1
# Reader and back navigation do not append repeated lessons.
t.choose(5);t.expect('More options');t.choose(1);t.expect('A hint');t.send('\x1b');t.expect('Finish this path');t.choose(4);t.expect('Save my place and exit');t.choose(2);t.expect('Finish this path');t.send('q');t.p.wait(timeout=5);t.read();t.close();results.append('Signature last exercise: End selection, hint/back, finish/stay, quit and terminal restoration')
# Different exercise, a narrow reader, and a fake agent that never calls a model.
subprocess.run([node,'go','--path','live','--lab','03'],cwd=root,stdout=subprocess.DEVNULL,check=True)
bin=base/'bin';bin.mkdir();fake=bin/'claude';fake.write_text('#!/bin/sh\nprintf "TEST AGENT READY\\n"\nread line\nexit 0\n');fake.chmod(0o755)
env['PATH']=str(bin)+':'+env['PATH']
t=Terminal(['--lab','03','--path','live']);t.expect('Direct your first sidekick');t.choose(1);t.expect('Try it');t.send(' ');t.expect('Starting prompt');t.raw='';t.resize(16,44);os.kill(t.p.pid,signal.SIGWINCH);t.send('\x1b[F');screen=t.expect('↑↓/Space');assert all(len(x)<=40 for x in screen.splitlines() if x),'Reader overflow at narrow width: '+repr(screen);t.send('q');t.resize(24,80);os.kill(t.p.pid,signal.SIGWINCH);t.expect('What would you like to do?');t.choose(2);t.expect('TEST AGENT READY');t.send('done\n');screen=t.expect('Back from Claude Code');assert 'Direct your first sidekick' in screen;assert '## Try it' not in screen;t.send('\x03');t.p.wait(timeout=5);t.read();t.close();results.append('Live lab 03: complete paged instructions, 44-column reader, fake agent handoff/return, Ctrl+C restoration')
# Plain mode has no screen-control sequences and does not dump the lesson on every action.
t=Terminal(['--plain']);t.expect('Welcome back');t.raw='';t.send('1\n');t.expect('What would you like to do?');t.expect('> ');t.raw='';t.send('3\n');t.expect('Create outputs/comparison.csv');t.expect('q. Quit');t.expect('> ');t.send('q\n');
try:t.p.wait(timeout=2)
except subprocess.TimeoutExpired:
 t.read();print(repr(t.raw));t.p.kill();raise
t.read();assert '\x1b' not in t.raw;t.close();results.append('Plain mode: numeric selection, failed-check recovery, no ANSI escapes and clean exit')
report={'passed':results,'model_calls':0,'root':'isolated temporary fixture','scope':'Real PTYs on macOS; fake Claude process only. No user work or account state used.'}
print(json.dumps(report,indent=2));shutil.rmtree(base)
