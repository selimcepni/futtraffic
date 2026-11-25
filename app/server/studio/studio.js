const $ = id => document.getElementById(id);
const angles = ['A','B'];
const feeds = {}, selected = new Set();
let db = JSON.parse(localStorage.getItem('saha.studio.v1') || '{"jobs":{},"pairs":{},"people":{}}');
let limit = 36, linked = false, calAngle, points = [];
function save(){localStorage.setItem('saha.studio.v1',JSON.stringify(db))}
function pair(){const key=JSON.stringify(angles.map(a=>db.jobs[a]||''));return db.pairs[key] ||= {map:{},primary:{},offset:null}}
function node(tag,text){const el=document.createElement(tag);if(text!=null)el.textContent=text;return el}
function note(text){$('message').textContent=text}
function option(text,value){return new Option(text,value)}
async function api(url,opts){const res=await fetch(url,opts);if(!res.ok)throw Error((await res.text()).slice(0,320)||res.statusText);return res.json()}
const base = a=>'/api/matches/'+encodeURIComponent(db.jobs[a]);
const time = t=>Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0');
function stop(){linked=false;angles.forEach(a=>feeds[a].v.pause())}
function selectedAngles(){return angles.filter(a => Boolean(db.jobs[a]))}
function ready(){if(!angles.every(a=>db.jobs[a]&&feeds[a].v.readyState>=1))throw Error('Önce iki videoyu seçip yüklenmelerini bekle.')}
function change(a,id){
 stop();note('');db.jobs[a]=id;save();selected.clear();const f=feeds[a];f.tracks=[];f.report={};f.digest=false;f.stats=false;f.busy=false;f.rev++;f.sel.value=id;
 if(id)f.v.src=base(a)+'/video';else f.v.removeAttribute('src');f.v.load();f.state.textContent='';render();if(id)refresh(a);
}
async function refresh(a){
 const id=db.jobs[a], f=feeds[a], rev=f.rev;if(!id||f.busy)return;f.busy=true;
 try{const st=await api(base(a));if(rev!==f.rev)return;f.state.textContent=st.error||({done:'Analiz tamamlandı',calibrating:'Analizi başlatmak için bu kameranın sahasını kalibre et.',queued:'Sırada',tracking:'Oyuncular izleniyor',failed:'İşlem başarısız'}[st.status]||st.status);
 if(st.status==='done'&&!f.stats){const [digest,report]=await Promise.all([api(base(a)+'/tracks'),api(base(a)+'/match.json')]);if(rev!==f.rev)return;f.tracks=digest.tracks;f.fps=digest.fps;f.report=report;f.stats=true;render()}
 }catch(e){if(rev===f.rev)f.state.textContent=e.message}finally{if(rev===f.rev)f.busy=false}
}
async function library(){const jobs=await api('/api/matches');for(const a of angles){const sel=feeds[a].sel;sel.replaceChildren(option('Kayıt seç',''));for(const j of jobs.filter(j=>j.upload_complete)){sel.add(option(j.name+' · '+j.id,j.id))}sel.value=db.jobs[a]||''}}
for(const a of angles){
 const panel=node('article'),head=node('div'),sel=node('select'),v=node('video'),pick=node('label','MP4 ekle'),file=node('input'),cal=node('button','Sahayı kalibre et'),state=node('output');
 head.className='head';pick.className='pick';file.type='file';file.accept='video/*';sel.setAttribute('aria-label','Kamera '+a+' kaydı');v.controls=true;v.preload='metadata';v.muted=a==='B';pick.append(file);head.append(node('strong','Kamera '+a),sel);panel.append(head,v,pick,cal,state);$('cameras').append(panel);
 feeds[a]={v,sel,state,tracks:[],report:{},rev:0};
 sel.onchange=()=>{if(sel.value&&sel.value===db.jobs[a==='A'?'B':'A']){sel.value=db.jobs[a]||'';return note('Her açı için farklı kayıt seç.')}change(a,sel.value)};
 file.onchange=async()=>{const x=file.files[0];if(!x)return;file.disabled=true;state.textContent='Yerel sunucuya aktarılıyor…';
 try{const job=await api('/api/matches?'+new URLSearchParams({name:x.name,total:x.size}),{method:'POST',body:x});await library();change(a,job.id)}
 catch(e){note(e.message)}finally{file.disabled=false;file.value=''}};
 cal.onclick=()=>{if(!db.jobs[a])return note('Önce bu kameranın kaydını seç.');calAngle=a;points=[];$('points').replaceChildren();$('calmsg').textContent='';$('frame').src=base(a)+'/frame.jpg?f=0';$('cal').showModal()};
 v.onended=stop;v.onpause=()=>{if(linked)stop()};
}
$('frame').onclick=e=>{const img=$('frame'),r=img.getBoundingClientRect();if(!img.naturalWidth)return;const row=node('div'),x=node('input'),y=node('input');x.type=y.type='number';x.step=y.step='any';x.placeholder='X (m)';y.placeholder='Y (m)';x.setAttribute('aria-label','X metre');y.setAttribute('aria-label','Y metre');const px=Math.round((e.clientX-r.left)*img.naturalWidth/r.width),py=Math.round((e.clientY-r.top)*img.naturalHeight/r.height);row.append(node('span',points.length+1+'. ('+px+', '+py+') '),x,y);$('points').append(row);points.push({px,py,x,y,row})};
$('undo').onclick=()=>points.pop()?.row.remove();
$('solve').onclick=async()=>{const a=calAngle;$('solve').disabled=true;try{
 const coords=points.map(p=>[p.px,p.py,p.x.valueAsNumber,p.y.valueAsNumber]);if(coords.length<4||coords.flat().some(v=>!Number.isFinite(v)))throw Error('En az dört noktanın X ve Y değerlerini doldur.');
 const data=await api('/api/studio/calibration',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({length:$('length').valueAsNumber,width:$('width').valueAsNumber,points:coords})});
 await api(base(a)+'/calibration',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});feeds[a].stats=false;feeds[a].report={};render();$('cal').close();await refresh(a);note('Kalibrasyon kaydedildi.');
 }catch(e){$('calmsg').textContent=e.message}finally{$('solve').disabled=false}};
