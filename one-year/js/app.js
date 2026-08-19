/* ==========================================================================
   ♡  app.js — all the logic.  Content lives in js/config.js, edit that instead.
   ========================================================================== */
(() => {
"use strict";

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const rand = (a, b) => a + Math.random() * (b - a);
const reducedMotion = () =>
  typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const esc = s => String(s).replace(/[&<>"']/g, c =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ═══════════════════ 0 · SHA-256 (works offline & on file://) ═══════════════ */
/* Web Crypto isn't available on file:// in some browsers, so we ship a tiny
   pure-JS fallback. Same algorithm, same output. */
function sha256Sync(ascii) {
  const rr = (v, a) => (v >>> a) | (v << (32 - a));
  const maxWord = 2 ** 32;
  let result = "", words = [], i, j;
  const bitLen = ascii.length * 8;
  let hash = sha256Sync.h = sha256Sync.h || [];
  const k = sha256Sync.k = sha256Sync.k || [];
  let primeCounter = k.length;
  const composite = {};
  for (let cand = 2; primeCounter < 64; cand++) {
    if (!composite[cand]) {
      for (i = 0; i < 313; i += cand) composite[i] = cand;
      hash[primeCounter] = (Math.pow(cand, .5) * maxWord) | 0;
      k[primeCounter++]  = (Math.pow(cand, 1 / 3) * maxWord) | 0;
    }
  }
  ascii += "\x80";
  while (ascii.length % 64 - 56) ascii += "\x00";
  for (i = 0; i < ascii.length; i++) {
    j = ascii.charCodeAt(i);
    words[i >> 2] |= j << ((3 - i) % 4) * 8;
  }
  words[words.length] = (bitLen / maxWord) | 0;
  words[words.length] = bitLen;
  for (j = 0; j < words.length;) {
    const w = words.slice(j, j += 16);
    const oldHash = hash;
    hash = hash.slice(0, 8);
    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2];
      const a = hash[0], e = hash[4];
      const t1 = hash[7]
        + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25))
        + ((e & hash[5]) ^ (~e & hash[6])) + k[i]
        + (w[i] = i < 16 ? w[i] : (w[i - 16]
            + (rr(w15, 7) ^ rr(w15, 18) ^ (w15 >>> 3)) + w[i - 7]
            + (rr(w2, 17) ^ rr(w2, 19) ^ (w2 >>> 10))) | 0);
      const t2 = (rr(a, 2) ^ rr(a, 13) ^ rr(a, 22))
        + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      hash = [(t1 + t2) | 0].concat(hash);
      hash[4] = (hash[4] + t1) | 0;
    }
    for (i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
  }
  for (i = 0; i < 8; i++)
    for (j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? "0" : "") + b.toString(16);
    }
  return result;
}
async function sha256(str) {
  const bytes = new TextEncoder().encode(str);
  if (window.crypto?.subtle) {
    try {
      const buf = await crypto.subtle.digest("SHA-256", bytes);
      return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
    } catch (_) { /* fall through */ }
  }
  let s = ""; for (const b of bytes) s += String.fromCharCode(b);
  return sha256Sync(s);
}

