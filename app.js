/* app.js — AstroNat advanced (works locally and on GitHub Pages) */

/* ========== Config ========== */
const NEWS_API = "https://api.spaceflightnewsapi.net/v4/articles/?limit=36&ordering=-published_at";
const AUTO_REFRESH_MS = 5 * 60 * 1000; // 5 minutes

/* ========== Elements ========== */
const els = {
  q: document.getElementById("q"),
  category: document.getElementById("category"),
  sort: document.getElementById("sort"),
  themeBtn: document.getElementById("themeBtn"),
  readerBtn: document.getElementById("readerBtn"),
  loadNews: document.getElementById("loadNews"),
  toggleAuto: document.getElementById("toggleAuto"),
  refreshNews: document.getElementById("refreshNews"),
  loadMoreNews: document.getElementById("loadMoreNews"),
  articlesWrap: document.getElementById("articles"),
  noArticles: document.getElementById("noArticles"),
  newsToday: document.getElementById("newsToday"),
  newsYesterday: document.getElementById("newsYesterday"),
  newsEarlier: document.getElementById("newsEarlier"),
  newsEmpty: document.getElementById("newsEmpty"),
  lastUpdated: document.getElementById("lastUpdated"),
  favList: document.getElementById("favList"),
  noFavs: document.getElementById("noFavs"),
  topBtn: document.getElementById("top")
};

/* ========== 20 Featured Articles ========== */
const featured = [
  {id:'F1', title:"Why the Moon’s South Pole Matters for ISRO", category:"Moon", date:"2025-08-15", author:"Adithyan",
   body:"Water ice in permanently shadowed regions could enable life support and in-situ propellant production. This turns the Moon from a one-off scientific target into a potential logistics node. ISRO's focus on polar prospecting combines precision landing with advanced orbital relay, paving the way for robotic and crewed operations."},

  {id:'F2', title:"Starship’s Heat-Shield Lessons", category:"SpaceX", date:"2025-08-16", author:"AstroNat",
   body:"Large reusable vehicles require robust thermal protection. Starship's tests emphasize tile adhesion, inspection workflows, and operational repairability—lessons that reduce turnaround time and mission risk for crewed interplanetary flights."},

  {id:'F3', title:"JWST Finds Galaxies Earlier Than Expected", category:"Astronomy", date:"2025-08-16", author:"AstroNat",
   body:"JWST's infrared spectra show mature elements within galaxies formed very early, forcing cosmologists to re-evaluate early star-formation efficiency and feedback models."},

  {id:'F4', title:"ISRO’s Small Launchers Fuel Startups", category:"Business", date:"2025-08-16", author:"Adithyan",
   body:"Affordable, frequent small-launch services let Earth-observation startups iterate quickly, aligning product cycles to payload readiness rather than years-long waits."},

  {id:'F5', title:"How Satellites Nowcast Disasters", category:"Satellites", date:"2025-08-16", author:"AstroNat",
   body:"SAR, thermal, and GNSS reflectometry merged with AI deliver faster flood and wildfire warnings—precise data that saves lives and resources."},

  {id:'F6', title:"Lunar Dust: The Hidden Threat", category:"Moon", date:"2025-08-16", author:"AstroNat",
   body:"Electrostatic lunar dust clings to seals and optics; habitat designers now prioritize multi-stage airlocks, dust-shedding coatings, and redundant sealing strategies."},

  {id:'F7', title:"Reusable Rockets and Insurance", category:"Business", date:"2025-08-16", author:"AstroNat",
   body:"Insurers price launches differently when vehicles are reusable—telemetry-driven refurbishment records help lower premiums when operators prove consistent processes."},

  {id:'F8', title:"Mars Sample Handling: Protocols and Practice", category:"Mars", date:"2025-08-16", author:"AstroNat",
   body:"Planetary protection systems and sterile curation facilities ensure scientific fidelity while safeguarding both Earth and Mars from cross-contamination."},

  {id:'F9', title:"Mega-Constellations vs Astronomers", category:"Astronomy", date:"2025-08-16", author:"AstroNat",
   body:"Darker coatings, sun-angle planning, and operator-observatory coordination are reducing the visual impact of megaconstellations on telescopes."},

  {id:'F10', title:"Cryogenic Transfer: Depot Challenges", category:"Deep Space", date:"2025-08-16", author:"AstroNat",
   body:"Active cooling, autogenous pressurization, and precise chill-down are needed to make cryogenic depots feasible for long-duration missions."},

  {id:'F11', title:"Ground Stations Go Cloud-Native", category:"Satellites", date:"2025-08-16", author:"AstroNat",
   body:"Phased arrays and cloud-based scheduling allow small teams to operate global antenna fleets, democratizing mission operations."},

  {id:'F12', title:"Cislunar Tugs: Economy of Movement", category:"Deep Space", date:"2025-08-16", author:"AstroNat",
   body:"Reusable tugs move cargo efficiently between LEO, NRHO, and the lunar surface, reducing the cumulative cost of transport."},

  {id:'F13', title:"Build vs Buy Avionics for Startups", category:"Business", date:"2025-08-16", author:"AstroNat",
   body:"A hybrid strategy—COTS core plus custom FDIR—balances speed-to-orbit with tailored mission requirements."},

  {id:'F14', title:"Space Weather: Power Grid Risk Mitigation", category:"Astronomy", date:"2025-08-16", author:"AstroNat",
   body:"Early CME warnings allow grid operators to reduce load or reconfigure systems to prevent transformer damage during severe solar storms."},

  {id:'F15', title:"ISRO’s Deep Space Network Enhancements", category:"ISRO", date:"2025-08-16", author:"AstroNat",
   body:"Smarter scheduling and increased EIRP expand mission support without proportionally increasing ground hardware."},

  {id:'F16', title:"Thermal Blankets: Design Matters", category:"Satellites", date:"2025-08-16", author:"AstroNat",
   body:"Edge treatments and penetrations in MLI often determine real-world performance more than bulk layer count."},

  {id:'F17', title:"NRHO: Gateway's Preferred Orbit", category:"Moon", date:"2025-08-16", author:"AstroNat",
   body:"Near-rectilinear halo orbits offer long line-of-sight to Earth and lunar poles with manageable stationkeeping."},

  {id:'F18', title:"EDL Techniques for Heavy Mars Landers", category:"Mars", date:"2025-08-16", author:"AstroNat",
   body:"Supersonic retropropulsion and terrain-relative navigation together expand landing mass capability on Mars."},

  {id:'F19', title:"What Rocket Test Data Tells Engineers", category:"SpaceX", date:"2025-08-16", author:"AstroNat",
   body:"Injector stability, transient response, and cooling margins are among the telemetry metrics that reduce flight risk."},

  {id:'F20', title:"From Hobby to Space Career", category:"Business", date:"2025-08-16", author:"Adithyan",
   body:"Hands-on projects, open-source contributions, and smallsat kits build portfolios that employers in space actively seek."}
];

