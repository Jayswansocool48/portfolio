// Damped springs, solved in closed form. Every animation keeps its position and velocity,
// so starting a new one mid-flight carries on smoothly from wherever the old one was.
(function () {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const running = new Map();

  // Position offset from the target at time t, for start offset x0 and start velocity v0.
  function solve(x0, v0, k, c, m) {
    const w0 = Math.sqrt(k / m), z = c / (2 * Math.sqrt(k * m));
    if (z < 1) {
      const wd = w0 * Math.sqrt(1 - z * z), b = (v0 + z * w0 * x0) / wd;
      return t => Math.exp(-z * w0 * t) * (x0 * Math.cos(wd * t) + b * Math.sin(wd * t));
    }
    if (z === 1) return t => Math.exp(-w0 * t) * (x0 + (v0 + w0 * x0) * t);
    const wd = w0 * Math.sqrt(z * z - 1), b = (v0 + z * w0 * x0) / wd;
    return t => Math.exp(-z * w0 * t) * (x0 * Math.cosh(wd * t) + b * Math.sinh(wd * t));
  }

  const PRESETS = {
    sheet: { stiffness: 320, damping: 34, mass: 1 },
    snappy: { stiffness: 520, damping: 40, mass: 1 },
    gentle: { stiffness: 140, damping: 22, mass: 1 },
  };

  // spring(key, { from, to, velocity, preset | stiffness/damping/mass, precision, onUpdate, onDone })
  // Calling it again with the same key retargets the running spring and keeps its velocity.
  function spring(key, o) {
    const p = { ...PRESETS[o.preset || "sheet"], ...o };
    const prev = running.get(key);
    const from = prev ? prev.value : (o.from ?? o.to);
    const v0 = prev ? prev.velocity : (o.velocity || 0);
    if (prev) cancelAnimationFrame(prev.raf);
    const eps = p.precision ?? Math.max(0.001, Math.abs(o.to - from) / 2000);
    const state = { value: from, velocity: v0, raf: 0 };
    running.set(key, state);

    if (reduced || from === o.to && !v0) {
      state.value = o.to; state.velocity = 0;
      o.onUpdate && o.onUpdate(o.to);
      running.delete(key);
      o.onDone && o.onDone();
      return state;
    }

    const x = solve(from - o.to, v0, p.stiffness, p.damping, p.mass);
    const start = performance.now();
    const tick = now => {
      const t = (now - start) / 1000, off = x(t);
      state.value = o.to + off;
      state.velocity = (x(t + 0.001) - off) / 0.001;
      if (Math.abs(off) < eps && Math.abs(state.velocity) < eps * 10) {
        state.value = o.to; state.velocity = 0;
        o.onUpdate && o.onUpdate(o.to);
        running.delete(key);
        o.onDone && o.onDone();
        return;
      }
      o.onUpdate && o.onUpdate(state.value);
      state.raf = requestAnimationFrame(tick);
    };
    state.raf = requestAnimationFrame(tick);
    return state;
  }

  function stop(key) {
    const s = running.get(key);
    if (s) { cancelAnimationFrame(s.raf); running.delete(key); }
    return s;
  }

  window.Motion = { spring, stop, reduced, value: key => running.get(key)?.value };
})();