/* ═══════════════════ 1 · STARFIELD + DRIFTING HEARTS ═══════════════════ */
(function sky() {
  const c = $("#sky"), ctx = c && c.getContext && c.getContext("2d");
  if (!ctx) return;                       // no canvas? the site still works fine.
  let W, H, stars = [], hearts = [], raf;
  const DPR = Math.min(devicePixelRatio || 1, 2);

  function resize() {
    W = c.width = innerWidth * DPR; H = c.height = innerHeight * DPR;
    c.style.width = innerWidth + "px"; c.style.height = innerHeight + "px";
    const n = Math.round(innerWidth * innerHeight / 9000);
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: rand(.4, 1.5) * DPR, a: rand(.15, .8), t: rand(0, 6.28), s: rand(.6, 2.2)
    }));
    hearts = Array.from({ length: 16 }, () => newHeart(true));
  }
  function newHeart(spread) {
    return { x: Math.random() * W, y: spread ? Math.random() * H : H + 30 * DPR,
             sz: rand(7, 16) * DPR, sp: rand(.15, .5) * DPR, sw: rand(.4, 1.4),
             t: rand(0, 6.28), a: rand(.08, .28),
             col: ["#ff8fbc", "#b9a7ff", "#8ce8cb", "#ffc978"][(Math.random() * 4) | 0] };
  }
  function heartPath(x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x, y + s * .3);
    ctx.bezierCurveTo(x, y, x - s / 2, y, x - s / 2, y + s * .3);
    ctx.bezierCurveTo(x - s / 2, y + s * .6, x, y + s * .8, x, y + s);
    ctx.bezierCurveTo(x, y + s * .8, x + s / 2, y + s * .6, x + s / 2, y + s * .3);
    ctx.bezierCurveTo(x + s / 2, y, x, y, x, y + s * .3);
    ctx.closePath();
  }
  let tick = 0;
  function loop() {
    tick += .016; ctx.clearRect(0, 0, W, H);
    for (const s of stars) {
      const a = s.a * (.55 + .45 * Math.sin(tick * s.s + s.t));
      ctx.globalAlpha = a; ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
    }
    for (let i = 0; i < hearts.length; i++) {
      const h = hearts[i];
      h.y -= h.sp; h.t += .01;
      const x = h.x + Math.sin(h.t * 1.6) * h.sw * 14;
      ctx.globalAlpha = h.a; ctx.fillStyle = h.col;
      heartPath(x, h.y, h.sz); ctx.fill();
      if (h.y < -40 * DPR) hearts[i] = newHeart(false);
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(loop);
  }
  addEventListener("resize", resize);
  resize();
  if (!reducedMotion()) loop();
  else { ctx.globalAlpha = .5; for (const s of stars) { ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill(); } }
})();

/* burst of hearts from a point — used on unlock & on winning the game */
function burst(x, y, n = 26) {
  for (let i = 0; i < n; i++) {
    const el = document.createElement("div");
    el.textContent = ["♡", "💗", "✧", "🩷", "♥"][(Math.random() * 5) | 0];
    const ang = rand(0, 6.283), dist = rand(60, 260);
    Object.assign(el.style, {
      position: "fixed", left: x + "px", top: y + "px", zIndex: 999,
      fontSize: rand(12, 26) + "px", pointerEvents: "none",
      transition: `transform ${rand(.7,1.5)}s cubic-bezier(.1,.8,.3,1), opacity 1.2s`
    });
    document.body.appendChild(el);
    requestAnimationFrame(() => {
      el.style.transform =
        `translate(${Math.cos(ang) * dist}px, ${Math.sin(ang) * dist - 60}px) rotate(${rand(-220,220)}deg)`;
      el.style.opacity = "0";
    });
    setTimeout(() => el.remove(), 1700);
  }
}

/* ═══════════════════ 2 · TYPEWRITER ═══════════════════ */
async function type(el, text, speed = 26) {
  for (const ch of text) { el.append(ch); await sleep(ch === "\n" ? speed * 4 : speed); }
}
async function typeHTML(el, html, speed = 12) {
  const span = document.createElement("span");
  el.appendChild(span);
  const tmp = document.createElement("div"); tmp.innerHTML = html;
  const txt = tmp.textContent;
  for (let i = 1; i <= txt.length; i++) { span.textContent = txt.slice(0, i); await sleep(speed); }
  span.innerHTML = html;
}

/* ═══════════════════ 3 · THE GATE ═══════════════════ */
const BOOT = [
  ["$ ssh us@memories.local", "dim", 14],
  ["\n  connecting", "dim", 14],
  [" ... ", "dim", 110],
  ["ok\n", "ok", 14],
  ["  loading 365 days", "dim", 14],
  [" ... ", "dim", 110],
  ["ok\n", "ok", 14],
  ["  decrypting feelings", "dim", 14],
  [" ... ", "dim", 130],
  ["ok\n", "ok", 14],
  ["\n  AUTHENTICATION REQUIRED\n", "", 18],
];

