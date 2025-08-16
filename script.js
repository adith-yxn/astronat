// Basic advanced AstroNat app.js — works locally and on GitHub Pages
const API = "https://api.spaceflightnewsapi.net/v4/articles/?limit=30&ordering=-published_at";
const AUTO_REFRESH_MS = 5 * 60 * 1000;

const el = {
  search: document.getElementById("search"),
  topic: document.getElementById("topic"),
  themeBtn: document.getElementById("themeBtn"),
  readerBtn: document.getElementById("readerBtn"),
  perfBtn: document.getElementById("perfBtn"),
  focusBtn: document.getElementById("focusBtn"),
  notifyBtn: document.getElementById("notifyBtn"),
  settingsBtn: document.getElementById("settingsBtn"),
  settings: document.getElementById("settings"),
  loadNow: document.getElementById("loadNow"),
  toggleAuto: document.getElementById("toggleAuto"),
  articleList: document.getElementById("articleList"),
  noArticles: document.getElementById("noArticles"),
  newsToday: document.getElementById("newsToday"),
  newsYesterday: document.getElementById("newsYesterday"),
  newsEarlier: document.getElementById("newsEarlier"),
  newsEmpty: document.getElementById("newsEmpty"),
  refreshBtn: document.getElementById("refreshBtn"),
  loadMore: document.getElementById("loadMore"),
  favList: document.getElementById("favList"),
  noFavs: document.getElementById("noFavs"),
  lastUpdated: document.getElementById("lastUpdated"),
  topBtn: document.getElementById("topBtn"),
  themeSelect: document.getElementById("themeSelect"),
  nightStart: document.getElementById("nightStart"),
  nightEnd: document.getElementById("nightEnd"),
  lowBandwidthInput: document.getElementById("lowBandwidth"),
  fontSize: document.getElementById("fontSize"),
  clearCache: document.getElementById("clearCache"),
  closeSettings: document.getElementById("closeSettings")
};

// 15 sample featured articles (concise, replaceable)
const featured = [
  {id:'a1',t:'Why the Moon’s South Pole Matters for ISRO',cat:'Moon',date:'2025-08-15',by:'Adithyan',body:'Water ice at polar craters could enable life support and in-situ propellant.'},
  {id:'a2',t:'Starship Heat Shield Lessons',cat:'SpaceX',date:'2025-08-16',by:'AstroNat',body:'Thermal protection at scale is central to reusability and Mars missions.'},
  {id:'a3',t:'JWST Sees Early Galaxies',cat:'Astronomy',date:'2025-08-16',by:'AstroNat',body:'Webb finds surprisingly mature galaxies in cosmic dawn.'},
  {id:'a4',t:'ISRO Small Launch Business',cat:'Business',date:'2025-08-16',by:'Adithyan',body:'Small launchers boost microsatellite economies.'},
  {id:'a5',t:'Satellites for Disaster Response',cat:'Satellites',date:'2025-08-16',by:'AstroNat',body:'SAR and thermal data nowcast disasters and save lives.'},
  {id:'a6',t:'Lunar Dust: Engineering Problem',cat:'Moon',date:'2025-08-16',by:'AstroNat',body:'Electrostatic dust threatens seals and optics—design must mitigate.'},
  {id:'a7',t:'Reusable Rockets and Insurance',cat:'Business',date:'2025-08-16',by:'AstroNat',body:'Telemetry-backed reuse reduces insurance costs over time.'},
  {id:'a8',t:'Mars Sample Handling Basics',cat:'Mars',date:'2025-08-16',by:'AstroNat',body:'Planetary protection requires sterile curation and traceability.'},
  {id:'a9',t:'Constellations vs Dark Skies',cat:'Astronomy',date:'2025-08-16',by:'AstroNat',body:'Cooperation and tech mitigations reduce constellation impact.'},
  {id:'a10',t:'Cryo Propellant Transfer',cat:'Deep Space',date:'2025-08-16',by:'AstroNat',body:'Boil-off and slosh pose engineering challenges for depots.'},
  {id:'a11',t:'Ground Station Automation',cat:'Satellites',date:'2025-08-16',by:'AstroNat',body:'Cloud-native scheduling enables global antenna networks.'},
  {id:'a12',t:'Cislunar Tug Economics',cat:'Deep Space',date:'2025-08-16',by:'AstroNat',body:'Tugs reduce repeated delta-v costs for lunar logistics.'},
  {id:'a13',t:'EDL in Thin Air',cat:'Mars',date:'2025-08-16',by:'AstroNat',body:'Retropropulsion + TRN enable heavier Mars landings.'},
  {id:'a14',t:'Rocket Test Telemetry',cat:'SpaceX',date:'2025-08-16',by:'AstroNat',body:'High-fidelity data shortens test-to-flight cycles.'},
  {id:'a15',t:'Space Careers: Build a Portfolio',cat:'Business',date:'2025-08-16',by:'Adithyan',body:'Projects and open-source work matter more than pedigree.'}
];

