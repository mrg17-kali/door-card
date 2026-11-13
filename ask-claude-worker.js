const MODEL = "claude-haiku-4-5";
const SYSTEM = "You are answering on a tiny heads-up display in smart glasses. Reply in plain text, no markdown, 45 words or fewer unless asked for more. Lead with the answer.";
const PAGE = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="application-name" content="Ask Claude">
<title>Ask Claude</title>
<style>
*{box-sizing:border-box}
html,body{inline-size:100%;block-size:100%;margin:0;background:#000;color:#fff;font-family:-apple-system,system-ui,Roboto,sans-serif}
#app{block-size:100%;display:grid;grid-template-rows:auto minmax(0,1fr) auto;padding:6%;gap:4%}
#top{font-size:1.05rem;letter-spacing:.04em;color:#F0A070;font-weight:600;text-transform:uppercase}
#out{border:2px solid #D97757;border-radius:22px;padding:5%;min-block-size:0;overflow-y:auto;font-size:1.5rem;line-height:1.3;white-space:pre-wrap}
#out.dim{color:#9aa}
#row{display:flex;gap:3%}
input{flex:1;min-inline-size:0;font:inherit;font-size:1.15rem;color:#fff;background:#111;border:2px solid #444;border-radius:14px;padding:.5em .7em}
button{font:inherit;font-size:1.15rem;font-weight:600;color:#fff;background:#3a1f14;border:2px solid #6b4433;border-radius:14px;padding:.5em .7em}
input:focus,button:focus{outline:none;border-color:#fff}
button:focus{background:#D97757}
</style></head><body>
<div id="app">
<div id="top">Ask Claude</div>
<div id="out" class="dim" tabindex="0">Select the box, say or write your question, then Ask.</div>
<form id="row"><input id="q" type="text" placeholder="Your question" autocomplete="off"><button id="go" type="submit">Ask</button><button id="look" type="button">Look</button></form>
<video id="v" playsinline muted style="display:none"></video><canvas id="c" style="display:none"></canvas>
</div>
<script>
const out=document.getElementById("out"),q=document.getElementById("q");
let busy=false;
async function send(payload){
  busy=true; out.className="dim"; out.textContent=payload.img?"Looking...":"Thinking...";
  try{
    const r=await fetch("ask",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});
    const d=await r.json();
    out.className=""; out.textContent=d.a||("Problem: "+(d.error||r.status));
    q.value="";
  }catch(e){ out.className=""; out.textContent="Could not reach Claude. Check the connection."; }
  busy=false;
}
async function ask(){
  const text=q.value.trim(); if(!text||busy) return;
  await send({q:text});
}
async function look(){
  if(busy) return;
  const v=document.getElementById("v"),c=document.getElementById("c");
  let stream;
  try{
    if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia) throw new Error("no camera access in this app");
    out.className="dim"; out.textContent="Opening camera...";
    let err;
    for(const cons of [{video:{facingMode:"environment"},audio:false},{video:true,audio:false}]){
      try{ stream=await navigator.mediaDevices.getUserMedia(cons); break; }catch(e){ err=e; }
    }
    if(!stream){
      let n="?";
      try{ n=(await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==="videoinput").length; }catch(e){}
      out.className=""; out.textContent="Meta is not giving this app a camera (cameras offered: "+n+"). "+((err&&err.name)||"");
      return;
    }
    v.srcObject=stream; await v.play();
    await new Promise(r=>setTimeout(r,700));
    const w=v.videoWidth||640,h=v.videoHeight||480,k=Math.min(1,1024/Math.max(w,h));
    c.width=Math.round(w*k); c.height=Math.round(h*k);
    c.getContext("2d").drawImage(v,0,0,c.width,c.height);
    const img=c.toDataURL("image/jpeg",0.8).split(",")[1];
    stream.getTracks().forEach(t=>t.stop());
    await send({q:q.value.trim()||"What am I looking at? Be specific and brief.",img});
  }catch(e){
    if(stream) stream.getTracks().forEach(t=>t.stop());
    out.className=""; out.textContent="Camera not available here: "+(e.name||"")+" "+(e.message||"");
  }
}
document.getElementById("look").addEventListener("click",look);
document.getElementById("row").addEventListener("submit",e=>{e.preventDefault();ask();});
q.addEventListener("change",ask);
q.focus();
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
      const brief = env.KV ? ((await env.KV.get("brief")) || "") : "";
      const system = SYSTEM + (brief ? "\n\nBackground on the wearer, Michael. Use it only when it helps answer:\n" + brief : "");
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: MODEL, max_tokens: 300, system, messages: [{ role: "user", content: img ? [{ type: "image", source: { type: "base64", media_type: "image/jpeg", data: img } }, { type: "text", text: q }] : q }] })
      });
      const d = await r.json();
      if (!r.ok) return Response.json({ error: (d.error && d.error.message) || ("API " + r.status) }, { status: 502 });
      const a = (d.content || []).map(c => c.text || "").join("").trim();
      if (env.KV) {
        const t = new Date().toISOString();
        ctx.waitUntil(env.KV.put("log:" + t, JSON.stringify({ q, a, photo: !!img }), { expirationTtl: 60 * 60 * 24 * 45 }));
        if (img) ctx.waitUntil(env.KV.put("photo:" + t, img, { expirationTtl: 60 * 60 * 24 * 45 }));
      }
      return Response.json({ a });
    }
    if (url.pathname === base + "/brief" && env.KV) {
      if (request.method === "PUT") { await env.KV.put("brief", (await request.text()).slice(0, 6000)); return Response.json({ ok: true }); }
      if (request.method === "GET") return new Response((await env.KV.get("brief")) || "", { headers: { "content-type": "text/plain; charset=utf-8" } });
    }
    if (url.pathname === base + "/photo" && request.method === "GET" && env.KV) {
      const p = await env.KV.get("photo:" + (url.searchParams.get("t") || ""));
      if (!p) return new Response("Not found", { status: 404 });
      return new Response(Uint8Array.from(atob(p), ch => ch.charCodeAt(0)), { headers: { "content-type": "image/jpeg" } });
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