(async function gate() {
  const boot = $("#boot"), form = $("#gate-form"), input = $("#pw"),
        msg  = $("#pw-msg"), card = $(".gate-card");
  $("#pw-label").textContent = CONFIG.passwordPrompt || "enter the password";

  for (const [txt, cls, sp] of BOOT) {
    const s = document.createElement("span");
    if (cls) s.className = cls;
    boot.appendChild(s);
    for (const ch of txt) { s.append(ch); await sleep(sp); }
  }
  form.hidden = false; input.focus();

  let tries = 0;
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const val = input.value;
    if (!val) return;

    const plain = (CONFIG.passwordPlain || "").trim();
    const ok = plain
      ? val.trim().toLowerCase() === plain.toLowerCase()
      : (await sha256(val.trim().toLowerCase())) === (CONFIG.passwordHash || "").toLowerCase()
        || (await sha256(val.trim()))           === (CONFIG.passwordHash || "").toLowerCase();

    if (ok) {
      msg.className = "pw-msg"; msg.textContent = "✓ verified. hi you.";
      input.disabled = true;
      const r = card.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, 34);
      await sleep(700);
      $("#gate").classList.add("out");
      await sleep(620);
      $("#gate").remove();
      enter();
    } else {
      tries++;
      card.classList.remove("shake"); void card.offsetWidth; card.classList.add("shake");
      input.value = "";
      const wrong = ["nope. try again ♡", "not it, but cute try", "hmm. think about us.",
                     "access denied (affectionately)"];
      msg.className = "pw-msg err";
      msg.textContent = wrong[Math.min(tries - 1, wrong.length - 1)];
      if (tries >= 3 && CONFIG.passwordHint) {
        msg.className = "pw-msg hint";
        msg.textContent = CONFIG.passwordHint;
      }
    }
  });
})();

/* ═══════════════════ 4 · ENTERING THE SITE ═══════════════════ */
async function enter() {
  const app = $("#app");
  app.hidden = false;
  buildCalendar(); startCounter(); seedJars(); wireJars(); revealOnScroll();
  $("#foot-names").textContent = `${CONFIG.theirName} & ${CONFIG.yourName}`;

  const g = $("#granted");
  await type(g, "ACCESS", 55); await sleep(150);
  await type(g, "\nGRANTED", 55);
  g.innerHTML = `<span class="glitch">ACCESS<br>GRANTED</span>`;
  await sleep(400);
  $("#hero-sub").classList.add("show");
  await sleep(300);
  $(".env-wrap").classList.add("show");
}

/* ── the envelope → the letter ── */
$("#envelope").addEventListener("click", async function () {
  if (this.classList.contains("open")) { openLetter(); return; }
  this.classList.add("open");
  const r = this.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 3, 20);
  await sleep(650);
  openLetter();
});

async function openLetter() {
  const sec = $("#letter");
  if (sec.hidden) {
    const L = CONFIG.letter;
    $("#l-greeting").textContent = L.greeting;
    $("#l-body").innerHTML = L.paragraphs.map(p => `<p>${esc(p)}</p>`).join("");
    $("#l-signoff").textContent = L.signoff;
    $("#l-signature").textContent = L.signature;
    sec.hidden = false;
  }
  await sleep(60);
  sec.scrollIntoView({ behavior: "smooth", block: "start" });
}

$("#close-letter").addEventListener("click", () => {
  $("#envelope").classList.remove("open");
  $("#letter").hidden = true;
  $("#cal-section").scrollIntoView({ behavior: "smooth", block: "start" });
});

