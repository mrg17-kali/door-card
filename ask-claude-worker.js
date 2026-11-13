const MODEL = "claude-haiku-4-5";
const DEEP_MODELS = ["claude-opus-5-5", "claude-opus-4-5", "claude-sonnet-4-5"];
const SYSTEM = "You are answering on a tiny heads-up display in smart glasses. Reply in plain text, no markdown, 45 words or fewer unless asked for more. Lead with the answer. You can search the web: use it for current facts, prices, news, businesses and research, then give the short answer. Private records (money, health, family, legal, job applications) are kept off the glasses on purpose; if asked for those or for a full sweep, say so in one line and tell him to start his request with the word task so his agents on the Mac handle it.";
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
.bar{display:flex;gap:3%;align-items:center;flex:none;margin-top:1.1rem}
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
    <div class="sub">Say think for a deeper answer. Say task for your agent.</div>
    <div class="chips"><button type="button" data-q="What is my next step?">Next step</button><button type="button" data-q="What is my opening line at the door?">Door opener</button><button type="button" data-q="Think: based on everything you know about me and today, what is the single most valuable thing I should do next, and why?">Think</button></div>
  </div>
  <div class="mid" id="busy" hidden><div class="pulse"></div><h1 id="busyt">Thinking</h1><div class="sub" id="busyq"></div></div>
  <div id="ans" hidden></div>
  <form class="bar" id="ask"><input id="q" type="text" placeholder="Your question" autocomplete="off"><button class="pri" id="go" type="submit">Ask</button></form>
  <div class="bar" id="nav" hidden><div class="dots" id="dots"></div><button type="button" id="prev">Back</button><button type="button" id="next">Next</button><button class="pri" type="button" id="again">New</button></div>
</div>
<script>
const $=id=>document.getElementById(id);
const q=$("q"),ans=$("ans");
let busy=false,pages=[],pi=0,hist=[],last=0;
function show(s){
  $("home").hidden=s!=="home"; $("busy").hidden=s!=="busy"; ans.hidden=s!=="ans";
  $("ask").hidden=s!=="home"; $("nav").hidden=s!=="ans";
  $("mark").hidden=s==="ans"; $("echo").hidden=s!=="ans"; if(s!=="home") $("res").hidden=true;
}
function paginate(text){
  const words=String(text).replace(/\\s+/g," ").trim().split(" "); const out=[]; let cur=[];
  for(const w of words){ cur.push(w); ans.textContent=cur.join(" ");
    if(ans.scrollHeight>ans.clientHeight+1&&cur.length>1){ cur.pop(); out.push(cur.join(" ")); cur=[w]; } }
  if(cur.length) out.push(cur.join(" "));
  return out;
}
function draw(){
  ans.textContent=pages[pi]||"";
  const many=pages.length>1;
  $("dots").innerHTML=many?pages.map((_,i)=>"<b"+(i===pi?" class=on":"")+"></b>").join(""):"";
  $("prev").hidden=!many||pi===0; $("next").hidden=!many||pi===pages.length-1;
  (!$("next").hidden?$("next"):$("again")).focus();
}
function answer(question,text){
  $("echo").textContent=question; show("ans"); pages=paginate(text); pi=0; draw();
  try{ if(!history.state||history.state.s!=="ans") history.pushState({s:"ans"},""); }catch(e){}
}
function home(){ show("home"); q.value=""; q.focus(); checkResults(); }
async function send(text){
  if(busy) return; busy=true;
  const isTask=/^\\s*(task|sweep|full sweep|run a)/i.test(text), isDeep=/^\\s*(think|deep|research|plan)\\b/i.test(text);
  if(Date.now()-last>600000) hist=[];
  $("busyt").textContent=isTask?"Sending":(isDeep?"Thinking deeper":"Thinking"); $("busyq").textContent=text; show("busy");
  let out;
  try{
    const r=await fetch("ask",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({q:text,h:hist})});
    const d=await r.json(); out=d.a||("Problem: "+(d.error||r.status));
    if(d.a&&!isTask){ hist.push({q:text,a:d.a}); hist=hist.slice(-3); last=Date.now(); }
  }catch(e){ out="Could not reach Claude. Check the connection and try again."; }
  busy=false; answer(text,out);
}
$("ask").addEventListener("submit",e=>{e.preventDefault(); const t=q.value.trim(); if(t) send(t);});
q.addEventListener("change",()=>{const t=q.value.trim(); if(t) send(t);});
document.querySelectorAll(".chips button").forEach(b=>b.addEventListener("click",()=>send(b.dataset.q)));
$("next").addEventListener("click",()=>{ if(pi<pages.length-1){pi++;draw();} });
$("prev").addEventListener("click",()=>{ if(pi>0){pi--;draw();} });
$("again").addEventListener("click",()=>{ try{ if(history.state&&history.state.s==="ans"){ history.back(); return; } }catch(e){} home(); });
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
  answer(r.q||"Task result",r.a||"");
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
        ctx.waitUntil(env.KV.put("log:" + t, JSON.stringify({ q, a, task: true }), { expirationTtl: 60 * 60 * 24 * 45 }));
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
      const sys2 = deep ? system + " DEEP MODE: think it through carefully, search the web as much as needed, and give a complete answer in up to 130 words: the recommendation first, then the 2 or 3 reasons or steps that matter." : system;
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
      const a = (d.content || []).map(c => c.text || "").join("").trim();
      if (env.KV) {
        const t = new Date().toISOString();
        ctx.waitUntil(env.KV.put("log:" + t, JSON.stringify({ q, a, photo: !!img }), { expirationTtl: 60 * 60 * 24 * 45 }));
        if (img) ctx.waitUntil(env.KV.put("photo:" + t, img, { expirationTtl: 60 * 60 * 24 * 45 }));
      }
      return Response.json({ a, m: used });
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
      await env.KV.put("result:" + done, JSON.stringify({ task: t, q, a }), { expirationTtl: 60 * 60 * 24 * 45 });
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
