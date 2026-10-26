// ---- Edit these two things ----------------------------------------------

// Your studio or handle name. It fills every [data-studio] spot on the page.
const STUDIO = "Studio Name";

// Rebuilt projects go here. Each one shows up under "Other work".
// { name: "Game Codex", note: "Game design app for Pop!_OS", state: "Rebuilding", url: "" }
const PROJECTS = [];

// -------------------------------------------------------------------------

document.querySelectorAll("[data-studio]").forEach(el => { el.textContent = STUDIO; });
document.title = "After Hours | " + STUDIO;
document.getElementById("year").textContent = new Date().getFullYear();

const list = document.getElementById("work-list");
if (PROJECTS.length === 0) {
  const li = document.createElement("li");
  li.innerHTML = '<span class="empty">Nothing here yet. Check back after the rebuilds.</span>';
  list.appendChild(li);
} else {
  for (const p of PROJECTS) {
    const li = document.createElement("li");
    const name = p.url ? `<a class="w-name" href="${p.url}">${p.name}</a>` : `<span class="w-name">${p.name}</span>`;
    li.innerHTML = `<div>${name}<span class="w-note">${p.note || ""}</span></div><span class="w-state">${p.state || ""}</span>`;
    list.appendChild(li);
  }
}

const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---- Film grain ---------------------------------------------------------
const grain = document.getElementById("grain");
const g = grain.getContext("2d");
grain.width = 160; grain.height = 160;
function drawGrain() {
  const img = g.createImageData(160, 160);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
}
drawGrain();
if (!still) setInterval(drawGrain, 90);

// ---- The room, 320x240, ordered dither ----------------------------------
const room = document.getElementById("room");
const r = room.getContext("2d");
const W = 320, H = 240;
const frame = r.createImageData(W, H);
const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

// Dark-to-pale ramps: cold for monitor light, warm for the lamp.
const cold = [[5, 6, 5], [18, 22, 19], [38, 45, 40], [70, 78, 70], [120, 128, 112]];
const warm = [[6, 5, 4], [30, 22, 14], [72, 50, 26], [140, 98, 48], [214, 170, 104]];

// Back wall and door, in screen pixels.
const BW = { x0: 104, x1: 216, y0: 62, y1: 152 };
const DOOR = { x0: 140, x1: 172, y0: 88, y1: 152 };

let lamp = false;

function surface(x, y, open) {
  // Returns base reflectance; 0 for the void past the door.
  if (x >= BW.x0 && x < BW.x1 && y >= BW.y0 && y < BW.y1) {
    if (x >= DOOR.x0 && x < DOOR.x1 && y >= DOOR.y0) {
      const gap = DOOR.x0 + open * (DOOR.x1 - DOOR.x0);
      if (x < gap) {
        // Something stands in the doorway once it is mostly open.
        const cx = DOOR.x0 + 11, headY = 102;
        const inHead = (x - cx) ** 2 + (y - headY) ** 2 < 20;
        const inBody = Math.abs(x - cx) < 6 - (y < 112 ? 2 : 0) && y > 106;
        if (open > 0.55 && (inHead || inBody)) return 0.09;
        return 0;
      }
      return 0.42;
    }
    return 0.3;
  }
  if (y >= BW.y1) {
    // Floor, with a desk edge across the bottom.
    if (y > 214) return 0.5;
    return 0.22 + ((Math.floor((x - 160) / ((y - 120) * 0.35 + 1)) & 1) ? 0.03 : 0);
  }
  if (y < BW.y0) return 0.1;            // ceiling
  return 0.26;                          // side walls
}

function render(t) {
  const cycle = (t / 1000) % 22;
  const open = cycle < 8 ? 0 : cycle < 13 ? (cycle - 8) / 5 : cycle < 18 ? 1 : Math.max(0, 1 - (cycle - 18) / 2);
  const flicker = 0.94 + 0.06 * Math.sin(t / 47) * Math.sin(t / 113);
  const ramp = lamp ? warm : cold;
  const d = frame.data;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const base = surface(x, y, open);
      let light;
      if (lamp) {
        const dx = x - 280, dy = y - 230;
        light = Math.max(0.15, 1.5 - Math.sqrt(dx * dx + dy * dy) / 210);
      } else {
        const dx = x - 160, dy = y - 260;
        light = Math.max(0.12, 1.05 - Math.sqrt(dx * dx + dy * dy) / 260) * flicker;
      }
      const v = Math.min(1, base * light * 2.2);
      const level = v * (ramp.length - 1);
      const lo = Math.floor(level);
      const pick = (level - lo) * 16 > bayer[(y & 3) * 4 + (x & 3)] ? lo + 1 : lo;
      const c = ramp[Math.min(ramp.length - 1, pick)];
      const i = (y * W + x) * 4;
      d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255;
    }
  }
  r.putImageData(frame, 0, 0);
}

// Clock starts at 02:47 and runs one in-game minute every 4 seconds.
const clock = document.getElementById("clock");
function tickClock(t) {
  const mins = 2 * 60 + 47 + Math.floor(t / 4000);
  clock.textContent = String(Math.floor(mins / 60) % 24).padStart(2, "0") + ":" + String(mins % 60).padStart(2, "0");
}

let last = 0;
function loop(t) {
  if (t - last > 66) { render(t); tickClock(t); last = t; }   // ~15 fps, on purpose
  requestAnimationFrame(loop);
}
if (still) render(9000); else requestAnimationFrame(loop);

// Press E (or tap the prompt) to work the lamp.
const prompt = document.querySelector(".prompt");
function toggleLamp() { lamp = !lamp; if (still) render(9000); }
document.addEventListener("keydown", e => {
  if ((e.key === "e" || e.key === "E") && !e.target.closest("input, textarea")) toggleLamp();
});
prompt.addEventListener("click", toggleLamp);
prompt.style.cursor = "pointer";
