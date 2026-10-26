(function(){
const root=document.getElementById('spotify'); if(!root) return;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ago=iso=>{const s=(Date.now()-new Date(iso))/1000;if(!(s>=0))return '';const u=[[31536e3,'year'],[2592e3,'month'],[86400,'day'],[3600,'hour'],[60,'minute']];for(const[n,l]of u){const v=Math.floor(s/n);if(v>=1)return v+' '+l+(v>1?'s':'')+' ago'}return 'just now'};
const safeUrl=u=>/^https:\/\//.test(u||'')?u:null;
const row=(t,sub,img,url)=>{const art=safeUrl(img)?`<img src="${esc(img)}" alt="" loading="lazy">`:'<span class="art"></span>';const name=safeUrl(url)?`<a class="inl" href="${esc(url)}" target="_blank" rel="noopener">${esc(t)}</a>`:esc(t);return `<li>${art}<div><div>${name}</div>${sub?`<div class="sub">${esc(sub)}</div>`:''}</div></li>`};
const empty=()=>{root.innerHTML='<p class="muted">Listening stats aren’t available yet.</p>'};
fetch('data/spotify.json?t='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject()).then(d=>{
  const rp=d.recently_played||[],ta=d.top_artists||[],tt=d.top_tracks||[];
  if(!rp.length&&!ta.length&&!tt.length&&!d.now_playing) return empty();
  let h='';
  if(d.now_playing){const n=d.now_playing;h+=`<h3>Now playing</h3><ul class="tracks">${row(n.name,(n.artists||[]).join(', '),n.image,n.url)}</ul>`}
  if(rp.length)h+=`<h3>Recently played</h3><ul class="tracks">${rp.map(t=>row(t.name,(t.artists||[]).join(', ')+(t.played_at?' · '+ago(t.played_at):''),t.image,t.url)).join('')}</ul>`;
  if(ta.length)h+=`<h3>Top artists this month</h3><ul class="tracks round">${ta.map((a,i)=>row(a.name,'#'+(i+1),a.image,a.url)).join('')}</ul>`;
  if(tt.length)h+=`<h3>Top tracks this month</h3><ul class="tracks">${tt.map((t,i)=>row(t.name,'#'+(i+1)+' · '+(t.artists||[]).join(', '),t.image,t.url)).join('')}</ul>`;
  if(d.updated_at)h+=`<p class="muted upd">Updated ${esc(ago(d.updated_at))}</p>`;
  root.innerHTML=h;
}).catch(empty);
})();
