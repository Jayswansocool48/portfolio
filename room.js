// After Hours concept frame: a 320x240 room drawn with ordered dithering.
// Press E or the on-screen prompt to work the lamp.
(function () {
  const room = document.getElementById("room");
  if (!room) return;
  const r = room.getContext("2d");
  const W = 320, H = 240;
  const frame = r.createImageData(W, H);
  const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const cold = [[5, 6, 5], [18, 22, 19], [38, 45, 40], [70, 78, 70], [120, 128, 112]];
  const warm = [[6, 5, 4], [30, 22, 14], [72, 50, 26], [140, 98, 48], [214, 170, 104]];
  const BW = { x0: 104, x1: 216, y0: 62, y1: 152 };
  const DOOR = { x0: 140, x1: 172, y0: 88 };
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let lamp = false;

  function surface(x, y, open) {
    if (x >= BW.x0 && x < BW.x1 && y >= BW.y0 && y < BW.y1) {
      if (x >= DOOR.x0 && x < DOOR.x1 && y >= DOOR.y0) {
        const gap = DOOR.x0 + open * (DOOR.x1 - DOOR.x0);
        if (x < gap) {
          const cx = DOOR.x0 + 11;
          const head = (x - cx) ** 2 + (y - 102) ** 2 < 20;
          const body = Math.abs(x - cx) < (y < 112 ? 4 : 6) && y > 106;
          return open > 0.55 && (head || body) ? 0.09 : 0;
        }
        return 0.42;
      }
      return 0.3;
    }
    if (y >= BW.y1) {
      if (y > 214) return 0.5;
      return 0.22 + ((Math.floor((x - 160) / ((y - 120) * 0.35 + 1)) & 1) ? 0.03 : 0);
    }
    if (y < BW.y0) return 0.1;
    return 0.26;
  }

  function render(t) {
    const c = (t / 1000) % 22;
    const open = c < 8 ? 0 : c < 13 ? (c - 8) / 5 : c < 18 ? 1 : Math.max(0, 1 - (c - 18) / 2);
    const flicker = 0.94 + 0.06 * Math.sin(t / 47) * Math.sin(t / 113);
    const ramp = lamp ? warm : cold;
    const d = frame.data;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        let light;
        if (lamp) light = Math.max(0.15, 1.5 - Math.hypot(x - 280, y - 230) / 210);
        else light = Math.max(0.12, 1.05 - Math.hypot(x - 160, y - 260) / 260) * flicker;
        const level = Math.min(1, surface(x, y, open) * light * 2.2) * (ramp.length - 1);
        const lo = Math.floor(level);
        const pick = (level - lo) * 16 > bayer[(y & 3) * 4 + (x & 3)] ? lo + 1 : lo;
        const col = ramp[Math.min(ramp.length - 1, pick)];
        const i = (y * W + x) * 4;
        d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = 255;
      }
    }
    r.putImageData(frame, 0, 0);
  }

  const clock = document.getElementById("clock");
  function tick(t) {
    const m = 2 * 60 + 47 + Math.floor(t / 4000);
    clock.textContent = String(Math.floor(m / 60) % 24).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
  }

  // Draw only while the screen is on view.
  let visible = true, last = 0;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(room);
  function loop(t) {
    if (visible && t - last > 66) { render(t); tick(t); last = t; }
    requestAnimationFrame(loop);
  }
  if (still) render(9000); else requestAnimationFrame(loop);

  function toggle() {
    lamp = !lamp;
    document.querySelector(".lamp").setAttribute("aria-pressed", String(lamp));
    if (still) render(9000);
  }
  document.querySelector(".lamp").addEventListener("click", toggle);
  addEventListener("keydown", e => {
    if (e.key.toLowerCase() === "e" && !e.ctrlKey && !e.metaKey && !e.target.closest("input, textarea, dialog")) toggle();
  });
})();