/* ═══════════════════ 5 · CALENDAR ═══════════════════ */
function buildCalendar() {
  const { year, month, day } = CONFIG.anniversary;   // month is 1-indexed
  const grid = $("#cal-grid");
  const monthName = new Date(year, month - 1, 1)
    .toLocaleString("en-US", { month: "long" });
  $("#cal-title").textContent = `${monthName} ${year}`;
  grid.setAttribute("aria-label", `${monthName} ${year}`);

  for (const d of ["S", "M", "T", "W", "T", "F", "S"]) {
    const el = document.createElement("div");
    el.className = "cal-dow"; el.textContent = d; grid.appendChild(el);
  }
  const first = new Date(year, month - 1, 1).getDay();
  const days  = new Date(year, month, 0).getDate();
  const now   = new Date();

  for (let i = 0; i < first; i++) {
    const b = document.createElement("div"); b.className = "cal-day blank"; grid.appendChild(b);
  }
  for (let d = 1; d <= days; d++) {
    const el = document.createElement("div");
    el.className = "cal-day"; el.textContent = d; el.setAttribute("role", "gridcell");
    const isToday = now.getFullYear() === year && now.getMonth() === month - 1 && now.getDate() === d;
    if (isToday) el.classList.add("today");
    if (d === day) {
      el.classList.add("mark");
      el.setAttribute("aria-label", `${d} — one year together`);
      el.title = "one whole year ♡";
      el.style.cursor = "pointer";
      el.addEventListener("click", e => {
        const r = e.currentTarget.getBoundingClientRect();
        burst(r.left + r.width / 2, r.top + r.height / 2, 22);
      });
    }
    grid.appendChild(el);
  }
}

/* ── live counter ── */
function startCounter() {
  const start = new Date(CONFIG.startDate + "T00:00:00");
  const tickFn = () => {
    let ms = Date.now() - start.getTime();
    if (ms < 0) ms = 0;
    const s = Math.floor(ms / 1000);
    $("#c-d").textContent = Math.floor(s / 86400).toLocaleString();
    $("#c-h").textContent = Math.floor(s / 3600) % 24;
    $("#c-m").textContent = Math.floor(s / 60) % 60;
    $("#c-s").textContent = s % 60;
  };
  tickFn(); setInterval(tickFn, 1000);
  $("#c-label").textContent = `since ${start.toLocaleDateString("en-US",
    { month: "long", day: "numeric", year: "numeric" })} — and counting`;
}

/* ═══════════════════ 6 · JARS ═══════════════════ */
function seedJars() {
  $$(".jar").forEach(jar => {
    const glass = $(".jar-glass", jar);
    for (let i = 0; i < 7; i++) {
      const h = document.createElement("span");
      h.className = "j-heart";
      h.textContent = ["♡", "♥", "✦", "❣"][(Math.random() * 4) | 0];
      h.style.left = rand(12, 76) + "%";
      h.style.animationDuration = rand(3.5, 7.5) + "s";
      h.style.animationDelay = -rand(0, 7) + "s";
      h.style.color = "rgba(255,255,255,.85)";
      glass.appendChild(h);
    }
  });
}

function wireJars() {
  $$(".jar").forEach(jar => jar.addEventListener("click", e => {
    const r = jar.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + 20, 12);
    openModal(jar.dataset.jar);
  }));
}

/* ═══════════════════ 7 · MODAL ═══════════════════ */
const modal = $("#modal"), modalBody = $("#modal-body"), modalTitle = $("#modal-title");
let lastFocus = null;

function openModal(kind) {
  lastFocus = document.activeElement;
  modalBody.innerHTML = "";
  const view = VIEWS[kind];
  modalTitle.textContent = view.title;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  view.render(modalBody);
  $(".modal-x").focus();
}
function closeModal() {
  // stop any playing video
  $$("iframe", modalBody).forEach(f => f.remove());
  modal.hidden = true; modalBody.innerHTML = "";
  document.body.style.overflow = "";
  lastFocus?.focus();
}
$$("[data-close]").forEach(el => el.addEventListener("click", closeModal));
addEventListener("keydown", e => {
  if (e.key === "Escape" && !modal.hidden && !$(".lightbox")) closeModal();
});

