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
button{font:inherit;font-size:1.15rem;font-weight:600;color:#fff;background:#3a1f14;border:2px solid #6b4433;border-radius:14px;padding:.5em 1em}
input:focus,button:focus{outline:none;border-color:#fff}
button:focus{background:#D97757}
</style></head><body>
<div id="app">
<div id="top">Ask Claude</div>
<div id="out" class="dim" tabindex="0">Select the box, say or write your question, then Ask.</div>
<form id="row"><input id="q" type="text" placeholder="Your question" autocomplete="off"><button id="go" type="submit">Ask</button></form>
</div>
<script>
const out=document.getElementById("out"),q=document.getElementById("q");
let busy=false;
async function ask(){
  const text=q.value.trim(); if(!text||busy) return;
  busy=true; out.className="dim"; out.textContent="Thinking...";
  try{
    const r=await fetch("ask",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({q:text})});
    const d=await r.json();
    out.className=""; out.textContent=d.a||("Problem: "+(d.error||r.status));
    q.value="";
  }catch(e){ out.className=""; out.textContent="Could not reach Claude. Check the phone connection."; }
  busy=false;
}
document.getElementById("row").addEventListener("submit",e=>{e.preventDefault();ask();});
q.addEventListener("change",ask);
q.focus();
</script></body></html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!env.SLUG) return new Response("Not set up", { status: 500 });
    const base = "/" + env.SLUG;
    if (url.pathname === base) return Response.redirect(url.origin + base + "/", 302);
    if (url.pathname === base + "/" && request.method === "GET") {
      return new Response(PAGE, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
    }
    if (url.pathname === base + "/ask" && request.method === "POST") {
      let q = "";
      try { q = String((await request.json()).q || "").slice(0, 1000); } catch (e) {}
      if (!q) return Response.json({ error: "empty question" }, { status: 400 });
      if (!env.ANTHROPIC_API_KEY) return Response.json({ error: "key not set yet" }, { status: 500 });
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: MODEL, max_tokens: 300, system: SYSTEM, messages: [{ role: "user", content: q }] })
      });
      const d = await r.json();
      if (!r.ok) return Response.json({ error: (d.error && d.error.message) || ("API " + r.status) }, { status: 502 });
      return Response.json({ a: (d.content || []).map(c => c.text || "").join("").trim() });
    }
    return new Response("Not found", { status: 404 });
  }
};
