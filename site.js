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
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const phone = () => matchMedia("(max-width: 700px)").matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };
  const transition = fn => (document.startViewTransition && !reduced) ? document.startViewTransition(fn) : fn();
  const priceNum = p => p.price ? parseFloat(String(p.price).replace(/[^0-9.]/g, "")) : Infinity;
  const POP = { stiffness: 190, damping: 19, mass: 1 };   // a little overshoot for entrances

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

  // ---- Entrance helpers ---------------------------------------------------
  let keyN = 0;
  function riseIn(el, { delay = 0, distance = 28, opts = POP } = {}) {
    if (reduced) { el.style.opacity = ""; el.style.transform = ""; return; }
    el.style.opacity = 0;
    el.style.transform = `translateY(${distance}px)`;
    setTimeout(() => spring("rise-" + keyN++, {
      from: 0, to: 1, ...opts,
      onUpdate: p => { el.style.opacity = clamp(p * 1.4); el.style.transform = `translateY(${(1 - p) * distance}px)`; },
      onDone: () => { el.style.opacity = ""; el.style.transform = ""; },
    }), delay);
  }
  const stagger = (els, step = 70, start = 0) => els.forEach((el, i) => riseIn(el, { delay: start + i * step }));

  // Page headline: each word rises out of its own line.
  $$(".hero h1, .page-hero h1").forEach(h => {
    h.innerHTML = h.textContent.trim().split(/\s+/).map(w => `<span class="w"><span>${esc(w)}</span></span>`).join(" ");
    if (reduced) return;
    h.querySelectorAll(".w > span").forEach((s, i) => {
      s.style.transform = "translateY(105%)";
      setTimeout(() => spring("word-" + keyN++, {
        from: 0, to: 1, ...POP,
        onUpdate: p => { s.style.transform = `translateY(${(1 - p) * 105}%)`; },
        onDone: () => { s.style.transform = ""; },
      }), 80 + i * 90);
    });
  });
  stagger($$(".hero .eyebrow, .hero .lede, .hero .cta, .page-hero .lede, .page-hero .meta"), 90, 260);

  // Sections rise as you reach them; cards inside follow one after another.
  const showNow = el => { el.classList.add("shown"); el.style.opacity = ""; el.style.transform = ""; };
  if (!reduced && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const el = e.target;
      el.classList.add("shown");
      riseIn(el, { distance: 24, opts: { preset: "gentle" } });
      stagger([...el.querySelectorAll(".card, .timeline li, .toolkit > div")], 80, 120);
      el.querySelectorAll("[data-count]").forEach(countUp);
    }), { rootMargin: "0px 0px -8% 0px" });
    $$(".reveal").forEach(el => io.observe(el));
  } else {
    $$(".reveal").forEach(showNow);
  }
  function countUp(el) {
    const n = +el.dataset.count;
    if (reduced) { el.textContent = n; return; }
    spring("count-" + keyN++, { from: 0, to: n, preset: "gentle", precision: 0.02, onUpdate: v => { el.textContent = Math.max(0, Math.round(v)); } });
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
  const setToast = p => { toast.style.opacity = clamp(p); toast.style.transform = `translate(-50%, ${(1 - p) * 16}px)`; };
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

  // ---- Covers: the real image when there is one, a placeholder until then --
  const MARK = `<svg class="ph-mark" viewBox="0 0 32 32" aria-hidden="true"><path class="frame" d="M16 3v3M10 8h12l-2 3H12zM11 12h10v13H11zM9 27h14"/><path class="flame" d="M16 15c2.2 2 2.2 4.2 0 6.2-2.2-2-2.2-4.2 0-6.2z"/></svg>`;
  const placeholder = (item, label = "Cover coming soon") =>
    `<div class="ph" style="--tint:${esc(item.tint || "")}" role="img" aria-label="${esc(item.name)}: ${esc(label.toLowerCase())}">${MARK}<span>${esc(label)}</span></div>`;
  const byId = id => ITEMS.find(i => i.id === id);
  window.fadeIn = img => spring("img-" + keyN++, { from: 0, to: 1, preset: "gentle", onUpdate: v => { img.style.opacity = v; } });
  window.coverMissing = img => { const item = byId(img.dataset.id); if (item) img.parentElement.outerHTML = `<div class="cover">${placeholder(item)}</div>`; };
  const coverSrc = item => item.cover || (item.images && item.images[0] && item.images[0].src);
  const coverHTML = item => coverSrc(item)
    ? `<div class="cover" style="--tint:${esc(item.tint || "")}"><img src="${esc(coverSrc(item))}" alt="Cover art for ${esc(item.name)}" data-id="${esc(item.id)}" loading="lazy" decoding="async" onload="fadeIn(this)" onerror="coverMissing(this)"></div>`
    : `<div class="cover">${placeholder(item)}</div>`;

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
  const renderCards = (el, list, empty) => {
    el.innerHTML = list.length ? list.map(card).join("") : `<div class="empty">${empty}</div>`;
  };
  let originEl = null;
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-id]");
    if (b && b.closest(".cards")) { originEl = b.closest(".card"); location.hash = b.dataset.id; }
  });

  // ---- Home ---------------------------------------------------------------
  if (page === "home") {
    renderCards($("#home-games"), GAMES.filter(g => g.featured).slice(0, 4), "No games yet.");
    renderCards($("#home-assets"), ASSETS.filter(a => a.featured).slice(0, 2), "Nothing in the store yet.");
    initStage(GAMES.filter(g => g.current));
  }

  // Current projects carousel. Its position is one spring measured in slides,
  // so arrows, dots, keys and flicks all hand off to the same motion.
  function initStage(list) {
    const stage = $("#stage"), track = $("#stage-track"), dots = $("#dots"), text = $("#stage-text");
    if (!list.length) { stage.closest("section").hidden = true; return; }
    track.innerHTML = list.map((g, i) => `
      <div class="stage-slide" role="group" aria-roledescription="slide" aria-label="${esc(g.name)}, ${i + 1} of ${list.length}">
        ${g.trailer
          ? `<div class="cover"><video class="trailer" data-id="${esc(g.id)}" controls playsinline preload="metadata" ${g.trailer.poster ? `poster="${esc(g.trailer.poster)}"` : ""} src="${esc(g.trailer.src)}"></video></div>`
          : coverHTML(g)}
      </div>`).join("");
    track.querySelectorAll("video.trailer").forEach(v => v.addEventListener("error", () => {
      const g = byId(v.dataset.id);
      v.parentElement.innerHTML = placeholder(g, "Teaser coming soon");
    }));
    $("#stage-count").textContent = `${list.length} in progress`;
    dots.innerHTML = list.map((g, i) => `<button type="button" role="tab" aria-label="Show ${esc(g.name)}" aria-selected="${i === 0}"></button>`).join("");
    if (list.length < 2) { $$(".stage-btn").forEach(b => { b.hidden = true; }); dots.hidden = true; }

    const slides = [...track.children];
    let pos = 0, index = 0;
    const set = v => {
      pos = v;
      track.style.transform = `translateX(${-v * stage.clientWidth}px)`;
      slides.forEach((s, i) => {
        const d = Math.min(1, Math.abs(i - v));
        s.style.opacity = 1 - d * 0.55;
        s.style.transform = `scale(${1 - d * 0.08})`;
      });
    };
    const caption = (i, animate) => {
      const g = list[i];
      text.innerHTML = `<p class="meta">${esc((g.tags || [])[0] || "Game")} &middot; ${esc(g.status)}</p>
        <h3 class="stage-title">${esc(g.name)}</h3>
        ${g.caption ? `<p class="stage-sub">${esc(g.caption)}</p>` : ""}
        <a class="text-link" href="#${esc(g.id)}">Details</a>`;
      if (animate) stagger([...text.children], 50);
    };
    function go(i, velocity = 0) {
      const n = (i % list.length + list.length) % list.length;
      if (n !== index) {
        index = n;
        caption(n, true);
        [...dots.children].forEach((d, j) => d.setAttribute("aria-selected", String(j === n)));
        slides.forEach((s, j) => { const v = s.querySelector("video"); if (v && j !== n) v.pause(); });
      }
      spring("stage", { from: pos, to: n, velocity, preset: "sheet", onUpdate: set });
    }
    set(0); caption(0, false);
    $$(".stage-btn").forEach(b => b.addEventListener("click", () => go(index + +b.dataset.dir)));
    dots.addEventListener("click", e => { const b = e.target.closest("button"); if (b) go([...dots.children].indexOf(b)); });
    stage.addEventListener("keydown", e => {
      if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
    });
    addEventListener("resize", () => set(pos));

    // Swipe or drag; a quick flick carries to the next slide.
    let drag = null;
    stage.addEventListener("pointerdown", e => {
      if (e.button !== 0 || e.target.closest("button, a")) return;
      drag = { x: e.clientX, y: e.clientY, start: pos, id: e.pointerId, live: false, samples: [] };
    });
    stage.addEventListener("pointermove", e => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.live) {
        if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) { drag.live = true; stop("stage"); stage.setPointerCapture(e.pointerId); }
        else if (Math.abs(dy) > 8) { drag = null; return; }
        else return;
      }
      const w = stage.clientWidth;
      let v = drag.start - dx / w;
      if (v < 0) v = v * 0.35; if (v > list.length - 1) v = list.length - 1 + (v - list.length + 1) * 0.35;
      set(v);
      drag.samples.push([performance.now(), v]);
      if (drag.samples.length > 5) drag.samples.shift();
    });
    const end = () => {
      if (!drag) return;
      const { live, samples: s } = drag;
      drag = null;
      if (!live) return;
      const vel = s.length > 1 ? (s[s.length - 1][1] - s[0][1]) / ((s[s.length - 1][0] - s[0][0]) / 1000 || 1) : 0;
      const target = clamp(Math.round(pos + vel * 0.18), 0, list.length - 1);
      go(target, vel);
    };
    stage.addEventListener("pointerup", end);
    stage.addEventListener("pointercancel", end);
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
    stagger($$("#games-grid .card"), 80, 300);
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
    stagger($$("#store-grid .card, .note"), 80, 300);
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
    $("#stats").innerHTML = stats.map(([n, l]) => `<div><dt class="num" data-count="${n}">${reduced ? n : 0}</dt><dd>${l}</dd></div>`).join("");
    if (reduced || !("IntersectionObserver" in window)) $$("[data-count]").forEach(el => { el.textContent = el.dataset.count; });
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
    stagger($$(".handle, .mail-form"), 90, 300);
  }

  // ---- Phone menu: drops down from the top --------------------------------
  const menu = $("#menu"), menuPanel = menu.querySelector(".menu-panel"), menuScrim = menu.querySelector(".scrim");
  const menuLinks = [...menu.querySelectorAll(".menu-links a")];
  let mp = 0;
  const setMenu = p => {
    mp = p;
    menuScrim.style.opacity = clamp(p);
    menuPanel.style.transform = `translateY(${-(1 - p) * 100}%)`;
    menuLinks.forEach((a, i) => {
      const q = clamp((p - i * 0.07) / 0.65);
      a.style.opacity = q;
      a.style.transform = `translateY(${(1 - q) * -14}px)`;
    });
  };
  function openMenu() {
    if (!menu.open) { menu.showModal(); setMenu(0); }
    lock();
    spring("menu", { from: mp, to: 1, preset: "sheet", onUpdate: setMenu });
  }
  function closeMenu() {
    if (!menu.open) return;
    spring("menu", { from: mp, to: 0, preset: "snappy", onUpdate: setMenu, onDone: () => { menu.close(); unlock(); } });
  }
  $(".menu-open").addEventListener("click", openMenu);
  menu.querySelector(".menu-close").addEventListener("click", closeMenu);
  menuScrim.addEventListener("click", closeMenu);
  menu.addEventListener("cancel", e => { e.preventDefault(); closeMenu(); });

  // ---- Project details: a modal that grows out of the card you picked -----
  // On phones it rises from the bottom instead. Drag it down to close.
  const modal = $("#sheet"), panel = modal.querySelector(".sheet-body"), modalScrim = modal.querySelector(".scrim");
  let p = 0, origin = null, rest = null, opener = null, pendingVelocity = 0;
  const setModal = v => {
    p = v;
    modalScrim.style.opacity = clamp(v);
    if (phone()) {
      panel.style.transform = `translateY(${(1 - v) * panel.offsetHeight}px)`;
      panel.style.opacity = "";
    } else if (origin && rest) {
      const s0 = origin.width / rest.width;
      const dx = (origin.left + origin.width / 2) - (rest.left + rest.width / 2);
      const dy = (origin.top + origin.height / 2) - (rest.top + rest.height / 2);
      panel.style.transform = `translate(${dx * (1 - v)}px, ${dy * (1 - v)}px) scale(${s0 + (1 - s0) * v})`;
      panel.style.opacity = clamp(v * 1.8);
    } else {
      panel.style.transform = `translateY(${(1 - v) * 48}px) scale(${0.95 + 0.05 * v})`;
      panel.style.opacity = clamp(v * 1.5);
    }
  };

  function fill(item) {
    $("#sheet-cover").innerHTML = coverHTML(item);
    $("#sheet-kind").textContent = item.kind === "asset" ? (CATS[item.category] || "Asset") : "Game";
    $("#sheet-title").textContent = item.name;
    $("#sheet-meta").textContent = [item.status, item.engine, item.price].filter(Boolean).join(" · ");
    $("#sheet-tags").innerHTML = (item.tags || []).map(t => `<li>${esc(t)}</li>`).join("");
    $("#sheet-about").innerHTML = (item.about || [item.summary]).map(t => `<p>${esc(t)}</p>`).join("");
    const shots = (item.images || []).filter(im => im.src !== item.cover).slice(item.cover ? 0 : 1);
    $("#sheet-media").innerHTML = shots.length
      ? shots.map(im => `<div class="shot" style="--tint:${esc(im.tint || item.tint)}"><img src="${esc(im.src)}" alt="${esc(im.alt)}" loading="lazy" decoding="async" onload="fadeIn(this)"></div>`).join("")
      : `<p class="media-note">I&rsquo;ll post screenshots here as soon as there&rsquo;s something to show.</p>`;
    const links = [...(item.buy ? [item.buy] : []), ...(item.links || [])];
    $("#sheet-links").innerHTML = links.map((l, i) => `<a class="${i === 0 && item.buy ? "btn" : "btn ghost"}" href="${esc(l.href)}" rel="noopener">${esc(l.label)}</a>`).join("");
  }
  function openModal(item) {
    const first = !modal.open;
    if (first) {
      opener = document.activeElement;
      origin = originEl && document.contains(originEl) ? originEl.getBoundingClientRect() : null;
      originEl = null;
    }
    fill(item);
    panel.scrollTop = 0;
    if (first) {
      modal.showModal();
      panel.style.transform = "none";
      rest = panel.getBoundingClientRect();
      setModal(0);
    }
    lock();
    spring("modal", { from: p, to: 1, preset: "sheet", onUpdate: setModal });
  }
  function closeModal() {
    if (!modal.open) return;
    const v = pendingVelocity; pendingVelocity = 0;
    spring("modal", {
      from: p, to: 0, velocity: v, preset: "sheet", onUpdate: setModal,
      onDone: () => {
        modal.close(); panel.style.transform = ""; panel.style.opacity = ""; unlock();
        if (opener && opener.focus) opener.focus({ preventScroll: true });
      },
    });
  }
  const isItemHash = () => ITEMS.some(x => "#" + x.id === location.hash);
  function route() {
    const item = ITEMS.find(x => x.id === decodeURIComponent(location.hash.slice(1)));
    item ? openModal(item) : closeModal();
  }
  const dismiss = () => isItemHash() ? history.back() : closeModal();
  addEventListener("hashchange", route);
  modal.addEventListener("cancel", e => { e.preventDefault(); dismiss(); });
  modalScrim.addEventListener("click", dismiss);
  modal.querySelector(".close").addEventListener("click", dismiss);

  let mdrag = null;
  panel.addEventListener("pointerdown", e => {
    if (e.button !== 0 || e.target.closest("a, button, img, video") || panel.scrollTop > 0) return;
    mdrag = { y: e.clientY, x: e.clientX, start: p, id: e.pointerId, live: false, samples: [] };
  });
  panel.addEventListener("pointermove", e => {
    if (!mdrag || e.pointerId !== mdrag.id) return;
    const dy = e.clientY - mdrag.y, dx = Math.abs(e.clientX - mdrag.x);
    if (!mdrag.live) {
      if (dy > 8 && dy > dx) { mdrag.live = true; stop("modal"); panel.setPointerCapture(e.pointerId); }
      else if (dx > 8 || dy < -8) { mdrag = null; return; }
      else return;
    }
    const range = phone() ? panel.offsetHeight : 520;
    const v = clamp(mdrag.start - Math.max(0, dy) / range, 0, 1);
    setModal(v);
    mdrag.samples.push([performance.now(), v]);
    if (mdrag.samples.length > 5) mdrag.samples.shift();
  });
  const mend = () => {
    if (!mdrag) return;
    const { live, samples: s } = mdrag;
    mdrag = null;
    if (!live) return;
    const vel = s.length > 1 ? (s[s.length - 1][1] - s[0][1]) / ((s[s.length - 1][0] - s[0][0]) / 1000 || 1) : 0;
    if (p < 0.65 || vel < -1.6) { pendingVelocity = vel; dismiss(); }
    else spring("modal", { from: p, to: 1, velocity: vel, preset: "sheet", onUpdate: setModal });
  };
  panel.addEventListener("pointerup", mend);
  panel.addEventListener("pointercancel", mend);

  // ---- Command menu (Ctrl+K) ---------------------------------------------
  const cmdk = $("#cmdk"), input = $("#cmdk-input"), listEl = $("#cmdk-list");
  const box = cmdk.querySelector(".cmdk-box"), cmdScrim = cmdk.querySelector(".scrim");
  const setCmd = v => {
    box.style.opacity = clamp(v); cmdScrim.style.opacity = clamp(v);
    box.style.transform = `translateY(${(1 - v) * -12}px) scale(${0.97 + 0.03 * v})`;
  };
  const actions = [
    ...ITEMS.map(it => ({ label: it.name, hint: it.kind === "asset" ? "Store" : "Game", terms: (it.tags || []).join(" ") + " " + it.summary, run: () => { location.hash = it.id; } })),
    ...[["Home", "index.html"], ["Games", "games.html"], ["Store", "store.html"], ["About", "about.html"], ["Contact", "contact.html"], ["Refund policy", "refunds.html"], ["Privacy", "privacy.html"], ["Terms", "terms.html"]]
      .map(([label, href]) => ({ label, hint: "Page", run: () => { location.href = href; } })),
    { label: "Copy email address", hint: "Contact", run: async () => { try { await navigator.clipboard.writeText(S.email); say("Copied " + S.email); } catch (e) { say(S.email); } } },
    { label: "Toggle light and dark", hint: "Theme", run: toggleTheme },
  ];
  let matches = actions, sel = 0, cp = 0;
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
    if (modal.open) dismiss();
    if (menu.open) closeMenu();
    if (!cmdk.open) { input.value = ""; sel = 0; renderCmd(); cmdk.showModal(); setCmd(0); }
    input.focus(); lock();
    spring("cmdk", { from: cp, to: 1, preset: "snappy", onUpdate: v => { cp = v; setCmd(v); } });
  }
  function closeCmd() {
    if (!cmdk.open) return;
    spring("cmdk", { from: cp, to: 0, preset: "snappy", onUpdate: v => { cp = v; setCmd(v); }, onDone: () => { cmdk.close(); unlock(); } });
  }
  function runSel(i) { const a = matches[i]; if (!a) return; closeCmd(); a.run(); }
  $(".cmd-open").addEventListener("click", openCmd);
  cmdk.addEventListener("cancel", e => { e.preventDefault(); closeCmd(); });
  cmdScrim.addEventListener("click", closeCmd);
  input.addEventListener("input", () => { sel = 0; renderCmd(); });
  input.addEventListener("keydown", e => {
    if (e.key === "ArrowDown") { e.preventDefault(); sel = (sel + 1) % Math.max(1, matches.length); renderCmd(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); sel = (sel - 1 + matches.length) % Math.max(1, matches.length); renderCmd(); }
    else if (e.key === "Enter") { e.preventDefault(); runSel(sel); }
  });
  listEl.addEventListener("click", e => { const li = e.target.closest("[data-i]"); if (li) runSel(+li.dataset.i); });
  addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); cmdk.open && cp > 0.5 ? closeCmd() : openCmd(); }
  });
  if (/Mac|iPhone|iPad/.test(navigator.platform)) $$(".cmd-open kbd").forEach(k => { k.textContent = "⌘ K"; });

  route();
})();
