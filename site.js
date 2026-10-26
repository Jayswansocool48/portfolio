(function () {
  const S = window.STUDIO || {};
  const visible = list => (list || []).filter(x => x.show !== false);
  const GAMES = visible(window.GAMES).map(g => ({ ...g, kind: "game" }));
  const ASSETS = visible(window.ASSETS).map(a => ({ ...a, kind: "asset" }));
  const ITEMS = [...GAMES, ...ASSETS];
  const CATS = window.CATEGORIES || {};
  const page = document.body.dataset.page;
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };
  const transition = fn => (document.startViewTransition && !reduced) ? document.startViewTransition(fn) : fn();
  const priceNum = p => p.price ? parseFloat(String(p.price).replace(/[^0-9.]/g, "")) : Infinity;

  $$("[data-year]").forEach(el => { el.textContent = new Date().getFullYear(); });

  // ---- Smooth scrolling ---------------------------------------------------
  let lenis = null;
  if (window.Lenis && !reduced) {
    lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95, anchors: false });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  const lock = () => lenis && lenis.stop();
  const unlock = () => { if (lenis && !document.querySelector("dialog[open]")) lenis.start(); };

  // ---- Reveal sections as you reach them ---------------------------------
  if (!reduced && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("shown"); io.unobserve(e.target); }
    }), { rootMargin: "0px 0px -8% 0px" });
    $$(".reveal").forEach(el => io.observe(el));
  } else {
    $$(".reveal").forEach(el => el.classList.add("shown"));
  }

  // ---- Theme ------------------------------------------------------------
  const themeBtn = $(".theme");
  const isDark = () => {
    const t = document.documentElement.dataset.theme;
    return t ? t === "dark" : !matchMedia("(prefers-color-scheme: light)").matches;
  };
  const labelTheme = () => themeBtn.setAttribute("aria-label", isDark() ? "Switch to light theme" : "Switch to dark theme");
  labelTheme();
  function toggleTheme() {
    const next = isDark() ? "light" : "dark";
    transition(() => { document.documentElement.dataset.theme = next; });
    store.set("theme", next);
    labelTheme();
  }
  themeBtn.addEventListener("click", toggleTheme);

  // ---- Toast --------------------------------------------------------------
  const toast = $("#toast");
  let toastTimer;
  function say(msg) {
    toast.textContent = msg;
    toast.classList.add("on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("on"), 2000);
  }

  // ---- Socials and contact details ----------------------------------------
  const SOCIAL_NAMES = { itch: "itch.io", youtube: "YouTube", github: "GitHub", steam: "Steam", twitter: "X (Twitter)", instagram: "Instagram" };
  const socials = Object.entries(S.socials || {}).filter(([, url]) => url);
  if (socials.length) {
    $$("[data-socials]").forEach(box => {
      box.innerHTML = socials.map(([k, url]) => `<a href="${esc(url)}" rel="noopener me">${esc(SOCIAL_NAMES[k] || k)}</a>`).join("");
      box.parentElement.hidden = false;
    });
  }
  $$("[data-email]").forEach(a => { a.href = "mailto:" + S.email; a.textContent = S.email; });
  $$("[data-discord]").forEach(el => { el.textContent = S.discord; });
  $$(".copy").forEach(btn => btn.addEventListener("click", async () => {
    const value = S[btn.dataset.copy];
    try { await navigator.clipboard.writeText(value); say("Copied " + value); }
    catch (e) {
      const range = document.createRange();
      range.selectNodeContents(btn.previousElementSibling);
      const sel = getSelection(); sel.removeAllRanges(); sel.addRange(range);
      say("Selected. Press Ctrl+C to copy");
    }
  }));

  // ---- Cover art: a dithered lantern glow in each project's color ---------
  const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  function hash(s) { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }
  function drawCover(canvas, item) {
    const W = 200, H = 125, ctx = canvas.getContext("2d");
    canvas.width = W; canvas.height = H;
    const t = hex(item.tint || "#e5a24c"), base = [12, 14, 15];
    const ramp = [0, .18, .38, .62, .9].map(k => base.map((b, i) => Math.round(b + (t[i] - b) * k)));
    const h = hash(item.id);
    const cx = 40 + (h % 120), cy = 26 + ((h >> 8) % 40), floor = 78 + ((h >> 16) % 18);
    const img = ctx.createImageData(W, H), d = img.data;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let v = Math.max(0, 1 - Math.hypot((x - cx) * .8, y - cy) / 95);
      if (y > floor) v = v * .55 + Math.max(0, .25 - Math.abs(x - cx) / 300) * (1 - (y - floor) / (H - floor));
      const level = Math.min(.999, v) * (ramp.length - 1), lo = Math.floor(level);
      const c = ramp[(level - lo) * 16 > bayer[(y & 3) * 4 + (x & 3)] ? lo + 1 : lo];
      const i = (y * W + x) * 4; d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }
  const coverHTML = item => item.images && item.images[0]
    ? `<div class="cover" style="--tint:${esc(item.images[0].tint || item.tint)}"><img src="${esc(item.images[0].src)}" alt="${esc(item.images[0].alt)}" loading="lazy" decoding="async" onload="this.classList.add('loaded')"></div>`
    : `<div class="cover"><canvas data-cover="${esc(item.id)}" aria-hidden="true"></canvas></div>`;
  function paintCovers(root = document) {
    root.querySelectorAll("canvas[data-cover]").forEach(c => {
      const item = ITEMS.find(i => i.id === c.dataset.cover);
      if (item) drawCover(c, item);
    });
  }

  // ---- Cards -------------------------------------------------------------
  const live = s => /development|building/i.test(s);
  function card(item) {
    const meta = item.kind === "asset" ? `${CATS[item.category] || ""} · ${item.engine || ""}` : (item.tags || []).slice(0, 2).join(" · ");
    const right = item.kind === "asset" && item.price && item.buy
      ? `<span class="price num">${esc(item.price)}</span><a class="btn small" href="${esc(item.buy.href)}" rel="noopener">${esc(item.buy.label)}</a>`
      : `<span class="chip${live(item.status) ? " live" : ""}">${esc(item.status)}</span>`;
    return `<article class="card" style="view-transition-name: card-${esc(item.id)}">
      <button class="card-main" type="button" data-id="${esc(item.id)}" aria-haspopup="dialog">
        ${coverHTML(item)}
        <span class="card-text">
          <span class="card-meta">${esc(meta)}</span>
          <span class="card-title">${esc(item.name)}</span>
          <span class="card-sum">${esc(item.summary)}</span>
        </span>
      </button>
      <div class="card-foot">${right}</div>
    </article>`;
  }
  function renderCards(el, list, empty) {
    el.innerHTML = list.length ? list.map(card).join("") : `<div class="empty">${empty}</div>`;
    paintCovers(el);
  }
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-id]");
    if (b && b.closest(".cards")) location.hash = b.dataset.id;
  });

  // ---- Home ---------------------------------------------------------------
  if (page === "home") {
    renderCards($("#home-games"), GAMES.filter(g => g.featured).slice(0, 4), "No games yet.");
    renderCards($("#home-assets"), ASSETS.filter(a => a.featured).slice(0, 2), "Nothing in the store yet.");

    const track = $("#carousel");
    GAMES.filter(g => g.current && g.id !== "after-hours").forEach(g => {
      track.insertAdjacentHTML("beforeend", `
        <article class="slide" aria-roledescription="slide" aria-labelledby="slide-${esc(g.id)}">
          <div class="slide-art">${coverHTML(g)}</div>
          <div class="slide-copy">
            <p class="meta">${esc((g.tags || [])[0] || "Game")} &middot; ${esc(g.status)}</p>
            <h3 class="slide-title" id="slide-${esc(g.id)}">${esc(g.name)}</h3>
            <p>${esc((g.about || [g.summary])[0])}</p>
            <a class="btn" href="#${esc(g.id)}">Read more</a>
          </div>
        </article>`);
    });
    paintCovers(track);
    const slides = [...track.children], dots = $("#dots");
    dots.innerHTML = slides.map((s, i) => `<button type="button" role="tab" aria-label="Show ${esc(s.querySelector(".slide-title").textContent)}" aria-selected="${i === 0}"></button>`).join("");
    if (slides.length < 2) { $(".car-ctrl").hidden = true; dots.hidden = true; }
    const go = i => {
      const n = (i + slides.length) % slides.length;
      track.scrollTo({ left: slides[n].offsetLeft - track.offsetLeft, behavior: reduced ? "auto" : "smooth" });
    };
    const current = () => Math.round(track.scrollLeft / track.clientWidth);
    track.addEventListener("scroll", () => {
      const i = current();
      [...dots.children].forEach((d, j) => d.setAttribute("aria-selected", String(i === j)));
    }, { passive: true });
    dots.addEventListener("click", e => { const b = e.target.closest("button"); if (b) go([...dots.children].indexOf(b)); });
    $$(".car-btn").forEach(b => b.addEventListener("click", () => go(current() + +b.dataset.dir)));
  }

  // ---- Games page --------------------------------------------------------
  function chips(el, options, active, onPick) {
    el.innerHTML = options.map(([k, label, n]) =>
      `<button type="button" role="tab" data-k="${esc(k)}" aria-selected="${k === active}"${n === 0 ? " disabled" : ""}>${esc(label)} <b class="num">${n}</b></button>`).join("");
    el.onclick = e => { const b = e.target.closest("button"); if (b && !b.disabled) onPick(b.dataset.k); };
    el.onkeydown = e => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const btns = [...el.querySelectorAll("button:not([disabled])")];
      const i = btns.indexOf(document.activeElement);
      const next = btns[(i + (e.key === "ArrowRight" ? 1 : -1) + btns.length) % btns.length];
      next.focus(); next.click();
    };
  }
  if (page === "games") {
    const tags = [...new Set(GAMES.flatMap(g => g.tags || []))];
    let genre = "all";
    const draw = () => {
      chips($("#genre-filter"), [["all", "All", GAMES.length], ...tags.map(t => [t, t, GAMES.filter(g => g.tags.includes(t)).length])], genre,
        k => { genre = k; transition(draw); });
      const list = genre === "all" ? GAMES : GAMES.filter(g => g.tags.includes(genre));
      $("#games-count").textContent = `${list.length} ${list.length === 1 ? "game" : "games"}`;
      renderCards($("#games-grid"), list, "No games in this genre yet.");
    };
    draw();
  }

  // ---- Store page --------------------------------------------------------
  if (page === "store") {
    let cat = "all", sort = $("#sort").value;
    const order = {
      featured: (a, b) => (b.featured === true) - (a.featured === true),
      newest: (a, b) => String(b.added).localeCompare(String(a.added)),
      low: (a, b) => priceNum(a) - priceNum(b),
      high: (a, b) => (priceNum(b) === Infinity ? -1 : priceNum(b)) - (priceNum(a) === Infinity ? -1 : priceNum(a)),
    };
    const draw = () => {
      chips($("#cat-filter"), [["all", "All", ASSETS.length], ...Object.entries(CATS).map(([k, l]) => [k, l, ASSETS.filter(a => a.category === k).length])], cat,
        k => { cat = k; transition(draw); });
      const list = (cat === "all" ? ASSETS : ASSETS.filter(a => a.category === cat)).slice().sort(order[sort]);
      renderCards($("#store-grid"), list, "Nothing in this category yet.");
    };
    $("#sort").addEventListener("change", e => { sort = e.target.value; transition(draw); });
    draw();
  }

  // ---- About page --------------------------------------------------------
  if (page === "about") {
    const years = new Date().getFullYear() - (S.since || 2020);
    const stats = [
      [years, years === 1 ? "year making games" : "years making games"],
      [GAMES.length, GAMES.length === 1 ? "game in development" : "games in development"],
      [ASSETS.length, ASSETS.length === 1 ? "asset pack in progress" : "asset packs in progress"],
      [3, "engines I build in"],
    ];
    $("#stats").innerHTML = stats.map(([n, l]) => `<div><dt class="num">${n}</dt><dd>${l}</dd></div>`).join("");
  }

  // ---- Contact form: opens the visitor's own email app --------------------
  if (page === "contact") {
    const form = $("#mail-form");
    form.addEventListener("submit", e => {
      e.preventDefault();
      const msg = $("#f-msg"), ok = $("#f-ok");
      const noMsg = !msg.value.trim(), noOk = !ok.checked;
      $("#f-msg-err").hidden = !noMsg; msg.setAttribute("aria-invalid", String(noMsg));
      $("#f-ok-err").hidden = !noOk; ok.setAttribute("aria-invalid", String(noOk));
      if (noMsg) return msg.focus();
      if (noOk) return ok.focus();
      const name = $("#f-name").value.trim();
      const subject = `${$("#f-topic").value}${name ? " from " + name : ""}`;
      location.href = `mailto:${S.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(msg.value.trim() + (name ? "\n\n" + name : ""))}`;
      say("Opening your email app");
    });
  }

  // ---- Mobile menu --------------------------------------------------------
  const menu = $("#menu");
  $(".menu-open").addEventListener("click", () => { menu.showModal(); lock(); requestAnimationFrame(() => menu.classList.add("in")); });
  menu.addEventListener("click", e => { if (e.target === menu) menu.close(); });
  menu.addEventListener("close", () => { menu.classList.remove("in"); unlock(); });

  // ---- Detail sheet ------------------------------------------------------
  const sheet = $("#sheet"), body = sheet.querySelector(".sheet-body");
  let opener = null;

  function fill(p) {
    $("#sheet-cover").innerHTML = coverHTML(p);
    paintCovers($("#sheet-cover"));
    $("#sheet-kind").textContent = p.kind === "asset" ? (CATS[p.category] || "Asset") : "Game";
    $("#sheet-title").textContent = p.name;
    $("#sheet-meta").textContent = [p.status, p.engine, p.price].filter(Boolean).join(" · ");
    $("#sheet-tags").innerHTML = (p.tags || []).map(t => `<li>${esc(t)}</li>`).join("");
    $("#sheet-about").innerHTML = (p.about || [p.summary]).map(t => `<p>${esc(t)}</p>`).join("");
    const more = (p.images || []).slice(1);
    $("#sheet-media").innerHTML = more.length
      ? more.map(im => `<div class="shot" style="--tint:${esc(im.tint || p.tint)}"><img src="${esc(im.src)}" alt="${esc(im.alt)}" loading="lazy" decoding="async" onload="this.classList.add('loaded')"></div>`).join("")
      : `<p class="media-note">Screenshots go up as soon as there&rsquo;s something to show.</p>`;
    const links = [...(p.buy ? [p.buy] : []), ...(p.links || [])];
    $("#sheet-links").innerHTML = links.map((l, i) => `<a class="${i === 0 && p.buy ? "btn" : "btn ghost"}" href="${esc(l.href)}" rel="noopener">${esc(l.label)}</a>`).join("");
  }
  function openSheet(p) {
    if (!sheet.open) opener = document.activeElement;
    fill(p);
    body.scrollTop = 0;
    if (!sheet.open) sheet.showModal();
    lock();
    requestAnimationFrame(() => sheet.classList.add("in"));
  }
  function closeSheet() {
    if (!sheet.open) return;
    sheet.classList.remove("in");
    body.style.transform = "";
    const finish = () => {
      if (sheet.classList.contains("in")) return;
      sheet.close(); unlock();
      if (opener && opener.focus) opener.focus({ preventScroll: true });
    };
    reduced ? finish() : body.addEventListener("transitionend", finish, { once: true });
  }
  const isItemHash = () => ITEMS.some(x => "#" + x.id === location.hash);
  function route() {
    const p = ITEMS.find(x => x.id === decodeURIComponent(location.hash.slice(1)));
    p ? openSheet(p) : closeSheet();
  }
  const dismiss = () => isItemHash() ? history.back() : closeSheet();
  addEventListener("hashchange", route);
  sheet.addEventListener("cancel", e => { e.preventDefault(); dismiss(); });
  sheet.addEventListener("click", e => { if (e.target === sheet) dismiss(); });
  sheet.querySelector(".close").addEventListener("click", dismiss);

  // Drag to dismiss: down on phones, right on desktop. Let go early and it springs back.
  let drag = null;
  body.addEventListener("pointerdown", e => {
    if (e.button !== 0 || e.target.closest("a, button, img")) return;
    const phone = matchMedia("(max-width: 700px)").matches;
    if (phone && body.scrollTop > 0) return;
    drag = { phone, x: e.clientX, y: e.clientY, d: 0, id: e.pointerId, live: false };
  });
  body.addEventListener("pointermove", e => {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag.phone ? e.clientY - drag.y : e.clientX - drag.x;
    const cross = drag.phone ? Math.abs(e.clientX - drag.x) : Math.abs(e.clientY - drag.y);
    if (!drag.live) {
      if (d > 8 && d > cross) { drag.live = true; sheet.classList.add("dragging"); body.setPointerCapture(e.pointerId); }
      else if (cross > 8) { drag = null; return; }
      else return;
    }
    drag.d = Math.max(0, d);
    body.style.transform = drag.phone ? `translateY(${drag.d}px)` : `translateX(${drag.d}px)`;
  });
  const endDrag = () => {
    if (!drag) return;
    const far = drag.live && drag.d > (drag.phone ? body.offsetHeight : body.offsetWidth) * 0.25;
    sheet.classList.remove("dragging");
    body.style.transform = "";
    drag = null;
    if (far) dismiss();
  };
  body.addEventListener("pointerup", endDrag);
  body.addEventListener("pointercancel", endDrag);

  // ---- Command menu (Ctrl+K) ---------------------------------------------
  const cmdk = $("#cmdk"), input = $("#cmdk-input"), listEl = $("#cmdk-list");
  const actions = [
    ...ITEMS.map(p => ({ label: p.name, hint: p.kind === "asset" ? "Store" : "Game", terms: (p.tags || []).join(" ") + " " + p.summary, run: () => { location.hash = p.id; } })),
    ...[["Home", "index.html"], ["Games", "games.html"], ["Store", "store.html"], ["About", "about.html"], ["Contact", "contact.html"], ["Refund policy", "refunds.html"], ["Privacy", "privacy.html"], ["Terms", "terms.html"]]
      .map(([label, href]) => ({ label, hint: "Page", run: () => { location.href = href; } })),
    { label: "Copy email address", hint: "Contact", run: async () => { try { await navigator.clipboard.writeText(S.email); say("Copied " + S.email); } catch (e) { say(S.email); } } },
    { label: "Toggle light and dark", hint: "Theme", run: toggleTheme },
  ];
  let matches = actions, sel = 0;
  function renderCmd() {
    const q = input.value.trim().toLowerCase();
    matches = q ? actions.filter(a => (a.label + " " + a.hint + " " + (a.terms || "")).toLowerCase().includes(q)) : actions;
    sel = Math.min(sel, Math.max(0, matches.length - 1));
    listEl.innerHTML = matches.length
      ? matches.map((a, i) => `<li role="option" id="opt-${i}" data-i="${i}" aria-selected="${i === sel}"><span>${esc(a.label)}</span><span>${esc(a.hint)}</span></li>`).join("")
      : `<li class="none">No matches for &ldquo;${esc(input.value)}&rdquo;</li>`;
    input.setAttribute("aria-activedescendant", matches.length ? `opt-${sel}` : "");
    const cur = listEl.querySelector('[aria-selected="true"]');
    if (cur) cur.scrollIntoView({ block: "nearest" });
  }
  function openCmd() {
    if (cmdk.open) return;
    if (sheet.open) dismiss();
    if (menu.open) menu.close();
    input.value = ""; sel = 0; renderCmd();
    cmdk.showModal(); input.focus(); lock();
    requestAnimationFrame(() => cmdk.classList.add("in"));
  }
  const closeCmd = () => cmdk.close();
  function runSel(i) { const a = matches[i]; if (!a) return; closeCmd(); a.run(); }
  $(".cmd-open").addEventListener("click", openCmd);
  cmdk.addEventListener("close", () => { cmdk.classList.remove("in"); unlock(); });
  input.addEventListener("input", () => { sel = 0; renderCmd(); });
  input.addEventListener("keydown", e => {
    if (e.key === "ArrowDown") { e.preventDefault(); sel = (sel + 1) % Math.max(1, matches.length); renderCmd(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); sel = (sel - 1 + matches.length) % Math.max(1, matches.length); renderCmd(); }
    else if (e.key === "Enter") { e.preventDefault(); runSel(sel); }
  });
  listEl.addEventListener("click", e => { const li = e.target.closest("[data-i]"); if (li) runSel(+li.dataset.i); });
  cmdk.addEventListener("click", e => { if (e.target === cmdk) closeCmd(); });
  addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); cmdk.open ? closeCmd() : openCmd(); }
  });
  if (/Mac|iPhone|iPad/.test(navigator.platform)) $$(".cmd-open kbd").forEach(k => { k.textContent = "⌘ K"; });

  route();
})();