const VIEWS = {

  /* ── JAR 0 · songs ─────────────────────────────────────────── */
  songs: {
    title: "🎧 songs that remind me of you",
    render(box) {
      box.innerHTML = CONFIG.songs.map((s, i) => `
        <div class="song" data-i="${i}">
          <div class="song-top">
            <span class="song-num">${String(i + 1).padStart(2, "0")}</span>
            <div class="song-meta">
              <b>${esc(s.title)}</b>
              <span>${esc(s.artist || "")}</span>
            </div>
            <button class="song-play" aria-label="play ${esc(s.title)}">▶</button>
          </div>
          ${s.note ? `<p class="song-note">${esc(s.note)}</p>` : ""}
          <div class="song-frame"></div>
        </div>`).join("");

      $$(".song", box).forEach(card => {
        const btn = $(".song-play", card), frame = $(".song-frame", card);
        const id  = CONFIG.songs[+card.dataset.i].youtubeId;
        btn.addEventListener("click", () => {
          const playing = card.classList.contains("playing");
          $$(".song", box).forEach(c => {
            c.classList.remove("playing");
            $(".song-frame", c).innerHTML = "";
            $(".song-play", c).textContent = "▶";
          });
          if (playing) return;
          card.classList.add("playing");
          btn.textContent = "❚❚";
          frame.innerHTML =
            `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0"
              title="${esc(CONFIG.songs[+card.dataset.i].title)}" allow="autoplay; encrypted-media"
              allowfullscreen loading="lazy"></iframe>`;
          card.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
      });
    }
  },

  /* ── JAR 1 · photos ────────────────────────────────────────── */
  photos: {
    title: "📸 every photo i kept",
    render(box) {
      const P = CONFIG.photos;
      box.innerHTML = `<div class="collage">` + P.map((p, i) => `
        <figure class="polaroid" data-i="${i}">
          <img src="${esc(p.src)}" alt="${esc(p.caption || "us")}" loading="lazy">
          ${p.caption ? `<figcaption>${esc(p.caption)}</figcaption>` : ""}
        </figure>`).join("") + `</div>`;

      // graceful placeholder if a photo hasn't been added to /photos yet
      $$(".polaroid img", box).forEach(img => {
        img.addEventListener("error", () => {
          const d = document.createElement("div");
          d.className = "ph-miss";
          d.innerHTML = `<span>drop<br><b>${esc(img.getAttribute("src"))}</b><br>into the repo ♡</span>`;
          img.replaceWith(d);
        });
      });

      $$(".polaroid", box).forEach(fig =>
        fig.addEventListener("click", () => lightbox(+fig.dataset.i)));
    }
  },

  /* ── JAR 2 · memory match ──────────────────────────────────── */
  game: {
    title: "🃏 memory match — find every pair",
    render(box) { newGame(box); }
  },

  /* ── JAR 3 · love.exe (my pick) ────────────────────────────── */
  terminal: {
    title: "💾 love.exe — type something",
    render(box) { terminal(box); }
  },
};

/* ── lightbox ── */
function lightbox(start) {
  const P = CONFIG.photos;
  let i = start;
  const lb = document.createElement("div");
  lb.className = "lightbox";
  lb.innerHTML = `
    <button class="lb-x" aria-label="close">✕</button>
    <button class="lb-nav lb-prev" aria-label="previous">‹</button>
    <button class="lb-nav lb-next" aria-label="next">›</button>
    <div style="display:grid;place-items:center">
      <img alt=""><div class="lb-cap"></div>
    </div>`;
  const img = $("img", lb), cap = $(".lb-cap", lb);
  const show = () => {
    img.src = P[i].src; img.alt = P[i].caption || "us";
    cap.textContent = P[i].caption || "";
  };
  const move = d => { i = (i + d + P.length) % P.length; show(); };
  show();
  $(".lb-next", lb).onclick = e => { e.stopPropagation(); move(1); };
  $(".lb-prev", lb).onclick = e => { e.stopPropagation(); move(-1); };
  const kill = () => { lb.remove(); removeEventListener("keydown", key); };
  $(".lb-x", lb).onclick = kill;
  lb.onclick = e => { if (e.target === lb) kill(); };
  function key(e) {
    if (e.key === "Escape") kill();
    if (e.key === "ArrowRight") move(1);
    if (e.key === "ArrowLeft") move(-1);
  }
  addEventListener("keydown", key);
  document.body.appendChild(lb);
}

/* ── memory match ── */
function newGame(box) {
  const src = CONFIG.memoryCards.slice(0, 8);
  const deck = [...src, ...src]
    .map(v => ({ v, k: Math.random() }))
    .sort((a, b) => a.k - b.k)
    .map(o => o.v);

  const best = localStorage.getItem("memory-best");
  box.innerHTML = `
    <div class="game-hud">
      <span class="hud-chip">moves <b id="g-moves">0</b></span>
      <span class="hud-chip">pairs <b id="g-pairs">0</b>/8</span>
      <span class="hud-chip">best <b id="g-best">${best ?? "—"}</b></span>
    </div>
    <div class="board" id="board"></div>`;

  const board = $("#board", box);
  board.innerHTML = deck.map((v, i) => {
    const face = typeof v === "object" && v.img
      ? `<img src="${esc(v.img)}" alt="">`
      : esc(v);
    return `<button class="card" data-v="${esc(typeof v === "object" ? v.img : v)}" data-i="${i}">
      <div class="card-in">
        <div class="card-f">♡</div>
        <div class="card-b">${face}</div>
      </div></button>`;
  }).join("");

  let open = [], moves = 0, pairs = 0, lock = false;

  $$(".card", board).forEach(card => card.addEventListener("click", () => {
    if (lock || card.classList.contains("flip") || card.classList.contains("done")) return;
    card.classList.add("flip");
    open.push(card);
    if (open.length < 2) return;

    moves++; $("#g-moves", box).textContent = moves;
    const [a, b] = open;
    if (a.dataset.v === b.dataset.v) {
      a.classList.add("done"); b.classList.add("done");
      open = [];
      pairs++; $("#g-pairs", box).textContent = pairs;
      if (pairs === 8) setTimeout(() => win(box, moves), 550);
    } else {
      lock = true;
      setTimeout(() => {
        a.classList.remove("flip"); b.classList.remove("flip");
        open = []; lock = false;
      }, 750);
    }
  }));
}

function win(box, moves) {
  const best = +localStorage.getItem("memory-best") || Infinity;
  const isBest = moves < best;
  if (isBest) localStorage.setItem("memory-best", moves);
  const r = box.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 3, 40);
  box.innerHTML = `
    <div class="game-win">
      <h4>you did it ♡</h4>
      <p>${esc(CONFIG.memoryWinMessage)}</p>
      <p style="font-size:12px;color:#b39ec6;font-family:var(--mono)">
        ${moves} moves${isBest ? " · new personal best 🏆" : ""}
      </p>
      <button class="btn-pill" id="again">play again</button>
    </div>`;
  $("#again", box).onclick = () => newGame(box);
}

/* ── love.exe terminal ── */
function terminal(box) {
  box.innerHTML = `
    <div class="term">
      <div class="term-out" id="t-out"></div>
      <div class="term-row">
        <span class="term-ps">us@love ~ $</span>
        <input id="t-in" autocomplete="off" spellcheck="false" aria-label="terminal input">
      </div>
    </div>
    <div class="term-chips" id="t-chips"></div>`;

  const out = $("#t-out", box), inp = $("#t-in", box);
  const print = (html, cls = "") => {
    const d = document.createElement("div");
    if (cls) d.className = cls;
    d.innerHTML = html;
    out.appendChild(d);
    out.scrollTop = out.scrollHeight;
  };

  const days = Math.floor((Date.now() - new Date(CONFIG.startDate + "T00:00:00")) / 864e5);
  let usedReasons = [];

  const COMMANDS = {
    help: () => print(
      `<span class="t-dim">available commands:</span>\n` +
      `  <span class="t-cmd">whoami</span>    <span class="t-dim">— who you are to me</span>\n` +
      `  <span class="t-cmd">why</span>       <span class="t-dim">— a random reason i love you</span>\n` +
      `  <span class="t-cmd">days</span>      <span class="t-dim">— the math</span>\n` +
      `  <span class="t-cmd">ls</span>        <span class="t-dim">— what's in here</span>\n` +
      `  <span class="t-cmd">stats</span>     <span class="t-dim">— us, in numbers</span>\n` +
      `  <span class="t-cmd">clear</span>     <span class="t-dim">— tidy up</span>\n` +
      `  <span class="t-dim">…and at least one command i didn't list. keep guessing.</span>`),

    whoami: () => print(`<span class="t-pink">${esc(CONFIG.whoami)}</span>`),

    why: () => {
      if (usedReasons.length >= CONFIG.reasons.length) usedReasons = [];
      let r;
      do { r = CONFIG.reasons[(Math.random() * CONFIG.reasons.length) | 0]; }
      while (usedReasons.includes(r));
      usedReasons.push(r);
      print(`<span class="t-ok">reason #${usedReasons.length}:</span> <span class="t-hi">${esc(r)}</span>`);
    },

    days: () => print(
      `<span class="t-hi">${days.toLocaleString()}</span> days.\n` +
      `<span class="t-dim">${(days * 24).toLocaleString()} hours. ` +
      `${(days * 1440).toLocaleString()} minutes. not nearly enough.</span>`),

    ls: () => print(
      `<span class="t-dim">total 4</span>\n` +
      `drwx------  songs/\n` +
      `drwx------  photos/\n` +
      `drwx------  inside_jokes/   <span class="t-dim">(permission denied — you had to be there)</span>\n` +
      `-rw-r--r--  feelings.txt    <span class="t-dim">(${(days * 1440).toLocaleString()} lines, still writing)</span>`),

    stats: () => print(
      `<span class="t-dim">$ git log --author="us" --oneline | wc -l</span>\n` +
      `<span class="t-hi">${days.toLocaleString()}</span> commits\n` +
      `<span class="t-dim">$ git status</span>\n` +
      `<span class="t-ok">nothing to commit, working tree happy</span>\n` +
      `<span class="t-dim">$ uptime</span>\n` +
      `up ${days} days, 0 crashes, <span class="t-ok">100% uptime</span>`),

    clear: () => { out.innerHTML = ""; },

    exit: () => print(`<span class="t-pink">nope. you're stuck with me. ♡</span>`),

    love: () => print(`<span class="t-pink">love: command found. running forever.</span>`),
  };
  COMMANDS["cat feelings.txt"] = COMMANDS.why;
  COMMANDS["git log"] = COMMANDS.stats;
  COMMANDS[(CONFIG.secretCommand || "sudo hug").toLowerCase()] =
    () => { print(`<span class="t-ok">${esc(CONFIG.secretResponse)}</span>`);
            const r = box.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + 60, 30); };

  const run = raw => {
    const cmd = raw.trim().toLowerCase();
    print(`<span class="t-dim">us@love ~ $</span> <span class="t-cmd">${esc(raw)}</span>`);
    if (!cmd) return;
    if (COMMANDS[cmd]) COMMANDS[cmd]();
    else print(`<span class="t-dim">${esc(cmd)}: command not found. ` +
               `try <span class="t-cmd">help</span> — or just say something nice.</span>`);
  };

  inp.addEventListener("keydown", e => {
    if (e.key !== "Enter") return;
    run(inp.value); inp.value = "";
  });

  ["help", "whoami", "why", "days", "stats", "ls"].forEach(c => {
    const b = document.createElement("button");
    b.className = "chip"; b.textContent = c;
    b.onclick = () => { run(c); inp.focus(); };
    $("#t-chips", box).appendChild(b);
  });

  print(`<span class="t-ok">love.exe v1.0.0</span> <span class="t-dim">— built for one user only.</span>`);
  print(`<span class="t-dim">type</span> <span class="t-cmd">help</span> <span class="t-dim">to begin.</span>`);
  setTimeout(() => inp.focus(), 200);
}

/* ═══════════════════ 8 · SCROLL REVEALS ═══════════════════ */
function revealOnScroll() {
  const targets = [$(".cal-card"), $(".counter"), $(".jars-title"), $(".jars-sub"), ...$$(".jar")];
  targets.forEach((el, i) => {
    if (!el) return;
    el.classList.add("reveal");
    el.style.transitionDelay = (i % 6) * 90 + "ms";
  });
  if (typeof IntersectionObserver !== "function") {   // very old browser: just show it
    targets.forEach(el => el && el.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: .15 });
  targets.forEach(el => el && io.observe(el));
}

/* a small hello for whoever opens devtools */
console.log("%c♡ built with love, and a slightly unreasonable amount of CSS.",
  "color:#ff8fbc;font-size:14px;font-family:monospace");
console.log("%cthe password isn't in here. it's sha-256'd. nice try though 🩷",
  "color:#8ce8cb;font-family:monospace");

})();
