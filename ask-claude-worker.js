const MODEL = "claude-haiku-4-5";
const DEEP_MODELS = ["claude-opus-5-5", "claude-opus-4-5", "claude-sonnet-4-5"];
const SYSTEM = "You answer on a tiny heads-up display in smart glasses, so the answer must be glanceable, not a paragraph. Reply with ONLY one compact JSON object and nothing else: {\"big\": optional key figure of 6 characters or fewer when the answer is mainly a number, time, price or temperature (for example 75° or 9 PM or $300), \"h\": the direct answer as a headline of 8 words or fewer, \"p\": up to 3 short points of 9 words or fewer each (steps, reasons or exact words to say), \"more\": optional extra detail of 50 words or fewer, only when it truly adds something}. Plain words, no markdown. If he asks for exact wording, put the words to say in p. You can search the web: use it for current facts, prices, news, businesses and research. You cannot see his email, calendar, school portal, files or any private account or record from here, but his cloud agent can. So if answering needs any of those, or needs a full sweep, do not explain and do not refuse: reply with exactly ROUTE_TASK and nothing else, and the request is handed to that agent automatically.";
const PAGE = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="application-name" content="Ask Claude">
<title>Ask Claude</title>
<style>
*{box-sizing:border-box;margin:0}
html,body{inline-size:100%;block-size:100%;background:#000;color:#fff;font-family:-apple-system,"SF Pro Display",system-ui,Roboto,sans-serif;-webkit-font-smoothing:antialiased;overflow:hidden}
#app{block-size:100%;display:flex;flex-direction:column;padding:7% 7% 6%}
.top{display:flex;align-items:center;justify-content:space-between;block-size:2.2rem;flex:none}
.mark{display:flex;align-items:center;gap:.55em;font-size:1rem;letter-spacing:.22em;text-transform:uppercase;color:#C9CDD3;font-weight:600}
.mark i{inline-size:.6em;block-size:.6em;border-radius:50%;background:#E8A07A;display:block}
.tr{display:flex;gap:.6em;align-items:center}
.tr button{font-size:.95rem;padding:.5em .95em}
.echo{font-size:1.05rem;color:#8A9099;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-inline-size:100%}
.mid{flex:1;min-block-size:0;display:flex;flex-direction:column;justify-content:center}
h1{font-size:2.9rem;font-weight:600;letter-spacing:-.02em;line-height:1.05}
.sub{font-size:1.2rem;color:#8A9099;margin-top:.5em}
.chips{display:flex;gap:3%;margin-top:1.6rem}
#ans{flex:1;min-block-size:0;overflow:hidden;font-size:2rem;line-height:1.28;font-weight:500;letter-spacing:-.01em;margin-top:1.1rem;border-top:1px solid #2A2E35;padding-top:1.1rem}
#card{flex:1;min-block-size:0;overflow:hidden;display:flex;flex-direction:column;justify-content:center;gap:.85em;border-top:1px solid #2A2E35;margin-top:1.1rem;padding-top:.9rem;font-size:calc(1rem*var(--k,1))}
#big{font-size:4.4em;font-weight:700;color:#E8A07A;letter-spacing:-.03em;line-height:1}
#hd{font-size:2.2em;font-weight:700;line-height:1.12;letter-spacing:-.02em}
#pts{list-style:none;padding:0;display:flex;flex-direction:column;gap:.6em}
#pts li{display:flex;gap:.7em;font-size:1.45em;line-height:1.25;color:#E3E6EA;align-items:flex-start}
#pts li i{flex:none;inline-size:1.55em;block-size:1.55em;border-radius:50%;border:1.5px solid #E8A07A;color:#E8A07A;font-style:normal;font-size:.7em;font-weight:700;display:flex;align-items:center;justify-content:center;margin-top:.16em}
.bar{display:flex;gap:3%;align-items:center;flex:none;margin-top:.9rem}
#nav button{padding:.5em 1.1em}
.dots{flex:1;display:flex;gap:.5em;align-items:center}
.dots b{inline-size:.55em;block-size:.55em;border-radius:50%;background:#3A3F47;display:block}
.dots b.on{background:#E8A07A}
input{flex:1;min-inline-size:0;font:inherit;font-size:1.25rem;color:#fff;background:#0D0F12;border:1.5px solid #2F343C;border-radius:999px;padding:.7em 1.1em}
input::placeholder{color:#6B717A}
button{font:inherit;font-size:1.15rem;font-weight:600;color:#fff;background:#14171B;border:1.5px solid #2F343C;border-radius:999px;padding:.7em 1.15em;white-space:nowrap}
.chips{gap:2.5%}
.chips button{flex:1;font-size:1rem;padding:.75em .2em;color:#D7DADF}
button.pri{background:#E8A07A;border-color:#E8A07A;color:#17110D}
input:focus,button:focus{outline:none;border-color:#fff;box-shadow:0 0 0 3px rgba(255,255,255,.28)}
.pulse{inline-size:1.1rem;block-size:1.1rem;border-radius:50%;background:#E8A07A;animation:p 1.1s ease-in-out infinite;margin-bottom:1.4rem}
@keyframes p{0%,100%{transform:scale(.6);opacity:.45}50%{transform:scale(1.25);opacity:1}}
[hidden]{display:none!important}
</style></head><body>
<div id="app">
  <div class="top"><div class="mark" id="mark"><i></i>Claude</div><div class="echo" id="echo" hidden></div><div class="tr"><button id="res" type="button" hidden></button><button id="snd" type="button">Voice on</button></div></div>
  <div class="mid" id="home">
    <h1>Ask anything.</h1>
    <div class="sub">Just ask. Say think for a deeper answer.</div>
    <div class="chips"><button type="button" data-q="What is my next step?">Next step</button><button type="button" data-q="What is my opening line at the door?">Opener</button><button type="button" data-q="Think: based on everything you know about me and today, what is the single most valuable thing I should do next, and why?">Think</button><button type="button" id="diveb">Dive</button></div>
  </div>
  <div class="mid" id="busy" hidden><div class="pulse"></div><h1 id="busyt">Thinking</h1><div class="sub" id="busyq"></div></div>
  <div id="card" hidden><div id="big"></div><div id="hd"></div><ol id="pts"></ol></div>
  <div id="ans" hidden></div>
  <div class="bar" id="nav" hidden><div class="dots" id="dots"></div><button type="button" id="prev">Back</button><button type="button" id="next">Next</button></div>
  <form class="bar" id="ask"><input id="q" type="text" placeholder="Your question" autocomplete="off"><button class="pri" id="go" type="submit">Ask</button></form>
</div>
<script>
const $=id=>document.getElementById(id);
const q=$("q"),ans=$("ans"),card=$("card");
function esc(t){ return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;"); }
let busy=false,pages=[],pi=0,hist=[],last=0;
function show(s){
  $("home").hidden=s!=="home"; $("busy").hidden=s!=="busy"; ans.hidden=s!=="ans"; if(s!=="ans") card.hidden=true;
  $("ask").hidden=s==="busy"; if(s!=="ans") $("nav").hidden=true;
  q.placeholder=s==="ans"?"Ask a follow-up":"Your question";
  $("mark").hidden=s==="ans"; $("echo").hidden=s!=="ans"; if(s!=="home") $("res").hidden=true; $("snd").hidden=s!=="home";
}
function paginate(text){
  const words=String(text).replace(/\\s+/g," ").trim().split(" "); const out=[]; let cur=[];
  for(const w of words){ cur.push(w); ans.textContent=cur.join(" ");
    if(ans.scrollHeight>ans.clientHeight+1&&cur.length>1){ cur.pop(); out.push(cur.join(" ")); cur=[w]; } }
  if(cur.length) out.push(cur.join(" "));
  return out;
}
let voice=true; try{ voice=localStorage.getItem("voice")!=="off"; }catch(e){}
function hush(){ try{ if("speechSynthesis" in window) window.speechSynthesis.cancel(); }catch(e){} }
function say(t){
  hush(); if(!voice||!t) return;
  try{
    if(!("speechSynthesis" in window)||!("SpeechSynthesisUtterance" in window)) return;
    const u=new SpeechSynthesisUtterance(String(t).slice(0,600)); u.lang="en-US"; u.rate=1.05; window.speechSynthesis.speak(u);
  }catch(e){}
}
function sndLabel(){ $("snd").textContent=voice?"Voice on":"Voice off"; }
function fitCard(){
  let k=1; card.style.setProperty("--k",k);
  while(card.scrollHeight>card.clientHeight+1&&k>0.62){ k-=0.06; card.style.setProperty("--k",k); }
}
function draw(){
  const pg=pages[pi], isCard=pg&&typeof pg==="object";
  card.hidden=!isCard; ans.hidden=isCard;
  if(isCard){
    $("big").textContent=pg.big||""; $("big").hidden=!pg.big; $("hd").textContent=pg.h;
    $("pts").innerHTML=(pg.p||[]).map((t,i)=>"<li><i>"+(i+1)+"</i><span>"+esc(t)+"</span></li>").join(""); $("pts").hidden=!(pg.p&&pg.p.length);
  } else ans.textContent=pg||"";
  const many=pages.length>1;
  $("dots").innerHTML=many?pages.map((_,i)=>"<b"+(i===pi?" class=on":"")+"></b>").join(""):"";
  $("prev").hidden=!many||pi===0; $("next").hidden=!many||pi===pages.length-1;
  $("next").textContent=(isCard&&many)?"More":"Next";
  if(isCard) fitCard();
  (!$("next").hidden?$("next"):q).focus();
}
function answer(question,text,v){
  $("echo").textContent=question; q.value=""; show("ans");
  if(v&&v.h){
    $("nav").hidden=!v.more; card.hidden=true; ans.hidden=false;
    pages=[v].concat(v.more?paginate(v.more):[]);
  } else {
    $("nav").hidden=true; pages=paginate(text);
    if(pages.length>1){ $("nav").hidden=false; pages=paginate(text); }
  }
  pi=0; draw();
  say(v&&v.h?[v.big,v.h].filter(Boolean).join(". ")+". "+(v.p||[]).join(". "):text);
  try{ if(!history.state||history.state.s!=="ans") history.pushState({s:"ans"},""); }catch(e){}
}
function home(){ hush(); show("home"); q.value=""; q.focus(); checkResults(); }
async function send(text){
  if(busy) return; busy=true; hush();
  const isTask=/^\\s*(task|sweep|full sweep|run a)/i.test(text), isDeep=/^\\s*(think|deep|research|plan)\\b/i.test(text);
  if(Date.now()-last>600000) hist=[];
  $("busyt").textContent=isTask?"Sending":(isDeep?"Thinking deeper":"Thinking"); $("busyq").textContent=text; show("busy");
  let out,vis=null;
  try{
    const r=await fetch("ask",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({q:text,h:hist})});
    const d=await r.json(); out=d.a||("Problem: "+(d.error||r.status)); vis=d.v||null;
    if(d.a&&!isTask&&!d.routed){ hist.push({q:text,a:d.a}); hist=hist.slice(-3); last=Date.now(); }
  }catch(e){ out="Could not reach Claude. Check the connection and try again."; }
  busy=false; answer(text,out,vis);
}
$("ask").addEventListener("submit",e=>{e.preventDefault(); const t=q.value.trim(); if(t) send(t);});
q.addEventListener("change",()=>{const t=q.value.trim(); if(t) send(t);});
document.querySelectorAll(".chips button[data-q]").forEach(b=>b.addEventListener("click",()=>send(b.dataset.q)));
$("diveb").addEventListener("click",()=>{ hush(); location.href="dive"; });
$("next").addEventListener("click",()=>{ if(pi<pages.length-1){pi++;draw();} });
$("prev").addEventListener("click",()=>{ if(pi>0){pi--;draw();} });
window.addEventListener("popstate",()=>{ if(!busy) home(); });
$("snd").addEventListener("click",()=>{ voice=!voice; try{ localStorage.setItem("voice",voice?"on":"off"); }catch(e){} sndLabel(); if(voice) say("Voice is on."); else hush(); });
sndLabel();
let pending=[];
async function checkResults(){
  try{
    let seen=""; try{ seen=localStorage.getItem("seen")||""; }catch(e){}
    const r=await fetch("results?after="+encodeURIComponent(seen)); pending=await r.json();
    const b=$("res"); if(pending.length&&!$("home").hidden){ b.textContent=pending.length+(pending.length>1?" results":" result"); b.hidden=false; } else b.hidden=true;
  }catch(e){}
}
$("res").addEventListener("click",()=>{
  if(!pending.length) return; const r=pending[pending.length-1];
  try{ localStorage.setItem("seen",r.t); }catch(e){}
  answer(r.q||"Task result",r.a||"",r.v||null);
});
try{ history.replaceState({s:"home"},""); }catch(e){}
home();
</script></body></html>`;


// ---------- Dive Report: live conditions for Honeymoon Cove, same rules as the Kelpline planner ----------
const COMPASS = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
const compass = (d) => (d === null || d === undefined) ? "" : COMPASS[Math.floor(((d % 360) + 360) % 360 / 22.5 + 0.5) % 16];
const fmtH = (h) => { let hh = Math.floor(h), mm = Math.round((h - hh) * 60); if (mm === 60) { hh += 1; mm = 0; } const ap = hh < 12 ? "AM" : "PM"; return ((hh % 12) || 12) + ":" + String(mm).padStart(2, "0") + " " + ap; };
async function diveBuoys() {
  const out = [];
  for (const [id, name] of [["46221", "Santa Monica Bay"], ["46222", "San Pedro"]]) {
    try {
      const r = await fetch("https://www.ndbc.noaa.gov/data/realtime2/" + id + ".txt", { headers: { "User-Agent": "Kelpline/1.0" } });
      if (!r.ok) continue;
      const lines = (await r.text()).split("\n");
      const hdr = lines[0].replace(/^#/, "").trim().split(/\s+/);
      for (const ln of lines.slice(2, 8)) {
        const p = ln.trim().split(/\s+/); const v = {}; hdr.forEach((k, i) => v[k] = p[i]);
        if (!v.WVHT || v.WVHT === "MM") continue;
        out.push({ id, name, waveFt: Math.round(parseFloat(v.WVHT) * 3.281 * 10) / 10, waterF: (v.WTMP && v.WTMP !== "MM") ? Math.round(parseFloat(v.WTMP) * 9 / 5 + 32) : null });
        break;
      }
    } catch (e) {}
  }
  return out;
}

function laKey(d) { // "YYYY-MM-DDTHH:00" in Pacific time
  const p = {}; new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" }).formatToParts(d).forEach(x => p[x.type] = x.value);
  return p.year + "-" + p.month + "-" + p.day + "T" + p.hour + ":00";
}
function sunTimes(D) { // sunrise and sunset as local decimal hours, same formula as the Kelpline planner
  const lat = 33.78, lon = -118.41, noon = new Date(Date.UTC(D.getFullYear(), D.getMonth(), D.getDate(), 20));
  const off = (parseInt(laKey(noon).slice(11, 13), 10) - noon.getUTCHours());
  const n = Math.floor((Date.UTC(D.getFullYear(), D.getMonth(), D.getDate()) - Date.UTC(D.getFullYear(), 0, 0)) / 86400000), g = 2 * Math.PI / 365 * (n - 1);
  const eq = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  const R = Math.PI / 180, ha = Math.acos(Math.cos(90.833 * R) / (Math.cos(lat * R) * Math.cos(decl)) - Math.tan(lat * R) * Math.tan(decl)) / R;
  return [(720 - 4 * (lon + ha) - eq) / 60 + off, (720 - 4 * (lon - ha) - eq) / 60 + off];
}
async function nwsWeather() { // backup weather source, shaped like the Open-Meteo response
  const r = await fetch("https://api.weather.gov/gridpoints/LOX/147,33", { headers: { "User-Agent": "Kelpline/1.0 (personal dive planner)", "Accept": "application/geo+json" } });
  if (!r.ok) throw new Error("NWS " + r.status);
  const p = (await r.json()).properties;
  const expand = (key) => { const out = {}; for (const v of ((p[key] || {}).values || [])) {
    const [start, dur] = v.validTime.split("/"); const t0 = new Date(start); const m = /P(?:(\d+)D)?T?(?:(\d+)H)?/.exec(dur) || [];
    const n = (parseInt(m[1] || "0", 10) * 24 + parseInt(m[2] || "0", 10)) || 1;
    for (let i = 0; i < n; i++) out[laKey(new Date(t0.getTime() + i * 3600000))] = [v.value, n];
  } return out; };
  const ws = expand("windSpeed"), wdd = expand("windDirection"), qp = expand("quantitativePrecipitation"), pop = expand("probabilityOfPrecipitation");
  const hours = Object.keys(ws).sort(), days = [...new Set(hours.map(h => h.slice(0, 10)))].sort();
  const daily = { time: days, precipitation_sum: [], precipitation_probability_max: [], wind_speed_10m_max: [], sunrise: [], sunset: [] };
  for (const d of days) { const hs = hours.filter(h => h.slice(0, 10) === d);
    daily.wind_speed_10m_max.push(Math.max(...hs.map(h => (ws[h][0] || 0) / 1.609)));
    daily.precipitation_sum.push(hs.reduce((a, h) => a + (qp[h] ? (qp[h][0] || 0) / qp[h][1] : 0), 0) / 25.4);
    daily.precipitation_probability_max.push(Math.max(...hs.map(h => pop[h] ? (pop[h][0] || 0) : 0)));
    daily.sunrise.push(null); daily.sunset.push(null); }
  return { daily, hourly: { time: hours, wind_speed_10m: hours.map(h => (ws[h][0] || 0) / 1.609), wind_direction_10m: hours.map(h => wdd[h] ? (wdd[h][0] || 0) : 0) }, source: "NWS" };
}
async function diveData(env) {
  if (env.KV) { const c = await env.KV.get("dive", "json"); if (c && Date.now() - c.ts < 30 * 60 * 1000) return c; }
  try { return await diveFresh(env); }
  catch (e) { const last = env.KV ? await env.KV.get("dive_last", "json") : null; if (last) return { ...last, stale: true }; throw e; }
}
async function diveFresh(env) {
  const J = async (u) => { const r = await fetch(u, { headers: { "User-Agent": "Kelpline/1.0" } }); if (!r.ok) throw new Error("fetch " + r.status); return r.json(); };
  const LAT = 33.78, LON = -118.43;
  const nowLA = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
  const today = new Date(nowLA.getFullYear(), nowLA.getMonth(), nowLA.getDate());
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const iso = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const b = iso(today).replace(/-/g, ""), e = iso(addDays(today, 7)).replace(/-/g, "");
  const [mar, wx, hl, B] = await Promise.all([
    J("https://marine-api.open-meteo.com/v1/marine?latitude=" + LAT + "&longitude=" + LON + "&daily=swell_wave_height_max,swell_wave_period_max,swell_wave_direction_dominant,sea_surface_temperature_max&timezone=America%2FLos_Angeles&forecast_days=10&length_unit=imperial&temperature_unit=fahrenheit").catch(() => null),
    J("https://api.open-meteo.com/v1/forecast?latitude=" + LAT + "&longitude=-118.41&daily=precipitation_sum,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset&hourly=wind_speed_10m,wind_direction_10m&timezone=America%2FLos_Angeles&forecast_days=10&past_days=4&wind_speed_unit=mph&precipitation_unit=inch").catch(() => nwsWeather().catch(() => null)),
    J("https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&station=9410660&begin_date=" + b + "&end_date=" + e + "&datum=MLLW&time_zone=lst_ldt&interval=hilo&units=english&format=json").then(x => x.predictions || []).catch(() => []),
    diveBuoys()
  ]);
  if (!wx) throw new Error("weather data unavailable");
  const md = {}; if (mar) mar.daily.time.forEach((t, i) => md[t] = i);
  const wd = {}; wx.daily.time.forEach((t, i) => wd[t] = i);
  const rain = {}; for (const t in wd) rain[t] = wx.daily.precipitation_sum[wd[t]] || 0;
  const am = {};
  wx.hourly.time.forEach((t, i) => { const hr = t.slice(11, 13), sp = wx.hourly.wind_speed_10m[i]; if (["07", "08", "09", "10"].includes(hr) && sp !== null) (am[t.slice(0, 10)] = am[t.slice(0, 10)] || []).push([sp, wx.hourly.wind_direction_10m[i]]); });
  const near = B.filter(x => x.waveFt).map(x => x.waveFt);
  const buoyH = near.length ? near.reduce((a, c) => a + c, 0) / near.length * 0.85 : null;
  const temps = B.filter(x => x.waterF).map(x => x.waterF);
  const buoyT = temps.length ? Math.round(temps.reduce((a, c) => a + c, 0) / temps.length) : null;
  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const days = [];
  for (let k = 0; k < 7; k++) {
    const D = addDays(today, k), ds = iso(D), mi = md[ds], wi = wd[ds];
    let h = mi !== undefined ? mar.daily.swell_wave_height_max[mi] : null;
    const per = mi !== undefined ? mar.daily.swell_wave_period_max[mi] : null;
    const dr = mi !== undefined ? mar.daily.swell_wave_direction_dominant[mi] : null;
    const sst = mi !== undefined ? mar.daily.sea_surface_temperature_max[mi] : null;
    if (k === 0 && buoyH && (h === null || buoyH > h)) h = Math.round(buoyH * 10) / 10;
    const r = rain[ds] || 0;
    const prior = [1, 2, 3].map(j => rain[iso(addDays(D, -j))] || 0), linger = rain[iso(addDays(D, -4))] || 0;
    const a = am[ds] || [];
    const ws = a.length ? a.reduce((x, y) => x + y[0], 0) / a.length : 5;
    const rad = (x) => x * Math.PI / 180;
    const wdir = a.length ? ((Math.atan2(a.reduce((x, y) => x + Math.sin(rad(y[1])), 0), a.reduce((x, y) => x + Math.cos(rad(y[1])), 0)) * 180 / Math.PI) % 360 + 360) % 360 : 0;
    const offshore = a.length > 0 && (wdir <= 120 || wdir >= 345);
    const wind = compass(wdir) + " " + Math.round(ws) + " mph" + (offshore ? ", offshore" : "");
    const swell = h === null ? "No model data yet" : (h.toFixed(1) + " ft " + compass(dr)).trim() + (per ? ", " + Math.round(per) + " s" : "");
    let type, score, why, hon = null;
    if (r >= 0.1) { type = "rain"; score = 1; why = "Rain today. Runoff clouds the water and brings bacteria. Stay out."; }
    else if (Math.max(...prior) >= 0.1) { type = "rain"; score = 2; why = "Inside the 72 hours after rain. The county advises staying out, and runoff clouds the water."; }
    else if (h !== null && dr !== null && dr >= 225 && dr <= 315 && h >= 3) { type = "west"; hon = [5, 9]; why = "A " + h.toFixed(1) + " ft west swell is aimed right at the west-facing coves. Try a north-side spot instead."; }
    else {
      if (h === null) { type = "flat"; hon = [12, 20]; }
      else if (h >= 2) { type = "ssw"; hon = h < 2.5 ? [14, 23] : (h < 3 ? [12, 20] : (h < 4 ? [8, 15] : [5, 10])); }
      else { type = "flat"; hon = h < 1.5 ? [18, 28] : [15, 25]; }
      const mo = D.getMonth() + 1, season = [9, 10, 11].includes(mo) ? 2 : ([3, 4, 5, 6].includes(mo) ? -3 : ([7, 8].includes(mo) ? -1 : 0));
      hon = [hon[0] + season, hon[1] + season];
      if (ws > 12) hon = [hon[0] - 3, hon[1] - 3]; else if (offshore) hon = [hon[0] + 1, hon[1] + 1];
      if (linger >= 0.1) hon = [hon[0] - 2, hon[1] - 2];
      hon = [Math.max(4, Math.min(30, hon[0])), Math.max(6, Math.min(35, hon[1]))];
      const p1 = h === null ? "Beyond the swell model, so this is a rough guess" : (h < 1.5 ? "A small " + h.toFixed(1) + " ft swell" : (h >= 2 ? "A " + h.toFixed(1) + " ft " + compass(dr) + " swell stirring the coves" : "A modest " + h.toFixed(1) + " ft swell"));
      const p2 = offshore ? "an offshore morning breeze" : (ws > 8 ? Math.round(ws) + " mph morning wind" : "light morning wind");
      why = p1 + " and " + p2 + "." + (linger >= 0.1 ? " Still clearing out after the rain." : "");
    }
    if (hon) { const m = (hon[0] + hon[1]) / 2; score = m >= 21 ? 9 : m >= 18 ? 8 : m >= 15.5 ? 7 : m >= 13 ? 6 : m >= 11 ? 5 : m >= 9 ? 4 : m >= 7 ? 3 : 2; if (h === null) score = Math.min(score, 6); }
    const hod = (t) => parseInt(t.slice(11, 13), 10) + parseInt(t.slice(14, 16), 10) / 60;
    const calc = sunTimes(D);
    const sr = wi !== undefined && wx.daily.sunrise[wi] ? hod(wx.daily.sunrise[wi]) : calc[0], ss = wi !== undefined && wx.daily.sunset[wi] ? hod(wx.daily.sunset[wi]) : calc[1];
    const tides = hl.filter(p => p.t.slice(0, 10) === ds).map(p => ({ h: hod(p.t), v: Math.round(parseFloat(p.v) * 10) / 10, type: p.type }));
    const highs = tides.filter(t => t.type === "H" && t.h >= 6 && t.h <= 15), hi = highs.length ? highs[0].h : null;
    let win = null;
    if (type !== "rain") {
      const endw = (hi && hi >= 8) ? Math.min(hi + 0.5, 12.5) : 10.5, st = Math.max(sr + 1 / 6, endw - 3);
      win = [Math.round(st * 4) / 4, Math.round(endw * 4) / 4];
      if (k === 0) { const nh = nowLA.getHours() + nowLA.getMinutes() / 60; if (nh > win[1] - 0.5) { const s2 = Math.max(nh + 0.5, 12.5), e2 = Math.min(ss - 0.75, s2 + 2.5); win = (e2 - s2 >= 1) ? [Math.round(s2 * 4) / 4, Math.round(e2 * 4) / 4] : null; } }
    }
    days.push({ date: ds, label: (k === 0 ? "Today, " : "") + DOW[D.getDay()] + " " + MON[D.getMonth()] + " " + D.getDate(), score, verdict: score >= 7 ? "GO" : (score >= 5 ? "MAYBE" : "NO"), type, swell, wind,
      vis: hon ? hon[0] + " to " + hon[1] + " ft" : "poor", water: sst ? Math.round(sst) : buoyT, why,
      tide: hi ? highs[0].v + " ft high at " + fmtH(hi) : (tides.length ? "no morning high tide" : "no tide data"), win: win ? fmtH(win[0]) + " to " + fmtH(win[1]) : null });
  }
  const best = days.reduce((x, y) => y.score > x.score ? y : x, days[0]);
  const out = { ts: Date.now(), spot: "Honeymoon Cove", weather: wx.source || "Open-Meteo", swellModel: !!mar, updated: fmtH(nowLA.getHours() + nowLA.getMinutes() / 60), days, best: { label: best.label, score: best.score } };
  if (env.KV) { await env.KV.put("dive", JSON.stringify(out), { expirationTtl: 3600 }); await env.KV.put("dive_last", JSON.stringify(out)); }
  return out;
}
const DIVE_PAGE = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="application-name" content="Dive Report">
<title>Dive Report</title>
<style>
*{box-sizing:border-box;margin:0}
html,body{inline-size:100%;block-size:100%;background:#000;color:#fff;font-family:-apple-system,"SF Pro Display",system-ui,Roboto,sans-serif;-webkit-font-smoothing:antialiased;overflow:hidden}
#app{block-size:100%;display:flex;flex-direction:column;padding:6.5% 7% 6%}
.top{display:flex;justify-content:space-between;align-items:center;font-size:1rem;letter-spacing:.2em;text-transform:uppercase;color:#C9CDD3;font-weight:600;flex:none}
.top i{display:inline-block;inline-size:.6em;block-size:.6em;border-radius:50%;background:#4FC3F7;margin-right:.55em}
#upd{letter-spacing:.04em;text-transform:none;color:#7C838C;font-weight:500;font-size:.95rem}
#day{font-size:1.25rem;color:#AEB4BC;margin-top:1.1rem;flex:none}
.hero{display:flex;align-items:baseline;gap:.5em;flex:none;margin-top:.1rem}
#verdict{font-size:5rem;font-weight:800;letter-spacing:-.03em;line-height:1}
#score{font-size:1.6rem;color:#AEB4BC;font-weight:600}
.go{color:#5EE08A}.maybe{color:#FFC857}.no{color:#FF6B6B}
#vis{font-size:1.75rem;font-weight:650;margin-top:.35rem;flex:none}
#rows{flex:1;min-block-size:0;display:grid;grid-template-columns:auto 1fr;column-gap:1.1em;row-gap:.42em;align-content:center;font-size:1.3rem;border-top:1px solid #2A2E35;margin-top:.9rem;padding-top:.8rem;overflow:hidden}
#rows b{color:#7C838C;font-weight:600;font-size:.82em;letter-spacing:.1em;text-transform:uppercase;align-self:center}
#rows span{color:#E6E9ED;line-height:1.2}
#why{flex:1;min-block-size:0;font-size:1.75rem;line-height:1.3;font-weight:500;border-top:1px solid #2A2E35;margin-top:.9rem;padding-top:.9rem;overflow:hidden}
.bar{display:flex;gap:3%;align-items:center;flex:none;margin-top:.8rem}
.dots{flex:1;display:flex;gap:.45em}
.dots u{inline-size:.6em;block-size:.6em;border-radius:50%;background:#3A3F47;display:block}
.dots u.on{outline:2px solid #fff;outline-offset:1px}
.dots u.go{background:#5EE08A}.dots u.maybe{background:#FFC857}.dots u.no{background:#FF6B6B}
button{font:inherit;font-size:1.1rem;font-weight:600;color:#fff;background:#14171B;border:1.5px solid #2F343C;border-radius:999px;padding:.55em 1.05em;white-space:nowrap}
button:focus{outline:none;border-color:#fff;box-shadow:0 0 0 3px rgba(255,255,255,.28)}
[hidden]{display:none!important}
</style></head><body>
<div id="app">
  <div class="top"><div><i></i>Dive report</div><div id="upd"></div></div>
  <div id="day">Checking the ocean</div>
  <div class="hero"><div id="verdict"></div><div id="score"></div></div>
  <div id="vis"></div>
  <div id="rows"></div>
  <div id="why" hidden></div>
  <div class="bar"><div class="dots" id="dots"></div><button type="button" id="whyb">Why</button><button type="button" id="prev">Back</button><button type="button" id="next">Next day</button></div>
</div>
<script>
const $=id=>document.getElementById(id);
let data=null,i=0,showWhy=false;
let voice=true; try{ voice=localStorage.getItem("voice")!=="off"; }catch(e){}
function say(t){ try{ if(!voice||!("speechSynthesis" in window)||!("SpeechSynthesisUtterance" in window)) return; window.speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(t); u.lang="en-US"; u.rate=1.05; window.speechSynthesis.speak(u); }catch(e){} }
function esc(t){ return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;"); }
function draw(){
  const d=data.days[i], c=d.verdict.toLowerCase();
  $("day").textContent=d.label+" at "+data.spot;
  $("verdict").textContent=d.verdict; $("verdict").className=c; $("score").textContent=d.score+" / 10";
  $("vis").textContent="Visibility est. "+d.vis;
  const rows=[["Swell",d.swell],["Wind",d.wind+" (morning)"],["Tide",d.tide],["Water",d.water?d.water+" F":"unknown"],["Window",d.verdict==="NO"?"skip this one":(d.win||"none today")]];
  $("rows").innerHTML=rows.map(r=>"<b>"+r[0]+"</b><span>"+esc(r[1])+"</span>").join("");
  $("why").textContent=d.why; $("why").hidden=!showWhy; $("rows").hidden=showWhy; $("whyb").textContent=showWhy?"Details":"Why";
  $("dots").innerHTML=data.days.map((x,k)=>"<u class='"+x.verdict.toLowerCase()+(k===i?" on":"")+"'></u>").join("");
  $("prev").hidden=i===0; $("next").hidden=i===data.days.length-1;
  $("upd").textContent=(data.stale?"saved ":"")+data.updated;
}
function speak(){ const d=data.days[i]; say(d.label+". "+(d.verdict==="GO"?"Go":d.verdict==="MAYBE"?"Maybe":"No go")+", "+d.score+" out of 10. Visibility about "+d.vis+". "+(d.win&&d.verdict!=="NO"?"Best window "+d.win+".":"")+" "+d.why); }
$("next").addEventListener("click",()=>{ if(i<data.days.length-1){ i++; showWhy=false; draw(); speak(); ($("next").hidden?$("prev"):$("next")).focus(); } });
$("prev").addEventListener("click",()=>{ if(i>0){ i--; showWhy=false; draw(); speak(); ($("prev").hidden?$("next"):$("prev")).focus(); } });
$("whyb").addEventListener("click",()=>{ showWhy=!showWhy; draw(); });
(async()=>{
  try{
    const r=await fetch("dive/data"); data=await r.json(); if(!data.days) throw new Error(data.error||"no data");
    draw(); $("next").focus(); speak();
  }catch(e){ $("day").textContent="Could not load the ocean data. "+(e.message||""); }
})();
</script></body></html>`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (!env.SLUG) return new Response("Not set up", { status: 500 });
    const base = "/" + env.SLUG;
    if (url.pathname === base) return Response.redirect(url.origin + base + "/", 302);
    if (url.pathname === base + "/" && request.method === "GET") {
      return new Response(PAGE, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
    }
    if (url.pathname === base + "/dive" && request.method === "GET") {
      return new Response(DIVE_PAGE, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
    }
    if (url.pathname === base + "/dive/data" && request.method === "GET") {
      try { return Response.json(await diveData(env)); } catch (e) { return Response.json({ error: String(e.message || e) }, { status: 502 }); }
    }
    if (url.pathname === base + "/ask" && request.method === "POST") {
      let q = "";
      let body = {};
      try { body = await request.json(); q = String(body.q || "").slice(0, 1000); } catch (e) {}
      let img = "";
      try { img = String(body.img || ""); } catch (e) {}
      if (img.length > 2500000) return Response.json({ error: "photo too large" }, { status: 400 });
      const mode = String(body.mode || "").toLowerCase();
      const game = mode === "chess" || mode === "checkers";
      if (img && !q) {
        if (game) q = "This photo is a " + mode + " board seen from my seat at the table" + (body.side ? "; I am playing " + String(body.side).slice(0, 12) : "") + ". Read the position square by square, carefully. Then give my best move. In the card: big is the move in short notation, h is the move in plain words such as Knight to f3, p is one or two short reasons. If you cannot read the board with confidence, say exactly that in h and tell me what to adjust (closer, less glare, whole board in view) instead of guessing.";
        else q = "Tell me the single most useful thing about what I am looking at right now. If there is a question, problem, error message or instruction in view, answer or explain it.";
      }
      if (!q) return Response.json({ error: "empty question" }, { status: 400 });
      if (!env.ANTHROPIC_API_KEY) return Response.json({ error: "key not set yet" }, { status: 500 });
      if (!img && env.KV && /^\s*(task|sweep|full sweep|run a sweep|run a full sweep)\b/i.test(q)) {
        const t = new Date().toISOString();
        await env.KV.put("task:" + t, q, { expirationTtl: 60 * 60 * 24 * 45 });
        const a = "Sent to your agent. The answer shows up here within the hour. Look for the results button on the home screen.";
        ctx.waitUntil(env.KV.put("log:" + t, JSON.stringify({ q, a, task: true, src: "meta-glasses" }), { expirationTtl: 60 * 60 * 24 * 45 }));
        return Response.json({ a });
      }
      const brief = env.KV ? ((await env.KV.get("brief")) || "") : "";
      let ocean = "";
      if (!img && /\b(dive|diving|spearfish|spear|freedive|visibility|vis|swell|tide|ocean|surf|cove|water temp)/i.test(q)) {
        try { const dd = await diveData(env); ocean = "\n\nLive dive report for " + dd.spot + ". When he asks whether he can or should dive, spearfish or get in the water, answer from this report: big is the verdict word for the day he means (GO, MAYBE or NO), h says it plainly, p gives visibility est., swell, and the best window or the better day. Never turn a NO into a yes, do not discuss fishing rules or seasons unless he asks about them, and call the numbers estimates. Report: " + dd.days.map(x => x.label + ": " + x.verdict + " " + x.score + "/10, vis " + x.vis + ", swell " + x.swell + ", wind " + x.wind + ", " + x.tide + ", window " + (x.win || "none") + ". " + x.why).join(" | "); } catch (e) {}
      }
      const now = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles", weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" });
      const system = SYSTEM + " Right now it is " + now + " Pacific time; use that for today, tonight and tomorrow." + ocean + (brief ? "\n\nBackground on the wearer, Michael. Use it only when it helps answer:\n" + brief : "");
      const deep = game || !img && (body.deep === true || /^\s*(think|deep|research|plan)\b/i.test(q));
      const hist = Array.isArray(body.h) ? body.h.slice(-3) : [];
      const messages = [];
      for (const x of hist) { if (x && x.q && x.a) { messages.push({ role: "user", content: String(x.q).slice(0, 1000) }); messages.push({ role: "assistant", content: String(x.a).slice(0, 2000) }); } }
      messages.push({ role: "user", content: img ? [{ type: "image", source: { type: "base64", media_type: "image/jpeg", data: img } }, { type: "text", text: q }] : q });
      const sys2 = deep ? system + " DEEP MODE: think it through carefully and search the web as much as needed. Same JSON shape, but p may have up to 4 points of 12 words or fewer, and more may run to 110 words." : system;
      const call = (model, tools) => fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model, max_tokens: deep ? 1500 : 600, system: sys2, ...(tools ? { tools: [{ type: "web_search_20250305", name: "web_search", max_uses: deep ? 6 : 3 }] } : {}), messages })
      });
      let used = MODEL, r;
      if (deep) {
        for (const m of DEEP_MODELS) { r = await call(m, !img); used = m; if (r.ok || (r.status !== 404 && r.status !== 400)) break; }
        if (!r.ok) { r = await call(MODEL, !img); used = MODEL; }
      } else {
        r = await call(MODEL, !img);
        if (!r.ok && !img && r.status === 400) r = await call(MODEL, false);
      }
      const d = await r.json();
      if (!r.ok) return Response.json({ error: (d.error && d.error.message) || ("API " + r.status) }, { status: 502 });
      let a = (d.content || []).map(c => c.text || "").join("").replace(/<\/?cite[^>]*>/g, "").trim();
      if (!img && env.KV && a.includes("ROUTE_TASK")) {
        const t = new Date().toISOString();
        await env.KV.put("task:" + t, q, { expirationTtl: 60 * 60 * 24 * 45 });
        a = "On it. Your agent is checking that for you. The answer will be under results on the home screen within the hour.";
        ctx.waitUntil(env.KV.put("log:" + t, JSON.stringify({ q, a, task: true, src: "meta-glasses" }), { expirationTtl: 60 * 60 * 24 * 45 }));
        return Response.json({ a, routed: true });
      }
      let v = null;
      const jm = a.match(/\{[\s\S]*\}/);
      if (jm) {
        try {
          const o = JSON.parse(jm[0]);
          if (o && typeof o.h === "string" && o.h.trim()) {
            v = { big: o.big ? String(o.big).slice(0, 8) : "", h: o.h.trim().slice(0, 120), p: (Array.isArray(o.p) ? o.p : []).map(x => String(x).trim()).filter(Boolean).slice(0, 4), more: o.more ? String(o.more).trim().slice(0, 900) : "" };
            a = [v.big, v.h].filter(Boolean).join(" ") + (v.p.length ? ". " + v.p.join("; ") : "") + (v.more ? ". " + v.more : "");
          }
        } catch (e) {}
      }
      if (env.KV) {
        const t = new Date().toISOString();
        ctx.waitUntil(env.KV.put("log:" + t, JSON.stringify({ q, a, photo: !!img, src: "meta-glasses", model: used }), { expirationTtl: 60 * 60 * 24 * 45 }));
        if (img) ctx.waitUntil(env.KV.put("photo:" + t, img, { expirationTtl: 60 * 60 * 24 * 45 }));
      }
      return Response.json({ a, v, m: used });
    }
    if (url.pathname === base + "/brief" && env.KV) {
      if (request.method === "PUT") { await env.KV.put("brief", (await request.text()).slice(0, 14000)); return Response.json({ ok: true }); }
      if (request.method === "GET") return new Response((await env.KV.get("brief")) || "", { headers: { "content-type": "text/plain; charset=utf-8" } });
    }
    if (url.pathname === base + "/photo" && request.method === "GET" && env.KV) {
      const p = await env.KV.get("photo:" + (url.searchParams.get("t") || ""));
      if (!p) return new Response("Not found", { status: 404 });
      return new Response(Uint8Array.from(atob(p), ch => ch.charCodeAt(0)), { headers: { "content-type": "image/jpeg" } });
    }
    if (url.pathname === base + "/result" && request.method === "POST" && env.KV) {
      let b = {};
      try { b = await request.json(); } catch (e) {}
      const t = String(b.t || ""), a = String(b.a || "").slice(0, 1500);
      if (!t || !a) return Response.json({ error: "need t and a" }, { status: 400 });
      const q = (await env.KV.get("task:" + t)) || String(b.q || "Task");
      const done = new Date().toISOString();
      let v = null;
      if (b.v && typeof b.v.h === "string") v = { big: b.v.big ? String(b.v.big).slice(0, 8) : "", h: b.v.h.slice(0, 120), p: (Array.isArray(b.v.p) ? b.v.p : []).map(x => String(x)).slice(0, 4), more: b.v.more ? String(b.v.more).slice(0, 900) : "" };
      await env.KV.put("result:" + done, JSON.stringify({ task: t, q, a, v }), { expirationTtl: 60 * 60 * 24 * 45 });
      await env.KV.delete("task:" + t);
      return Response.json({ ok: true });
    }
    if (url.pathname === base + "/results" && request.method === "GET" && env.KV) {
      const after = url.searchParams.get("after") || "";
      const list = await env.KV.list({ prefix: "result:" });
      const out = [];
      for (const k of list.keys) { const t = k.name.slice(7); if (t > after) { const v = await env.KV.get(k.name); if (v) out.push({ t, ...JSON.parse(v) }); } }
      return Response.json(out.slice(-10));
    }
    if (url.pathname === base + "/tasks" && request.method === "GET" && env.KV) {
      const after = url.searchParams.get("after") || "";
      const list = await env.KV.list({ prefix: "task:" });
      const out = [];
      for (const k of list.keys) { const t = k.name.slice(5); if (t > after) out.push({ t, q: await env.KV.get(k.name) }); }
      return Response.json(out);
    }
    if (url.pathname === base + "/log" && request.method === "GET" && env.KV) {
      const after = url.searchParams.get("after") || "";
      const list = await env.KV.list({ prefix: "log:" });
      const out = [];
      for (const k of list.keys) {
        const t = k.name.slice(4);
        if (t > after) { const v = await env.KV.get(k.name); if (v) out.push({ t, ...JSON.parse(v) }); }
      }
      return Response.json(out);
    }
    return new Response("Not found", { status: 404 });
  }
};
