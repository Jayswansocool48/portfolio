(function () {
  const S = window.STUDIO || {};
  const visible = list => (list || []).filter(x => x.show !== false);
  const GAMES = visible(window.GAMES).map(g => ({ ...g, kind: "game" }));
  const ASSETS = visible(window.ASSETS).map(a => ({ ...a, kind: "asset" }));
  const ITEMS = [...GAMES, ...ASSETS];
  const CATS = window.CATEGORIES || {};
  const { spring, stop } = window.Motion;
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

  // ---- Sections spring in as you reach them -------------------------------
  const showNow = el => { el.classList.add("shown"); el.style.opacity = ""; el.style.transform = ""; };
  if (!reduced && "IntersectionObserver" in window) {
    let n = 0;
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const el = e.target;
      spring("reveal-" + n++, {
        from: 0, to: 1, preset: "gentle",
        onUpdate: p => { el.style.opacity = Math.min(1, p); el.style.transform = `translateY(${(1 - p) * 24}px)`; },
        onDone: () => showNow(el),
      });
    }), { rootMargin: "0px 0px -8% 0px" });
    $$(".reveal").forEach(el => io.observe(el));
  } else {
    $$(".reveal").forEach(showNow);
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
  const setToast = p => {
    toast.style.opacity = Math.max(0, Math.min(1, p));
    toast.style.transform = `translate(-50%, ${(1 - p) * 16}px)`;
  };
  function say(msg) {
    toast.textContent = msg;
    spring("toast", { from: 0, to: 1, preset: "snappy", onUpdate: setToast });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => spring("toast", { from: 1, to: 0, preset: "snappy", onUpdate: setToast }), 2000);
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

  // ---- Cover art: a dithered room lit by a doorway, in each project's color --
  const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  function hash(s) { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }
  function drawCover(canvas, item) {
    const W = 200, H = 125, ctx = canvas.getContext("2d");
    canvas.width = W; canvas.height = H;
    const t = hex(item.tint || "#e5a24c"), base = [12, 14, 15];
    const ramp = [0, .16, .34, .58, .9].map(k => base.map((b, i) => Math.round(b + (t[i] - b) * k)));
    const h = hash(item.id);
    // Back wall rectangle and a doorway in it; the vanishing point sits at the doorway.
    const bw = 64 + (h % 28), bh = 40 + ((h >>> 5) % 16);
    const bx = 30 + ((h >>> 9) % (W - bw - 60)), by = 24 + ((h >>> 14) % 18);
    const dw = 12 + ((h >>> 18) % 8), dh = Math.round(bh * .72);
    const dx = bx + 8 + ((h >>> 21) % Math.max(1, bw - dw - 16)), dy = by + bh - dh;
    const lx = dx + dw / 2, ly = by + bh;
    const img = ctx.createImageData(W, H), d = img.data;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let v;
      const onBack = x >= bx && x < bx + bw && y >= by && y < by + bh;
      if (onBack) v = (x >= dx && x < dx + dw && y >= dy) ? 1 : .2;
      else if (y >= by + bh) {
        // Floor: light spills out of the doorway and fades toward you.
        const spread = (y - ly) * 1.1 + dw / 2;
        const inBeam = Math.abs(x - lx) < spread;
        v = .12 + (inBeam ? .62 * (1 - (y - ly) / (H - ly)) * (1 - Math.abs(x - lx) / spread * .6) : 0);
      } else if (y < by) v = .05;
      else v = .14;
      const level = Math.min(.999, v) * (ramp.length - 1), lo = Math.floor(level);
      const c = ramp[(level - lo) * 16 > bayer[(y & 3) * 4 + (x & 3)] ? lo + 1 : lo];
      const i = (y * W + x) * 4; d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }
  window.fadeIn = img => spring("img-" + img.src, { from: 0, to: 1, preset: "gentle", onUpdate: v => { img.style.opacity = v; } });
  const imgTag = (im, fallbackTint) =>
    `<img src="${esc(im.src)}" alt="${esc(im.alt)}" loading="lazy" decoding="async" onload="fadeIn(this)">`;
  const coverHTML = item => item.images && item.images[0]
    ? `<div class="cover" style="--tint:${esc(item.images[0].tint || item.tint)}">${imgTag(item.images[0])}</div>`
    : `<div class="cover"><canvas data-cover="${esc(item.id)}" role="img" aria-label="Cover art for ${esc(item.name)}"></canvas></div>`;
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
    const current = () => Math.round(track.scrollLeft / track.clientWidth);
    const go = i => {
      const n = (i + slides.length) % slides.length;
      const target = slides[n].offsetLeft - track.offsetLeft;
      track.style.scrollSnapType = "none";
      spring("carousel", {
        from: track.scrollLeft, to: target, preset: "sheet",
        onUpdate: v => { track.scrollLeft = v; },
        onDone: () => { track.style.scrollSnapType = ""; },
      });
    };
    // Grab the track mid-glide and your finger wins.
    const release = () => { stop("carousel"); track.style.scrollSnapType = ""; };
    track.addEventListener("pointerdown", release);
    track.addEventListener("wheel", release, { passive: true });
    track.addEventListener("scroll", () => {
      const i = current();
      [...dots.children].forEach((d, j) => d.setAttribute("aria-selected", String(i === j)));
    }, { passive: true });
    dots.addEventListener("click", e => { const b = e.target.closest("button"); if (b) go([...dots.children].indexOf(b)); });
    $$(".car-btn").forEach(b => b.addEventListener("click", () => go(current() + +b.dataset.dir)));
  }

  // ---- Filter chips -------------------------------------------------------
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

  // ---- Games page --------------------------------------------------------
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
    $("#mail-form").addEventListener("submit", e => {
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

  // ---- Panels that slide from an edge (project sheet, phone menu) ---------
  // Each one is a spring on its offset in pixels. A drag hands its release
  // velocity to the spring, so a flick keeps going and a slow drag settles back.
  function slidePanel(dialog, panel, key, axisFor) {
    const scrim = dialog.querySelector(".scrim");
    let pos = 0, onClosed = null;
    const axis = () => axisFor();
    const size = () => (axis() === "y" ? panel.offsetHeight : panel.offsetWidth) || 1;
    const set = v => {
      pos = v;
      panel.style.transform = axis() === "y" ? `translateY(${v}px)` : `translateX(${v}px)`;
      scrim.style.opacity = String(Math.max(0, Math.min(1, 1 - v / size())));
    };
    function open() {
      if (!dialog.open) { dialog.showModal(); set(size()); }
      lock();
      spring(key, { from: pos, to: 0, onUpdate: set });
    }
    function close(velocity = 0, done) {
      if (!dialog.open) return;
      onClosed = done;
      spring(key, {
        from: pos, to: size(), velocity, onUpdate: set,
        onDone: () => { dialog.close(); panel.style.transform = ""; unlock(); onClosed && onClosed(); },
      });
    }
    // Drag
    let drag = null;
    panel.addEventListener("pointerdown", e => {
      if (e.button !== 0 || e.target.closest("a, button, img, input, select, textarea")) return;
      if (axis() === "y" && panel.scrollTop > 0) return;
      drag = { x: e.clientX, y: e.clientY, start: pos, id: e.pointerId, live: false, samples: [] };
    });
    panel.addEventListener("pointermove", e => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = axis() === "y" ? e.clientY - drag.y : e.clientX - drag.x;
      const cross = axis() === "y" ? Math.abs(e.clientX - drag.x) : Math.abs(e.clientY - drag.y);
      if (!drag.live) {
        if (d > 8 && d > cross) { drag.live = true; stop(key); panel.setPointerCapture(e.pointerId); }
        else if (cross > 8) { drag = null; return; }
        else return;
      }
      const v = Math.max(0, drag.start + d);
      set(v);
      drag.samples.push([performance.now(), v]);
      if (drag.samples.length > 5) drag.samples.shift();
    });
    const end = () => {
      if (!drag) return;
      const s = drag.samples, live = drag.live;
      drag = null;
      if (!live) return;
      const vel = s.length > 1 ? (s[s.length - 1][1] - s[0][1]) / ((s[s.length - 1][0] - s[0][0]) / 1000 || 1) : 0;
      if (pos > size() * 0.35 || vel > 700) panel.dispatchEvent(new CustomEvent("flick", { detail: vel }));
      else spring(key, { from: pos, to: 0, velocity: vel, onUpdate: set });
    };
    panel.addEventListener("pointerup", end);
    panel.addEventListener("pointercancel", end);
    return { open, close };
  }

  // Phone menu
  const menu = $("#menu");
  const menuPanel = slidePanel(menu, menu.querySelector(".menu-body"), "menu", () => "x");
  $(".menu-open").addEventListener("click", () => menuPanel.open());
  menu.querySelector(".scrim").addEventListener("click", () => menuPanel.close());
  menu.addEventListener("cancel", e => { e.preventDefault(); menuPanel.close(); });
  menu.querySelector(".menu-body").addEventListener("flick", e => menuPanel.close(e.detail));

  // Project sheet
  const sheet = $("#sheet"), body = sheet.querySelector(".sheet-body");
  const sheetPanel = slidePanel(sheet, body, "sheet", () => matchMedia("(max-width: 700px)").matches ? "y" : "x");
  let opener = null, pendingVelocity = 0;

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
      ? more.map(im => `<div class="shot" style="--tint:${esc(im.tint || p.tint)}">${imgTag(im)}</div>`).join("")
      : `<p class="media-note">I&rsquo;ll post screenshots here as soon as there&rsquo;s something to show.</p>`;
    const links = [...(p.buy ? [p.buy] : []), ...(p.links || [])];
    $("#sheet-links").innerHTML = links.map((l, i) => `<a class="${i === 0 && p.buy ? "btn" : "btn ghost"}" href="${esc(l.href)}" rel="noopener">${esc(l.label)}</a>`).join("");
  }
  function openSheet(p) {
    if (!sheet.open) opener = document.activeElement;
    fill(p);
    body.scrollTop = 0;
    sheetPanel.open();
  }
  function closeSheet() {
    const v = pendingVelocity; pendingVelocity = 0;
    sheetPanel.close(v, () => { if (opener && opener.focus) opener.focus({ preventScroll: true }); });
  }
  const isItemHash = () => ITEMS.some(x => "#" + x.id === location.hash);
  function route() {
    const p = ITEMS.find(x => x.id === decodeURIComponent(location.hash.slice(1)));
    p ? openSheet(p) : closeSheet();
  }
  const dismiss = () => isItemHash() ? history.back() : closeSheet();
  addEventListener("hashchange", route);
  sheet.addEventListener("cancel", e => { e.preventDefault(); dismiss(); });
  sheet.querySelector(".scrim").addEventListener("click", dismiss);
  sheet.querySelector(".close").addEventListener("click", dismiss);
  body.addEventListener("flick", e => { pendingVelocity = e.detail; dismiss(); });

  // ---- Command menu (Ctrl+K) ---------------------------------------------
  const cmdk = $("#cmdk"), input = $("#cmdk-input"), listEl = $("#cmdk-list");
  const box = cmdk.querySelector(".cmdk-box"), cmdScrim = cmdk.querySelector(".scrim");
  const setCmd = p => {
    const c = Math.max(0, Math.min(1, p));
    box.style.opacity = c; cmdScrim.style.opacity = c;
    box.style.transform = `translateY(${(1 - p) * -12}px) scale(${0.97 + 0.03 * p})`;
  };
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
  let cmdP = 0;
  function openCmd() {
    if (sheet.open) dismiss();
    if (menu.open) menuPanel.close();
    if (!cmdk.open) { input.value = ""; sel = 0; renderCmd(); cmdk.showModal(); setCmd(0); }
    input.focus(); lock();
    spring("cmdk", { from: cmdP, to: 1, preset: "snappy", onUpdate: p => { cmdP = p; setCmd(p); } });
  }
  function closeCmd(after) {
    if (!cmdk.open) return;
    spring("cmdk", {
      from: cmdP, to: 0, preset: "snappy", onUpdate: p => { cmdP = p; setCmd(p); },
      onDone: () => { cmdk.close(); unlock(); after && after(); },
    });
  }
  function runSel(i) { const a = matches[i]; if (!a) return; closeCmd(); a.run(); }
  $(".cmd-open").addEventListener("click", openCmd);
  cmdk.addEventListener("cancel", e => { e.preventDefault(); closeCmd(); });
  cmdScrim.addEventListener("click", () => closeCmd());
  input.addEventListener("input", () => { sel = 0; renderCmd(); });
  input.addEventListener("keydown", e => {
    if (e.key === "ArrowDown") { e.preventDefault(); sel = (sel + 1) % Math.max(1, matches.length); renderCmd(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); sel = (sel - 1 + matches.length) % Math.max(1, matches.length); renderCmd(); }
    else if (e.key === "Enter") { e.preventDefault(); runSel(sel); }
  });
  listEl.addEventListener("click", e => { const li = e.target.closest("[data-i]"); if (li) runSel(+li.dataset.i); });
  addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); cmdk.open && cmdP > 0.5 ? closeCmd() : openCmd(); }
  });
  if (/Mac|iPhone|iPad/.test(navigator.platform)) $$(".cmd-open kbd").forEach(k => { k.textContent = "⌘ K"; });

  route();
})();
