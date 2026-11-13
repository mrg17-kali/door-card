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
.chips button{flex:1;font-size:1.05rem;padding:.75em .4em;color:#D7DADF}
button.pri{background:#E8A07A;border-color:#E8A07A;color:#17110D}
input:focus,button:focus{outline:none;border-color:#fff;box-shadow:0 0 0 3px rgba(255,255,255,.28)}
.pulse{inline-size:1.1rem;block-size:1.1rem;border-radius:50%;background:#E8A07A;animation:p 1.1s ease-in-out infinite;margin-bottom:1.4rem}
@keyframes p{0%,100%{transform:scale(.6);opacity:.45}50%{transform:scale(1.25);opacity:1}}
[hidden]{display:none!important}
</style></head><body>
<div id="app">
  <div class="top"><div class="mark" id="mark"><i></i>Claude</div><div class="echo" id="echo" hidden></div><button id="res" type="button" hidden></button></div>
  <div class="mid" id="home">
    <h1>Ask anything.</h1>
    <div class="sub">Just ask. Say think for a deeper answer.</div>
    <div class="chips"><button type="button" data-q="What is my next step?">Next step</button><button type="button" data-q="What is my opening line at the door?">Door opener</button><button type="button" data-q="Think: based on everything you know about me and today, what is the single most valuable thing I should do next, and why?">Think</button></div>
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
  $("mark").hidden=s==="ans"; $("echo").hidden=s!=="ans"; if(s!=="home") $("res").hidden=true;
}
function paginate(text){
  const words=String(text).replace(/\\s+/g," ").trim().split(" "); const out=[]; let cur=[];
  for(const w of words){ cur.push(w); ans.textContent=cur.join(" ");
    if(ans.scrollHeight>ans.clientHeight+1&&cur.length>1){ cur.pop(); out.push(cur.join(" ")); cur=[w]; } }
  if(cur.length) out.push(cur.join(" "));
  return out;
}
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
  try{ if(!history.state||history.state.s!=="ans") history.pushState({s:"ans"},""); }catch(e){}
}
function home(){ show("home"); q.value=""; q.focus(); checkResults(); }
async function send(text){
  if(busy) return; busy=true;
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
document.querySelectorAll(".chips button").forEach(b=>b.addEventListener("click",()=>send(b.dataset.q)));
$("next").addEventListener("click",()=>{ if(pi<pages.length-1){pi++;draw();} });
$("prev").addEventListener("click",()=>{ if(pi>0){pi--;draw();} });
window.addEventListener("popstate",()=>{ if(!busy) home(); });
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

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (!env.SLUG) return new Response("Not set up", { status: 500 });
    const base = "/" + env.SLUG;
    if (url.pathname === base) return Response.redirect(url.origin + base + "/", 302);
    if (url.pathname === base + "/" && request.method === "GET") {
      return new Response(PAGE, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
    }
    if (url.pathname === base + "/ask" && request.method === "POST") {
      let q = "";
      let body = {};
      try { body = await request.json(); q = String(body.q || "").slice(0, 1000); } catch (e) {}
      let img = "";
      try { img = String(body.img || ""); } catch (e) {}
      if (img.length > 2500000) return Response.json({ error: "photo too large" }, { status: 400 });
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
      const now = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles", weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" });
      const system = SYSTEM + " Right now it is " + now + " Pacific time; use that for today, tonight and tomorrow." + (brief ? "\n\nBackground on the wearer, Michael. Use it only when it helps answer:\n" + brief : "");
      const deep = !img && (body.deep === true || /^\s*(think|deep|research|plan)\b/i.test(q));
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
        for (const m of DEEP_MODELS) { r = await call(m, true); used = m; if (r.ok || (r.status !== 404 && r.status !== 400)) break; }
        if (!r.ok) { r = await call(MODEL, true); used = MODEL; }
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
