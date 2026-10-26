(function () {
  const projects = (window.PROJECTS || []).filter(p => p.show !== false);
  const KINDS = window.KINDS;
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };
  const transition = fn => (document.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches)
    ? document.startViewTransition(fn) : fn();

  $("#year").textContent = new Date().getFullYear();
  const mail = (window.STUDIO || {}).email;
  if (mail) { const a = $("#contact-mail"); a.href = "mailto:" + mail; a.textContent = mail; $("#contact").hidden = false; }

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

  // ---- Filters and index -------------------------------------------------
  const filtersEl = $(".filters"), indexEl = $("#index");
  const groups = [["all", "All"], ["game", "Games"], ["app", "Apps"], ["system", "Systems"], ["asset", "Assets"]];
  let filter = store.get("filter") || "all";

  function renderFilters() {
    filtersEl.innerHTML = groups.map(([k, label]) => {
      const n = k === "all" ? projects.length : projects.filter(p => p.kind === k).length;
      return `<button type="button" role="tab" data-k="${k}" aria-selected="${k === filter}">${label} <b>${n}</b></button>`;
    }).join("");
  }

  function renderIndex() {
    const list = filter === "all" ? projects : projects.filter(p => p.kind === filter);
    if (!list.length) {
      const msg = filter === "asset"
        ? "<strong>No asset packs yet.</strong>Models, textures and sound packs go here when they're ready to use."
        : "<strong>Nothing here yet.</strong>";
      indexEl.innerHTML = `<li class="empty">${msg}</li>`;
      return;
    }
    indexEl.innerHTML = list.map(p => `
      <li class="row" style="view-transition-name: row-${esc(p.id)}">
        <button type="button" data-id="${esc(p.id)}" aria-haspopup="dialog">
          <span class="r-name">${esc(p.name)}</span>
          <span class="r-sum">${esc(p.summary)}</span>
          <span class="r-plat">${esc(p.platform)}</span>
          <span class="chip${p.status === "In development" ? " live" : ""}">${esc(p.status)}</span>
        </button>
      </li>`).join("");
  }

  filtersEl.addEventListener("click", e => {
    const b = e.target.closest("button");
    if (!b || b.dataset.k === filter) return;
    filter = b.dataset.k;
    store.set("filter", filter);
    transition(() => { renderFilters(); renderIndex(); });
  });
  filtersEl.addEventListener("keydown", e => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const btns = [...filtersEl.querySelectorAll("button")];
    const i = btns.indexOf(document.activeElement);
    const next = btns[(i + (e.key === "ArrowRight" ? 1 : -1) + btns.length) % btns.length];
    next.focus(); next.click();
  });
  indexEl.addEventListener("click", e => {
    const b = e.target.closest("button[data-id]");
    if (b) location.hash = b.dataset.id;
  });

  renderFilters();
  renderIndex();

  // ---- Project sheet -----------------------------------------------------
  const sheet = $("#sheet"), body = sheet.querySelector(".sheet-body");
  let opener = null;

  function fill(p) {
    $("#sheet-kind").textContent = KINDS[p.kind] || p.kind;
    $("#sheet-title").textContent = p.name;
    $("#sheet-meta").textContent = `${p.platform} · ${p.status}`;
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
      media.innerHTML = `<div class="shot skel-box" aria-hidden="true"></div><p class="media-note">Screenshots go up when the ${p.status === "Rebuilding" ? "rebuild" : "first build"} is ready.</p>`;
    }
    $("#sheet-links").innerHTML = (p.links || []).map(l => `<a href="${esc(l.href)}" rel="noopener">${esc(l.label)}</a>`).join("");
  }

  function openSheet(p) {
    opener = document.activeElement;
    fill(p);
    body.scrollTop = 0;
    if (!sheet.open) sheet.showModal();
    requestAnimationFrame(() => sheet.classList.add("in"));
  }

  function closeSheet() {
    if (!sheet.open) return;
    sheet.classList.remove("in");
    body.style.transform = "";
    const finish = () => { if (!sheet.classList.contains("in")) { sheet.close(); if (opener) opener.focus(); } };
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    reduced ? finish() : body.addEventListener("transitionend", finish, { once: true });
  }

  // The URL hash decides which project is open, so the back button closes the sheet.
  function route() {
    const id = decodeURIComponent(location.hash.slice(1));
    const p = projects.find(x => x.id === id);
    if (p) openSheet(p); else closeSheet();
  }
  function dismiss() {
    if (projects.some(x => "#" + x.id === location.hash)) history.back(); else closeSheet();
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
    const size = drag.phone ? body.offsetHeight : body.offsetWidth;
    const far = drag.live && drag.d > size * 0.25;
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
    ...projects.map(p => ({ label: p.name, hint: KINDS[p.kind], terms: p.platform + " " + p.summary, run: () => { location.hash = p.id; } })),
    { label: "Work", hint: "Section", run: () => $("#work").scrollIntoView() },
    { label: "About", hint: "Section", run: () => $("#about").scrollIntoView() },
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
    requestAnimationFrame(() => cmdk.classList.add("in"));
  }
  function closeCmd() { cmdk.classList.remove("in"); cmdk.close(); }
  function runSel(i) { const a = matches[i]; if (!a) return; closeCmd(); a.run(); }

  $(".cmd-open").addEventListener("click", openCmd);
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
    if (a.dataset.pf) return;
    a.dataset.pf = 1;
    const l = document.createElement("link"); l.rel = "prefetch"; l.href = a.getAttribute("href");
    document.head.appendChild(l);
  }, { once: true }));

  route();
})();
