// PS1-style 3D viewports: low internal resolution, vertices snapped to a coarse screen grid
// (the PS1 "wobble"), flat shading, fog and dithering. Built on Three.js (MIT).
// Motion runs on springs from the `motion` package; a flicked model coasts on friction.
import * as THREE from "three";
import { motionValue, animate } from "motion";

const BG = 0x131418;
const INTERNAL_WIDTH = 320; // the PS1 drew at 320 px wide
const SPRING_STANDARD = { type: "spring", stiffness: 260, damping: 20 };
const SPRING_MICRO = { type: "spring", stiffness: 400, damping: 40 };

/** Snap every vertex to a coarse grid in screen space. A huge uSnap turns it off. */
function psxify(material, snap) {
  material.dithering = true;
  material.onBeforeCompile = shader => {
    shader.uniforms.uSnap = snap;
    shader.vertexShader = "uniform vec2 uSnap;\n" + shader.vertexShader.replace(
      "#include <project_vertex>",
      `#include <project_vertex>
      vec4 psx = gl_Position;
      psx.xyz /= psx.w;
      psx.xy = floor(psx.xy * uSnap + 0.5) / uSnap;
      psx.xyz *= psx.w;
      gl_Position = psx;`
    );
  };
  material.needsUpdate = true;
  return material;
}
const flat = (color, snap, extra = {}) =>
  psxify(new THREE.MeshLambertMaterial({ color, flatShading: true, ...extra }), snap);

// ---- Scenes: everything stays low-poly on purpose ----------------------------
const SCENES = {
  lantern(snap) {
    const g = new THREE.Group();
    const iron = flat(0x3b3c42, snap), ironDark = flat(0x24252a, snap);
    const glass = flat(0xb0a4a8, snap, { transparent: true, opacity: 0.16, depthWrite: false });
    const flameMat = psxify(new THREE.MeshBasicMaterial({ color: 0xffc2c8 }), snap);
    const add = (geo, mat, x = 0, y = 0, z = 0, ry = 0) => {
      const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.y = ry; g.add(m); return m;
    };
    add(new THREE.BoxGeometry(0.9, 0.12, 0.9), iron, 0, 0.06, 0);
    add(new THREE.BoxGeometry(0.78, 0.06, 0.78), ironDark, 0, 0.15, 0);
    add(new THREE.BoxGeometry(0.66, 0.9, 0.66), glass, 0, 0.63, 0);
    for (const [x, z] of [[-0.36, -0.36], [0.36, -0.36], [-0.36, 0.36], [0.36, 0.36]])
      add(new THREE.BoxGeometry(0.07, 0.98, 0.07), iron, x, 0.63, z);
    for (const y of [0.4, 0.86]) for (let i = 0; i < 4; i++) {
      const bar = add(new THREE.BoxGeometry(0.72, 0.035, 0.035), ironDark, 0, y, 0, (i * Math.PI) / 2);
      bar.position.x = [0, 0.36, 0, -0.36][i]; bar.position.z = [0.36, 0, -0.36, 0][i];
    }
    add(new THREE.BoxGeometry(0.86, 0.08, 0.86), iron, 0, 1.12, 0);
    add(new THREE.ConeGeometry(0.58, 0.42, 4, 1), iron, 0, 1.37, 0, Math.PI / 4);
    add(new THREE.CylinderGeometry(0.06, 0.08, 0.1, 6), ironDark, 0, 1.62, 0);
    add(new THREE.TorusGeometry(0.17, 0.03, 4, 8), iron, 0, 1.82, 0);
    add(new THREE.CylinderGeometry(0.1, 0.12, 0.14, 6), ironDark, 0, 0.25, 0);
    const flame = add(new THREE.ConeGeometry(0.07, 0.24, 5), flameMat, 0, 0.44, 0);
    const light = new THREE.PointLight(0xe0364f, 7, 6, 1.6);
    light.position.set(0, 0.55, 0);
    g.add(light);
    const wood = flat(0x29272a, snap), woodDark = flat(0x1c1b1e, snap);
    const crate = new THREE.Group();
    crate.add(new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.8, 1.2), wood));
    for (const y of [-0.3, 0.3]) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(1.54, 0.09, 1.24), woodDark); p.position.y = y; crate.add(p);
    }
    crate.position.y = -0.4;
    g.add(crate);
    const can = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.3, 7), flat(0x34363c, snap));
    can.position.set(0.52, 0.15, 0.25); g.add(can);
    const book = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.07, 0.3), flat(0x3a2a2e, snap));
    book.position.set(-0.5, 0.035, 0.2); book.rotation.y = 0.4; g.add(book);
    g.position.y = -0.55;
    return { group: g, light, flame, label: "iron-lantern.glb" };
  },

  "road-props"(snap) {
    const g = new THREE.Group();
    const red = flat(0x8a3a3c, snap), bone = flat(0xcdccc2, snap), black = flat(0x1f2222, snap), grey = flat(0x464c4e, snap);
    const cone = (x, z, s = 1) => {
      const c = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.26, 0.72, 8, 1), red); body.position.y = 0.42; c.add(body);
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.165, 0.1, 8, 1), bone); band.position.y = 0.5; c.add(band);
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.06, 0.6), black); base.position.y = 0.03; c.add(base);
      c.position.set(x, 0, z); c.scale.setScalar(s); g.add(c);
    };
    cone(-1.1, 0.35); cone(-0.55, 0.75, 0.9);
    const barrier = new THREE.Group();
    for (let i = 0; i < 6; i++) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.22, 0.06), i % 2 ? red : bone);
      b.position.set(-0.75 + i * 0.3, 0.75, 0); barrier.add(b);
    }
    for (const x of [-0.8, 0.8]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.86, 0.06), grey); leg.position.set(x, 0.43, 0); barrier.add(leg);
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.5), grey); foot.position.set(x, 0.03, 0); barrier.add(foot);
    }
    barrier.position.set(0.55, 0, -0.35); barrier.rotation.y = -0.25; g.add(barrier);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.6, 6), grey); post.position.set(1.35, 0.8, 0.5); g.add(post);
    const sign = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 8), red);
    sign.rotation.x = Math.PI / 2; sign.rotation.y = Math.PI / 8; sign.position.set(1.35, 1.55, 0.53); g.add(sign);
    g.position.y = -0.6;
    return { group: g, label: "Stand-in model" };
  },
};