$('anchor').onclick=()=>{try{ready();stop();pair().offset=feeds.B.v.currentTime-feeds.A.v.currentTime;save();render()}catch(e){note(e.message)}};
$('play').onclick=async()=>{try{
 const active=selectedAngles();
 if(active.length===1){
   note('');
   await feeds[active[0]].v.play();
   return;
 }
 ready();const off=pair().offset;if(off===null)throw Error('Her iki videoyu aynı pozisyonda durdurup bu iki anı eşleştir.');const lo=Math.max(0,-off),hi=Math.min(feeds.A.v.duration,feeds.B.v.duration-off);if(hi<=lo)throw Error('Ortak zaman aralığı bulunamadı.');let t=feeds.A.v.currentTime;if(t<lo||t>=hi)t=lo;feeds.A.v.currentTime=t;feeds.B.v.currentTime=t+off;await Promise.all(angles.map(a=>feeds[a].v.play()));linked=true}catch(e){stop();note(e.message)}};
$('pause').onclick=stop;
setInterval(()=>{if(!linked)return;const b=feeds.B.v,t=feeds.A.v.currentTime+pair().offset;if(t<0||t>=b.duration)return stop();if(Math.abs(b.currentTime-t)>.35)b.currentTime=t},450);
function rows(){return angles.flatMap(a=>feeds[a].tracks.map(t=>({a,t,key:a+'/'+t.id})))}
function seek(a,t){stop();feeds[a].v.currentTime=(t.f??t.first_f)/feeds[a].fps}
function render(){
 const p=pair(),all=rows(),active=selectedAngles();
 $('anchor').hidden=active.length!==2;
 $('offset').hidden=active.length!==2;
 $('play').disabled=active.length===0;
 $('pause').disabled=active.length===0;
 $('play').textContent=active.length===2?'Birlikte oynat':'Videoyu oynat';
 $('offset').textContent=p.offset===null?'Açılar henüz eşleşmedi':'B − A: '+p.offset.toFixed(2)+' sn';
 const names=Object.entries(db.people),person=$('person'),old=person.value;person.replaceChildren(option('Futbolcu seç',''));for(const [id,n] of names)person.add(option(n,id));person.value=old;
 const visible=all.filter(r=>(!$('filter').value||$('filter').value===r.a)&&(!$('free').checked||!p.map[r.key]));
 $('count').textContent=visible.length+' takip · '+selected.size+' seçili';$('cards').replaceChildren();$('more').hidden=visible.length<=limit;
 if(!visible.length)$('cards').append(node('p',all.length?'Bu filtrede takip yok.':'Analiz tamamlandığında oyuncu fotoğrafları burada görünür.'));
 for(const {a,t,key} of visible.slice(0,limit)){const c=node('article'),label=node('label'),check=node('input'),img=node('img'),go=node('button','Videoda göster');check.type='checkbox';check.checked=selected.has(key);check.onchange=()=>{if(check.checked)selected.add(key);else selected.delete(key);render()};label.append(check,' Kamera '+a+' · #'+t.id);img.loading='lazy';img.src=base(a)+'/crop/'+t.id+'.jpg';img.alt='Oyuncu #'+t.id;go.onclick=()=>seek(a,t);c.append(label,img,node('small',time(t.first_f/feeds[a].fps)+' – '+time(t.last_f/feeds[a].fps)),node('strong',db.people[p.map[key]]||'Atanmamış'),go);$('cards').append(c)}
 $('stats').replaceChildren();if(!names.length)$('stats').append(node('p','Kadroya bir futbolcu ekleyerek başla.'));
 for(const [id,name] of names){const assigned=all.filter(r=>p.map[r.key]===id),card=node('article');card.append(node('h3',name),node('small',assigned.length+' bağlı takip'));if(assigned.length){const sel=node('select');sel.setAttribute('aria-label',name+' ölçüm kaydı');for(const r of assigned)sel.add(option('Ölçüm: Kamera '+r.a+' · #'+r.t.id,r.key));const r=assigned.find(r=>r.key===p.primary[id])||assigned[0];sel.value=r.key;sel.onchange=()=>{p.primary[id]=sel.value;save();render()};card.append(sel);const rep=feeds[r.a].report,m=rep.players?.find(x=>x.id===r.t.id);if(m){const val=(v,u)=>Number.isFinite(v)?v.toLocaleString('tr-TR')+' '+u:'—';card.append(node('strong',val(m.distance_km,'km')),node('small','Gözlenen süre '+val(m.observed_minutes,'dk')+' · En yüksek hız '+val(m.top_speed_kmh,'km/sa')));const pts=rep.heatmaps?.[r.t.id],pitch=rep.meta?.pitch;if(pts?.length&&pitch){const canvas=node('canvas');canvas.width=240;canvas.height=135;canvas.setAttribute('aria-label','Seçilen takibin ısı haritası');const ctx=canvas.getContext('2d');ctx.fillStyle='#213e29';ctx.fillRect(0,0,240,135);ctx.fillStyle='rgba(203,255,113,.18)';for(const [x,y] of pts){ctx.fillRect(236*x/pitch.length,131*y/pitch.width,4,4)}card.append(canvas)}}else card.append(node('small','Bu takip için ölçüm yok.'))} $('stats').append(card)}
}
$('add').onsubmit=e=>{e.preventDefault();const n=$('name').value.trim();if(!n)return;const id=crypto.randomUUID();db.people[id]=n;save();render();$('person').value=id;$('name').value=''};
function assign(remove){if(!selected.size)return note('Önce takip kartlarını seç.');const id=$('person').value;if(!remove&&!id)return note('Kadrodan futbolcu seç.');for(const k of selected){if(remove)delete pair().map[k];else pair().map[k]=id}selected.clear();save();render();note('Atamalar kaydedildi.')}
$('assign').onclick=()=>assign(false);$('unassign').onclick=()=>assign(true);$('more').onclick=()=>{limit+=36;render()};$('filter').onchange=$('free').onchange=()=>{limit=36;render()};
async function start(){await library();const roster=await api("/api/players");for(const player of roster){if(player.name)db.people["club/"+player.id]=player.name}save();for(const a of angles)if(db.jobs[a])change(a,db.jobs[a]);render();setInterval(()=>angles.forEach(refresh),5000)}
start().catch(e=>note(e.message));