/* ========== Utils ========== */
const esc = s => (s||'').toString().replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmtDate = d => new Date(d).toLocaleDateString();

/* ========== Favorites (localStorage) ========== */
const FAVS_KEY = 'astronat_favs';
function getFavs(){ try{return JSON.parse(localStorage.getItem(FAVS_KEY)||'[]'); }catch(e){return [];} }
function setFavs(arr){ localStorage.setItem(FAVS_KEY, JSON.stringify(arr)); renderFavs(); }

function toggleFav(id){
  const f = getFavs();
  if(f.includes(id)) setFavs(f.filter(x=>x!==id));
  else setFavs([...f, id]);
}

/* ========== Render featured articles ========== */
function renderFeatured(){
  const q = (els.q && els.q.value || '').toLowerCase().trim();
  const cat = (els.category && els.category.value) || 'all';
  const order = (els.sort && els.sort.value) || 'new';
  let list = featured.slice();
  if(cat !== 'all') list = list.filter(a=> a.category === cat);
  if(q) list = list.filter(a=> (a.title + ' ' + a.body + ' ' + a.author).toLowerCase().includes(q));
  list.sort((a,b)=> order==='new' ? new Date(b.date)-new Date(a.date) : new Date(a.date)-new Date(b.date));
  if(els.articlesWrap) els.articlesWrap.innerHTML = list.map(a => `
    <article class="card">
      <h4>${esc(a.title)}</h4>
      <p>${esc(a.body.slice(0,180))}${a.body.length>180? '…':''}</p>
      <div class="meta"><span class="chip">${esc(a.category)}</span><span class="muted">${esc(a.date)}</span><span class="muted">by ${esc(a.author)}</span></div>
      <div class="mt"><button class="btn save" data-id="${a.id}">☆ Save</button> <button class="btn read" data-id="${a.id}">Read</button></div>
    </article>
  `).join('');
  if(els.noArticles) els.noArticles.hidden = (list.length>0);
  // wire buttons
  document.querySelectorAll('.save').forEach(b=> b.onclick = ()=> toggleFav(b.dataset.id));
  document.querySelectorAll('.read').forEach(b=> b.onclick = ()=> openReaderById(b.dataset.id));
}

/* ========== Render favorites ========== */
function renderFavs(){
  const favs = getFavs();
  if(!els.favList) return;
  if(favs.length===0){
    els.favList.innerHTML = '';
    if(els.noFavs) els.noFavs.hidden = false;
    return;
  }
  if(els.noFavs) els.noFavs.hidden = true;
  const items = featured.filter(a=> favs.includes(a.id));
  els.favList.innerHTML = items.map(a=>`
    <article class="card">
      <h4>${esc(a.title)}</h4>
      <p>${esc(a.body.slice(0,160))}${a.body.length>160? '…':''}</p>
      <div class="meta"><span class="chip">${esc(a.category)}</span><span class="muted">${esc(a.date)}</span></div>
    </article>
  `).join('');
}

