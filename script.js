const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = s => document.querySelector(s);
// intro focus pull
requestAnimationFrame(() => setTimeout(() => document.body.classList.remove('loading'), reduce ? 0 : 250));
// clock
const clk = $('#clock'); const tick = () => clk.textContent = new Date().toTimeString().slice(0, 8); tick(); setInterval(tick, 1000);
// film roll placeholders
const roll = $('#roll'); for (let i = 1; i <= 8; i++) { const d = document.createElement('div'); d.className = 'shot'; d.textContent = `[Photo ${i}]`; roll.appendChild(d); }
// exposure settings per mode
const exp = { home:['400','1/125','2.8'], music:['800','1/60','1.8'], photo:['100','1/250','8'], gaming:['1600','1/30','2.0'], food:['200','1/100','4'], contact:['400','1/125','2.8'] };
const focus = $('#focus');
function refocus(){ if (reduce) return; document.body.classList.add('refocus'); setTimeout(()=>document.body.classList.remove('refocus'),180); focus.classList.remove('lock'); void focus.offsetWidth; focus.classList.add('lock'); }
function go(m){
  document.querySelectorAll('.mode').forEach(s => s.classList.toggle('active', s.dataset.mode === m));
  document.querySelectorAll('.dial button').forEach(b => b.classList.toggle('on', b.dataset.go === m));
  const [i,s,a] = exp[m]; $('#iso').textContent=i; $('#sh').textContent=s; $('#ap').textContent=a;
  refocus(); history.replaceState(null,'', m==='home' ? location.pathname : '#'+m);
}
document.querySelectorAll('.dial button').forEach(b => b.addEventListener('click', () => go(b.dataset.go)));
const start = location.hash.slice(1); if (exp[start]) go(start);
// focus brackets follow pointer
if (!reduce) addEventListener('pointermove', e => { focus.style.left = e.clientX+'px'; focus.style.top = e.clientY+'px'; });
// shutter: flash + click sound
let shots = 0, actx;
function click(){ try{ actx = actx || new (window.AudioContext||window.webkitAudioContext)(); const n = actx.sampleRate*.05, buf = actx.createBuffer(1,n,actx.sampleRate), d = buf.getChannelData(0);
  for(let i=0;i<n;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/n,4); const src=actx.createBufferSource(); src.buffer=buf; const g=actx.createGain(); g.gain.value=.35; src.connect(g).connect(actx.destination); src.start(); }catch(e){} }
function shoot(){ shots++; $('#shots').textContent = String(shots).padStart(3,'0'); click(); if (reduce) return; const f=$('#flash'); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); refocus(); }
$('#shoot').addEventListener('click', shoot);
addEventListener('keydown', e => { if (e.code === 'Space' && e.target === document.body) { e.preventDefault(); shoot(); } });
