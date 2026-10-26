(function () {
  const projects = (window.PROJECTS || []).filter(p => p.show !== false);
  const KINDS = window.KINDS;
  const STUDIO = window.STUDIO || {};
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };
  const transition = fn => (document.startViewTransition && !reduced) ? document.startViewTransition(fn) : fn();

  $("#year").textContent = new Date().getFullYear();

  // ---- Smooth scrolling ---------------------------------------------------
  let lenis = null;
  if (window.Lenis && !reduced) {
    lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95, anchors: false });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  const goTo = target => {
    const el = typeof target === "string" ? $(target) : target;
    if (!el) return;
    lenis ? lenis.scrollTo(el, { offset: -72, duration: 1.1 }) : el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  };
  document.addEventListener("click", e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href").slice(1);
    if (projects.some(p => p.id === id)) return;     // project links open a sheet instead
    e.preventDefault();
    goTo(id ? "#" + id : document.body);
    history.replaceState(null, "", location.pathname + location.search);
  });

  // ---- Sections ease in once as you reach them ----------------------------
  if (!reduced && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("shown"); io.unobserve(en.target); }
    }), { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".reveal").forEach(el => io.observe(el));
  } else {
    document.querySelectorAll(".reveal").forEach(el => el.classList.add("shown"));
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

  // ---- Lists --------------------------------------------------------------
  const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
  function renderList(kind, listId, countId, word, empty) {
    const list = projects.filter(p => p.kind === kind);
    $(countId).textContent = plural(list.length, word);
    const el = $(listId);
    if (!list.length) { el.innerHTML = `<li class="empty">${empty}</li>`; return; }
    el.innerHTML = list.map(p => `
      <li class="row">
        <button type="button" data-id="${esc(p.id)}" aria-haspopup="dialog">
          <span class="r-name">${esc(p.name)}</span>
          <span class="r-sum">${esc(p.summary)}</span>
          <span class="r-tags">${(p.tags || []).map(esc).join(" · ")}</span>
          <span class="chip${/development|building/i.test(p.status) ? " live" : ""}">${esc(p.price || p.status)}</span>
        </button>
      </li>`).join("");
  }
  renderList("game", "#games-list", "#games-count", "game", "<strong>No games listed.</strong>");
  renderList("asset", "#assets-list", "#assets-count", "pack", "<strong>No asset packs yet.</strong>Check back soon.");
  document.querySelectorAll(".index").forEach(ul => ul.addEventListener("click", e => {
    const b = e.target.closest("button[data-id]");
    if (b) location.hash = b.dataset.id;
  }));

  // ---- Contact -----------------------------------------------------------
  const toast = $("#toast");
  let toastTimer;
  function say(msg) {
    toast.textContent = msg;
    toast.classList.add("on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("on"), 1800);
  }
  if (STUDIO.email) { const a = $("#email-link"); a.href = "mailto:" + STUDIO.email; a.textContent = STUDIO.email; }
  if (STUDIO.discord) $("#discord-value").textContent = STUDIO.discord;
  document.querySelectorAll(".copy").forEach(btn => btn.addEventListener("click", async () => {
    const value = STUDIO[btn.dataset.copy];
    try { await navigator.clipboard.writeText(value); say("Copied " + value); }
    catch (e) {
      const node = btn.previousElementSibling, range = document.createRange();
      range.selectNodeContents(node);
      const sel = getSelection(); sel.removeAllRanges(); sel.addRange(range);
      say("Selected. Press Ctrl+C to copy");
    }
  }));

  // ---- Detail sheet ------------------------------------------------------
  const sheet = $("#sheet"), body = sheet.querySelector(".sheet-body");
  let opener = null;

  function fill(p) {
    $("#sheet-kind").textContent = KINDS[p.kind] || p.kind;
    $("#sheet-title").textContent = p.name;
    $("#sheet-meta").textContent = [p.status, p.price].filter(Boolean).join(" · ");
    $("#sheet-tags").innerHTML = (p.tags || []).map(t => `<li>${esc(t)}</li>`).join("");
    $("#sheet-about").innerHTML = (p.about || [p.summary]).map(t => `<p>${esc(t)}</p>`).join("");
    const media = $("#sheet-media");
    if (p.images && p.images.length) {
      media.innerHTML = p.images.map(im =>
        `<div class="shot" style="--tint:${esc(im.tint || "")}"><img src="${esc(im.src)}" alt="${esc(im.alt || "")}" loading="lazy" decoding="async"></div>`).join("");
      media.querySelectorAll("img").forEach(img => {
        const done = () => img.classList.add("loaded");
        img.complete ? done() : img.addEventListener("load", done, { once: true });
      });
    } else {
      media.innerHTML = `<div class="shot skel-box" aria-hidden="true"></div><p class="media-note">Screenshots go up as soon as there&rsquo;s something to show.</p>`;
    }
    $("#sheet-links").innerHTML = (p.links || []).map(l => `<a href="${esc(l.href)}" rel="noopener">${esc(l.label)}</a>`).join("");
  }

  function openSheet(p) {
    if (!sheet.open) opener = document.activeElement;
    fill(p);
    body.scrollTop = 0;
    if (!sheet.open) sheet.showModal();
    lenis && lenis.stop();
    requestAnimationFrame(() => sheet.classList.add("in"));
  }
  function closeSheet() {
    if (!sheet.open) return;
    sheet.classList.remove("in");
    body.style.transform = "";
    const finish = () => {
      if (sheet.classList.contains("in")) return;
      sheet.close(); lenis && lenis.start();
      if (opener && opener.focus) opener.focus({ preventScroll: true });
    };
    reduced ? finish() : body.addEventListener("transitionend", finish, { once: true });
  }
  function route() {
    const p = projects.find(x => x.id === decodeURIComponent(location.hash.slice(1)));
    p ? openSheet(p) : closeSheet();
  }
  function dismiss() {
    projects.some(x => "#" + x.id === location.hash) ? history.back() : closeSheet();
  }
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
    ...projects.map(p => ({ label: p.name, hint: KINDS[p.kind], terms: (p.tags || []).join(" ") + " " + p.summary, run: () => { location.hash = p.id; } })),
    ...[["Games", "#games"], ["Assets", "#assets"], ["About", "#about"], ["Contact", "#contact"]]
      .map(([label, sel]) => ({ label, hint: "Section", run: () => goTo(sel) })),
    { label: "Copy email address", hint: "Contact", run: () => document.querySelector('[data-copy="email"]').click() },
    { label: "Toggle light and dark", hint: "Theme", run: toggleTheme },
    { label: "Privacy", hint: "Page", run: () => { location.href = "privacy.html"; } },
    { label: "Terms", hint: "Page", run: () => { location.href = "terms.html"; } },
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
    input.value = ""; sel = 0; renderCmd();
    cmdk.showModal(); input.focus();
    lenis && lenis.stop();
    requestAnimationFrame(() => cmdk.classList.add("in"));
  }
  function closeCmd() { cmdk.classList.remove("in"); cmdk.close(); lenis && lenis.start(); }
  function runSel(i) { const a = matches[i]; if (!a) return; closeCmd(); a.run(); }

  $(".cmd-open").addEventListener("click", openCmd);
  cmdk.addEventListener("close", () => { cmdk.classList.remove("in"); lenis && lenis.start(); });
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
  if (/Mac|iPhone|iPad/.test(navigator.platform)) document.querySelectorAll(".cmd-open kbd").forEach(k => { k.textContent = "⌘ K"; });

  // ---- Prefetch the policy pages when someone heads for them -------------
  document.querySelectorAll('.foot a[href$=".html"]').forEach(a => a.addEventListener("pointerenter", () => {
    const l = document.createElement("link"); l.rel = "prefetch"; l.href = a.getAttribute("href");
    document.head.appendChild(l);
  }, { once: true }));

  route();
})();