/* ========== Reader mode ========== */
let readerEl = null;
function openReaderById(id){
  const art = featured.find(a=>a.id===id);
  if(!art) return;
  openReader(art.title, art.body + "\n\n— " + art.author + " • " + art.date);
}
function openReader(title, body){
  if(readerEl){ readerEl.remove(); readerEl = null; }
  readerEl = document.createElement('div');
  readerEl.className = 'reader';
  readerEl.innerHTML = `<button class="close btn">Close</button><h2>${esc(title)}</h2><div class="reader-body"><p>${esc(body)}</p></div>`;
  document.body.appendChild(readerEl);
  readerEl.querySelector('.close').onclick = ()=> { readerEl.remove(); readerEl=null; };
}

/* ========== Live news ========== */
async function fetchLive(limit=24){
  try{
    const res = await fetch(NEWS_API + "&limit=" + limit, { cache: 'no-store' });
    const json = await res.json();
    const items = json.results || [];
    return items;
  }catch(err){
    console.warn("Live fetch failed:", err);
    return null;
  }
}
function newsCard(n){
  const when = new Date(n.published_at).toLocaleString();
  return `<article class="card">
    <h4><a href="${n.url}" target="_blank" rel="noopener">${esc(n.title)}</a></h4>
    <p>${esc((n.summary||'').slice(0,160))}${n.summary && n.summary.length>160 ? '…' : ''}</p>
    <div class="meta"><span class="chip">${esc(n.news_site||'Source')}</span><span class="muted">${when}</span></div>
    <div class="mt"><button class="btn save-news" data-title="${esc(n.title)}" data-url="${esc(n.url)}">☆ Save</button></div>
  </article>`;
}
function groupByDay(items){
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startYesterday = new Date(startToday); startYesterday.setDate(startToday.getDate()-1);
  const b = {today:[], yesterday:[], earlier:[]};
  items.forEach(x=>{
    const t = new Date(x.published_at);
    if(t >= startToday) b.today.push(x);
    else if(t >= startYesterday) b.yesterday.push(x);
    else b.earlier.push(x);
  });
  return b;
}
async function loadLive(limit=24){
  const items = await fetchLive(limit);
  if(!items){
    if(els.newsEmpty) els.newsEmpty.hidden = false;
    return;
  }
  const buckets = groupByDay(items);
  if(els.newsToday) els.newsToday.innerHTML = buckets.today.map(newsCard).join('');
  if(els.newsYesterday) els.newsYesterday.innerHTML = buckets.yesterday.map(newsCard).join('');
  if(els.newsEarlier) els.newsEarlier.innerHTML = buckets.earlier.map(newsCard).join('');
  if(els.newsEmpty) els.newsEmpty.hidden = (items.length>0);
  if(els.lastUpdated) els.lastUpdated.textContent = "Last updated " + new Date().toLocaleString();
  // wire save-news buttons
  document.querySelectorAll('.save-news').forEach(b=>{
    b.onclick = ()=>{
      const id = 'N_' + b.dataset.title.slice(0,30).replace(/\s+/g,'_');
      const favs = getFavs();
      if(!favs.includes(id)) setFavs([...favs, id]);
      localStorage.setItem('SN_'+id, JSON.stringify({title:b.dataset.title, url:b.dataset.url}));
    };
  });
}

/* ========== UI wiring ========== */
if(els.q) els.q.oninput = renderFeatured;
if(els.category) els.category.onchange = renderFeatured;
if(els.sort) els.sort.onchange = renderFeatured;

if(document.getElementById('themeBtn')) document.getElementById('themeBtn').onclick = ()=>{
  if(document.body.classList.contains('theme-light')){ document.body.classList.remove('theme-light'); document.body.classList.add('theme-sepia'); }
  else if(document.body.classList.contains('theme-sepia')){ document.body.classList.remove('theme-sepia'); }
  else document.body.classList.add('theme-light');
};

if(document.getElementById('readerBtn')) document.getElementById('readerBtn').onclick = ()=> {
  openReader("Reader mode", "Open a featured article by clicking Read to enter distraction-free view.");
};

if(els.loadNews) els.loadNews.onclick = ()=> loadLive();
if(els.refreshNews) els.refreshNews.onclick = ()=> loadLive();
if(els.loadMoreNews) els.loadMoreNews.onclick = ()=> loadLive(48);

if(els.toggleAuto) els.toggleAuto.onclick = function(){
  this.textContent = this.textContent.includes('ON') ? 'Auto-refresh: OFF' : 'Auto-refresh: ON';
  autoRefresh = !autoRefresh;
};

let autoRefresh = true;
setInterval(()=> { if(autoRefresh) loadLive(); }, AUTO_REFRESH_MS);

/* top button */
window.addEventListener('scroll', ()=> {
  if(window.scrollY > 400) els.topBtn.classList.add('show'); else els.topBtn.classList.remove('show');
});
if(els.topBtn) els.topBtn.onclick = ()=> window.scrollTo({top:0, behavior:'smooth'});

/* initial render */
renderFeatured();
renderFavs();
loadLive();

/* graceful fallback: featured articles are always available */
