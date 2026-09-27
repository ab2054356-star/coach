/* ==================================================================
   مدربك الشخصي — Service Worker (يخلي التطبيق يشتغل بدون نت)
   - الكود (html / css / js): من النت أول، ولو ما فيه نت من المخزن
     عشان أي تعديل تسويه يطلع على طول
   - الفيديوهات والصور: من المخزن أول (أسرع)، ولو مو موجودة من النت
   لو غيّرت أسماء ملفات أو ضفت ملفات مهمة: حدّث قائمة CORE وغيّر رقم VERSION
   ================================================================== */
const VERSION = "v6";
const CACHE = "coach-" + VERSION;
const CORE = [
  "./",
  "index.html",
  "style.css",
  "app.js",
  "anatomy.js",
  "i18n.js",
  "bodies.js",
  "lib/library.js",
  "lib/thumbs.js",
  "lib/layers.js",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/apple-touch-icon.png",
  "icons/favicon-32.png",
  "videos/bench.mp4",
  "videos/bike.mp4",
  "videos/c_walk.mp4",
  "videos/calf.mp4",
  "videos/crunch.mp4",
  "videos/curl.mp4",
  "videos/deadbug.mp4",
  "videos/facepull.mp4",
  "videos/hinge.mp4",
  "videos/incline.mp4",
  "videos/lateral.mp4",
  "videos/legcurl.mp4",
  "videos/legcurl2.mp4",
  "videos/legext.mp4",
  "videos/legpress.mp4",
  "videos/ohp.mp4",
  "videos/plank.mp4",
  "videos/pulldown.mp4",
  "videos/pushdown.mp4",
  "videos/pushup.mp4",
  "videos/revfly.mp4",
  "videos/row1.mp4",
  "videos/splank.mp4",
  "videos/split.mp4",
  "videos/squat.mp4",
  "videos/srow.mp4",
  "videos/thrust.mp4",
  "videos/w_arms.mp4",
  "videos/w_squat.mp4",
  "videos/walk.mp4"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE.map(u => new Request(u, { cache: "reload" })))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== "coach-lib").map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  const same = u.origin === location.origin;
  const font = /fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if (!same && !font) return;                       // Gemini / الخرائط / يوتيوب: مباشرة من النت
  const media = /\.(mp4|webm|png|jpe?g|webp|svg|woff2?)$/i.test(u.pathname) || font;
  if (!media){
    // الكود: النت أول
    // طلب الصفحة (navigate) ما ينفع يتنسخ مع خيارات — كان يفشل دايماً ويرجع النسخة القديمة
    e.respondWith(fetch(r.mode === "navigate" ? r.url : r, { cache: "no-cache" }).then(res => {
      if (res.ok){ const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); }
      return res;
    }).catch(() => caches.match(r).then(hit => hit || caches.match("index.html"))));
    return;
  }
  // الفيديو والصور: المخزن أول. فيديوهات المكتبة تنحفظ أول ما تفتحها
  const bucket = same && u.pathname.includes("/lib/") ? "coach-lib" : CACHE;
  e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => {
    if (res.ok || res.type === "opaque"){ const cp = res.clone(); caches.open(bucket).then(c => c.put(r, cp)); }
    return res;
  })));
});