async function loadModel(url, snap) {
  const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
  const gltf = await new GLTFLoader().loadAsync(url);
  const root = gltf.scene;
  root.traverse(o => { if (o.isMesh) [].concat(o.material).forEach(m => psxify(m, snap)); });
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
  const s = 2.2 / Math.max(size.x, size.y, size.z || 1);
  root.scale.setScalar(s);
  root.position.sub(center.multiplyScalar(s));
  const g = new THREE.Group(); g.add(root);
  return { group: g, label: url.split("/").pop() };
}

/**
 * Mount a viewport on a stage element that contains a <canvas>.
 * opts: { scene, model, zoom, reduced, onStats(stats), onLabel(text), framing: "hero" | "inspect" }
 * Returns { setPsx(bool), setWire(bool), nudge(dir), dispose() }.
 */
export async function mountViewport(stage, opts = {}) {
  const canvas = stage.querySelector("canvas");
  const reduced = !!opts.reduced;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "low-power" });
  renderer.setClearColor(BG);

  let psx = true, wire = false;
  const snap = { value: new THREE.Vector2(80, 60) };
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  scene.fog = new THREE.Fog(BG, 3.2, 8.5);
  scene.add(new THREE.HemisphereLight(0x8f93a3, 0x0a0a0d, 0.85));
  const moon = new THREE.DirectionalLight(0xbcc3d6, 0.6);
  moon.position.set(-3, 4, 2);
  scene.add(moon);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(4, 10), flat(0x18191d, snap));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -1.0;
  scene.add(floor);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 30);
  const hero = opts.framing === "hero";
  const dist = motionValue(hero ? 5.2 : 4.6);
  const pivot = new THREE.Group();
  scene.add(pivot);

  let built;
  try {
    built = opts.model ? await loadModel(opts.model, snap) : SCENES[opts.scene || "lantern"](snap);
  } catch {
    built = SCENES[opts.scene] ? SCENES[opts.scene](snap) : SCENES.lantern(snap);
  }
  pivot.add(built.group);
  if (hero) pivot.position.x = 0.9; // sit to the right of the headline on wide screens
  opts.onLabel && opts.onLabel(built.label);

  let tris = 0;
  built.group.traverse(o => {
    if (o.isMesh) { const gm = o.geometry; tris += (gm.index ? gm.index.count : gm.attributes.position.count) / 3; }
  });
  tris = Math.round(tris);

  // ---- Size ----
  let cssW = 1, cssH = 1;
  function resize() {
    const r = stage.getBoundingClientRect();
    cssW = Math.max(1, r.width); cssH = Math.max(1, r.height);
    if (psx) {
      const w = Math.min(INTERNAL_WIDTH * (hero ? 1.5 : 1), Math.round(cssW));
      const h = Math.max(1, Math.round((w * cssH) / cssW));
      renderer.setPixelRatio(1);
      renderer.setSize(w, h, false);
      snap.value.set(w / 4, h / 4);
    } else {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(cssW, cssH, false);
      snap.value.set(1e5, 1e5);
    }
    if (hero) pivot.position.x = cssW > 900 ? 1.15 : 0;
    camera.aspect = cssW / cssH;
    camera.updateProjectionMatrix();
    canvas.dataset.psx = String(psx);
    draw();
  }

  // ---- Interaction: drag to turn with inertia; tilt springs back level ----
  let yaw = 0.6, yawVel = 0;
  const pitch = motionValue(0.18);
  const idleSpin = reduced ? 0 : 0.28;
  let dragging = null;
  const onDown = e => {
    if (e.button !== 0) return;
    dragging = { x: e.clientX, y: e.clientY, id: e.pointerId, samples: [] };
    pitch.stop();
    stage.setPointerCapture(e.pointerId);
    stage.dataset.grabbing = "true";
  };
  const onMove = e => {
    if (!dragging || e.pointerId !== dragging.id) return;
    const dx = e.clientX - dragging.x, dy = e.clientY - dragging.y;
    dragging.x = e.clientX; dragging.y = e.clientY;
    yaw += dx * 0.012;
    pitch.jump(Math.max(-0.35, Math.min(0.75, pitch.get() + dy * 0.006)));
    dragging.samples.push([performance.now(), yaw]);
    if (dragging.samples.length > 5) dragging.samples.shift();
    yawVel = 0;
    draw();
  };
  const onUp = () => {
    if (!dragging) return;
    const s = dragging.samples;
    yawVel = s.length > 1 ? (s[s.length - 1][1] - s[0][1]) / Math.max(0.016, (s[s.length - 1][0] - s[0][0]) / 1000) : 0;
    dragging = null;
    delete stage.dataset.grabbing;
    animate(pitch, 0.18, SPRING_STANDARD);
    draw();
  };
  stage.addEventListener("pointerdown", onDown);
  stage.addEventListener("pointermove", onMove);
  stage.addEventListener("pointerup", onUp);
  stage.addEventListener("pointercancel", onUp);

  const onWheel = e => {
    e.preventDefault();
    const target = Math.max(2.6, Math.min(8, dist.get() * (1 + Math.sign(e.deltaY) * 0.12)));
    animate(dist, target, SPRING_MICRO);
    draw();
  };
  if (opts.zoom) stage.addEventListener("wheel", onWheel, { passive: false });
  const unsubs = [pitch.on("change", () => draw()), dist.on("change", () => draw())];

  // ---- Loop ----
  let visible = false, raf = 0, last = performance.now(), frames = 0, fps = 0, statT = 0;
  function frame(now) {
    raf = 0;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!dragging) {
      yawVel += (idleSpin - yawVel) * (1 - Math.exp(-dt * 1.6));
      yaw += yawVel * dt;
    }
    if (built.light && !reduced) {
      const t = now / 1000;
      built.light.intensity = 7 * (0.86 + 0.08 * Math.sin(t * 7.3) + 0.06 * Math.sin(t * 17.1 + 1.3));
      if (built.flame) built.flame.scale.y = 0.9 + 0.12 * Math.sin(t * 9.1);
    }
    render();
    frames++; statT += dt;
    if (statT > 0.5) { fps = Math.round(frames / statT); frames = 0; statT = 0; stats(); }
    if (visible && !document.hidden && !reduced) raf = requestAnimationFrame(frame);
    else if (visible && reduced && (dragging || Math.abs(yawVel) > 0.01)) raf = requestAnimationFrame(frame);
  }
  function render() {
    pivot.rotation.y = yaw;
    const p = pitch.get(), d = dist.get();
    camera.position.set(0, Math.sin(p) * d, Math.cos(p) * d);
    camera.lookAt(hero ? pivot.position.x * 0.35 : 0, 0.05, 0);
    renderer.render(scene, camera);
  }
  function draw() {
    if (raf) return;
    if (visible) { last = performance.now(); raf = requestAnimationFrame(frame); }
    else { render(); stats(); }
  }
  function stats() {
    if (!opts.onStats) return;
    const size = renderer.getDrawingBufferSize(new THREE.Vector2());
    opts.onStats({ tris, draws: renderer.info.render.calls, res: `${size.x}×${size.y}`, fps: reduced ? null : fps || null });
  }

  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) draw(); });
  io.observe(stage);
  const ro = new ResizeObserver(resize);
  ro.observe(stage);
  const onVis = () => { if (!document.hidden) draw(); };
  document.addEventListener("visibilitychange", onVis);
  resize();

  const setMaterials = fn => scene.traverse(o => { if (o.isMesh && o !== floor) [].concat(o.material).forEach(fn); });
  return {
    setPsx(v) { psx = v; resize(); },
    setWire(v) { wire = v; setMaterials(m => { m.wireframe = wire; }); draw(); },
    nudge(dir) { yawVel += dir * 1.6; draw(); },
    dispose() {
      cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); unsubs.forEach(u => u());
      document.removeEventListener("visibilitychange", onVis);
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerup", onUp);
      stage.removeEventListener("pointercancel", onUp);
      stage.removeEventListener("wheel", onWheel);
      scene.traverse(o => { if (o.isMesh) { o.geometry.dispose(); [].concat(o.material).forEach(m => m.dispose()); } });
      renderer.dispose();
    },
  };
}
