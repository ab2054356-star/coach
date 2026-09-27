/* مدربك الشخصي — يخزّن الموقع والفيديوهات عشان يشتغل بدون نت */
const V = "coach-d936c0eebf";
const CORE = ["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png", "videos/bench.mp4", "videos/bike.mp4", "videos/c_walk.mp4", "videos/calf.mp4", "videos/crunch.mp4", "videos/curl.mp4", "videos/deadbug.mp4", "videos/facepull.mp4", "videos/hinge.mp4", "videos/incline.mp4", "videos/lateral.mp4", "videos/legcurl.mp4", "videos/legcurl2.mp4", "videos/legext.mp4", "videos/legpress.mp4", "videos/ohp.mp4", "videos/plank.mp4", "videos/pulldown.mp4", "videos/pushdown.mp4", "videos/pushup.mp4", "videos/revfly.mp4", "videos/row1.mp4", "videos/splank.mp4", "videos/split.mp4", "videos/squat.mp4", "videos/srow.mp4", "videos/thrust.mp4", "videos/w_arms.mp4", "videos/w_squat.mp4", "videos/walk.mp4"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V && k !== "coach-lib").map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  const same = u.origin === location.origin;
  const font = /fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if (!same && !font) return;
  // الصفحة نفسها: الجديد من النت، ولو ما في نت من المخزن
  if (same && (r.mode === "navigate" || u.pathname.endsWith("/index.html"))) {
    e.respondWith(fetch(r.url, { cache: "no-cache", credentials: "same-origin" }).then(res => { if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put("index.html", cp)); } return res; })
      .catch(() => caches.match("index.html")));
    return;
  }
  // فيديوهات المكتبة: تنخزن أول ما تفتحها
  const bucket = same && u.pathname.includes("/lib/") ? "coach-lib" : V;
  e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => {
    if (res.ok || res.type === "opaque") { const cp = res.clone(); caches.open(bucket).then(c => c.put(r, cp)); }
    return res;
  })));
});