const LS_FAV = 'astronat_favs';

// small helpers
const esc = s => (s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt = d => (new Date(d)).toLocaleString();

// render featured
function renderFeatured(){
  const q = (el.search.value||'').toLowerCase();
  const topic = el.topic.value;
  const list = featured.filter(a=>{
    const inTopic = topic==='all' || a.cat === topic;
    const inText = !q || a.t.toLowerCase().includes(q) || a.body.toLowerCase().includes(q);
    return inTopic && inText;
  });
  el.articleList.innerHTML = list.map(a=>`
    <article class="card">
      <h4>${esc(a.t)}</h4>
      <p>${esc(a.body)}</p>
      <div class="meta"><span class="chip">${esc(a.cat)}</span><span class="muted">${a.date}</span><span class="muted">by ${esc(a.by)}</span></div>
      <div class="mt"><button class="fav-btn" data-id="${a.id}">☆ Save</button> <button class="open-btn" data-id="${a.id}">Read</button></div>
    </article>
  `).join('');
  el.noArticles.hidden = list.length>0;
  document.querySelectorAll('.fav-btn').forEach(b=> b.onclick = ()=> toggleFav(b.dataset.id));
  document.querySelectorAll('.open-btn').forEach(b=> b.onclick = ()=> openReaderById(b.dataset.id));
}

// favourites
function getFavs(){ try{ return JSON.parse(localStorage.getItem(LS_FAV)||'[]'); }catch(e){return [];}}
function setFavs(v){ localStorage.setItem(LS_FAV, JSON.stringify(v)); renderFavs(); }
function toggleFav(id){
  const favs = getFavs();
  if(favs.includes(id)) setFavs(favs.filter(x=>x!==id));
  else setFavs([...favs, id]);
}
function renderFavs(){
  const favs = getFavs();
  const items = featured.filter(a=> favs.includes(a.id));
  el.favList && (el.favList.innerHTML = items.map(a=>`
    <article class="card">
      <h4>${esc(a.t)}</h4><p>${esc(a.body)}</p>
      <div class="meta"><span class="chip">${esc(a.cat)}</span><span class="muted">${a.date}</span></div>
    </article>
  `).join(''));
  if(el.noFavs) el.noFavs.hidden = favs.length>0;
}

// reader
let readerNode = null;
function openReaderById(id){
  const a = featured.find(x=>x.id===id);
  if(!a) return;
  openReader(a.t, a.body + '\n\n— ' + a.by + ' • ' + a.date);
}
function openReader(title, content){
  if(readerNode) readerNode.remove();
  readerNode = document.createElement('div');
  readerNode.className = 'reader';
  readerNode.innerHTML = `<button class="close btn">Close</button><h2>${esc(title)}</h2><div class="reader-body"><p>${esc(content)}</p></div>`;
  document.body.appendChild(readerNode);
  readerNode.querySelector('.close').onclick = ()=> { readerNode.remove(); readerNode = null; };
}

// live news
async function loadNews(limit=24){
  try{
    el.newsToday.innerHTML = el.newsYesterday.innerHTML = el.newsEarlier.innerHTML = '';
    const res = await fetch(API, {cache:'no-store'});
    const data = await res.json();
    const items = data.results || [];
    const buckets = groupByDay(items);
    el.newsToday.innerHTML = buckets.today.map(n=>newsCard(n)).join('');
    el.newsYesterday.innerHTML = buckets.yesterday.map(n=>newsCard(n)).join('');
    el.newsEarlier.innerHTML = buckets.earlier.map(n=>newsCard(n)).join('');
    el.newsEmpty.hidden = items.length>0;
    el.lastUpdated.textContent = 'Last updated ' + new Date().toLocaleString();
    // wire open/save buttons
    document.querySelectorAll('.news-open').forEach(b=> b.onclick = ()=> window.open(b.dataset.url,'_blank'));
    document.querySelectorAll('.news-save').forEach(b=> b.onclick = ()=> {
      const id = b.dataset.id; const favs = getFavs();
      if(!favs.includes(id)) setFavs([...favs, id]);
    });
  }catch(e){
    console.error('news load failed', e);
    el.newsEmpty.hidden = false;
  }
}
function newsCard(n){
  const when = fmt(n.published_at);
  const id = 'n_'+(n.id || Math.random().toString(36).slice(2,9));
  return `<article class="card">
    <h4><a href="${n.url}" target="_blank" rel="noopener">${esc(n.title)}</a></h4>
    <p>${esc((n.summary||'').slice(0,160))}${n.summary && n.summary.length>160 ? '…' : ''}</p>
    <div class="meta"><span class="chip">${esc(n.news_site||'Source')}</span><span class="muted">${when}</span></div>
    <div class="mt"><button class="btn news-save" data-id="${id}">☆ Save</button> <button class="btn news-open" data-url="${n.url}">Open</button></div>
  </article>`;
}

function groupByDay(items){
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startYesterday = new Date(startToday); startYesterday.setDate(startToday.getDate()-1);
  const out = {today:[], yesterday:[], earlier:[]};
  items.forEach(it=>{
    const t = new Date(it.published_at);
    if(t >= startToday) out.today.push(it);
    else if(t >= startYesterday) out.yesterday.push(it);
    else out.earlier.push(it);
  });
  return out;
}

// small UI wiring
el.search && (el.search.oninput = renderFeatured);
el.topic && (el.topic.onchange = renderFeatured);
el.loadNow.onclick = ()=> loadNews();
el.refreshBtn.onclick = ()=> loadNews();
el.loadMore.onclick = ()=> { /* future paging */ alert('Load more will fetch more items.'); };

// theme toggle (simple)
el.themeBtn.onclick = () => {
  document.body.classList.toggle('light');
};

// perf toggle
el.perfBtn.onclick = () => {
  alert('Perf mode toggled (low-bandwidth).'); // placeholder
};

// focus toggle
el.focusBtn.onclick = () => {
  document.querySelector('header').classList.toggle('focus');
};

// notify (permission)
el.notifyBtn.onclick = () => {
  if(!('Notification' in window)) return alert('Notifications not supported');
  Notification.requestPermission().then(p => {
    if(p==='granted') alert('Notifications enabled. You will get headline alerts when available.');
  });
};

// settings panel
el.settingsBtn.onclick = () => openSettings();
el.closeSettings.onclick = () => closeSettings();
el.clearCache.onclick = ()=> { localStorage.clear(); caches && caches.keys && caches.keys().then(keys=> keys.forEach(k=> caches.delete(k))); alert('Cleared localStorage & caches'); renderFavs(); };

function openSettings(){
  el.settings.setAttribute('aria-hidden','false'); el.settings.style.display='block';
}
function closeSettings(){
  el.settings.setAttribute('aria-hidden','true'); el.settings.style.display='none';
}

// top button
window.addEventListener('scroll', ()=> { if(window.scrollY>300) el.topBtn.classList.add('show'); else el.topBtn.classList.remove('show'); });
el.topBtn.onclick = ()=> window.scrollTo({top:0, behavior:'smooth'});

// init
renderFeatured();
renderFavs();
loadNews();
setInterval(()=> loadNews(), AUTO_REFRESH_MS);

// register service worker (works only over http/https)
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=> {
    navigator.serviceWorker.register('./sw.js').then(r=> console.log('SW registered')).catch(e=> console.warn('SW fail', e));
  });
}
