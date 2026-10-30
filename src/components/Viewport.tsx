// An engine-style 3D viewport: title bar, PSX and wireframe toggles, live stats, drag to turn.
// Three.js loads only when the viewport scrolls near the screen.
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface Stats { tris: number; draws: number; res: string; fps: number | null }
type Controller = { setPsx(v: boolean): void; setWire(v: boolean): void; nudge(d: number): void; dispose(): void };

export interface ViewportProps {
  scene?: "lantern" | "road-props";
  model?: string;
  label?: string;
  zoom?: boolean;
  /** "hero" fills its container with no frame and floats the HUD over it */
  framing?: "hero" | "inspect";
  className?: string;
}

export default function Viewport({ scene = "lantern", model, label, zoom, framing = "inspect", className }: ViewportProps) {
  const stage = useRef<HTMLDivElement>(null);
  const ctl = useRef<Controller | null>(null);
  const reduced = !!useReducedMotion();
  const [psx, setPsx] = useState(true);
  const [wire, setWire] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [name, setName] = useState(label || "");
  const [state, setState] = useState<"idle" | "ready" | "error">("idle");

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    let disposed = false;
    const start = async () => {
      try {
        const { mountViewport } = await import("@/lib/psx.js");
        if (disposed) return;
        ctl.current = await mountViewport(el, {
          scene, model, zoom, reduced, framing,
          onStats: setStats,
          onLabel: (t: string) => setName(n => label || n || t),
        });
        if (disposed) ctl.current?.dispose(); else setState("ready");
      } catch {
        if (!disposed) setState("error");
      }
    };
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); start(); } }, { rootMargin: "200px" });
    io.observe(el);
    return () => { disposed = true; io.disconnect(); ctl.current?.dispose(); ctl.current = null; };
  }, [scene, model, zoom, reduced, framing, label]);

  const toggle = (which: "psx" | "wire") => {
    if (which === "psx") { const v = !psx; setPsx(v); ctl.current?.setPsx(v); }
    else { const v = !wire; setWire(v); ctl.current?.setWire(v); }
  };

  const hero = framing === "hero";
  const tools = (
    <span className="flex gap-1.5">
      {(["psx", "wire"] as const).map(k => {
        const on = k === "psx" ? psx : wire;
        return (
          <button
            key={k}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(k)}
            className={cn(
              "relative min-h-8 min-w-11 rounded-md border px-2.5 font-mono text-[0.7rem] uppercase tracking-wider squircle",
              "after:absolute after:-inset-1.5 after:content-['']",
              on ? "border-primary/60 bg-secondary text-primary" : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {k === "psx" ? "PSX" : "Wire"}
          </button>
        );
      })}
    </span>
  );

  const hud = (
    <dl className={cn("pointer-events-none absolute z-[2] m-0 grid gap-0.5 font-mono text-[0.68rem] leading-snug text-primary num", hero ? "right-5 top-24 sm:right-8" : "left-3 top-3")}>
      {stats && (
        <>
          <div className="flex gap-2"><dt className="w-11 text-muted-foreground">Tris</dt><dd>{stats.tris}</dd></div>
          <div className="flex gap-2"><dt className="w-11 text-muted-foreground">Draws</dt><dd>{stats.draws}</dd></div>
          <div className="flex gap-2"><dt className="w-11 text-muted-foreground">Res</dt><dd>{stats.res}</dd></div>
          {stats.fps !== null && <div className="flex gap-2"><dt className="w-11 text-muted-foreground">FPS</dt><dd>{stats.fps}</dd></div>}
        </>
      )}
    </dl>
  );

  const stageEl = (
    <div
      ref={stage}
      tabIndex={0}
      role="img"
      aria-label={`${name || "3D model"}. Drag to turn${zoom ? ", scroll to zoom" : ""}. Arrow keys turn it too.`}
      onKeyDown={e => {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); ctl.current?.nudge(e.key === "ArrowLeft" ? -1 : 1); }
      }}
      className={cn(
        "scanlines relative cursor-grab touch-pan-y outline-offset-[-3px] data-[grabbing=true]:cursor-grabbing",
        hero ? "absolute inset-0" : "aspect-[16/10]",
      )}
    >
      <canvas aria-hidden className="absolute inset-0 block h-full w-full data-[psx=true]:[image-rendering:pixelated]" />
      {hud}
      {state === "error" && (
        <p className="absolute inset-0 m-0 grid place-items-center p-4 text-center text-sm text-muted-foreground">
          This 3D view needs WebGL, which your browser has turned off.
        </p>
      )}
      {!hero && <p className="pointer-events-none absolute bottom-2.5 right-3 z-[2] m-0 font-mono text-[0.68rem] text-muted-foreground">Drag to turn{zoom ? " · scroll to zoom" : ""}</p>}
    </div>
  );

  if (hero) {
    return (
      <div className={cn("absolute inset-0", className)}>
        {stageEl}
        <div className="absolute bottom-6 right-5 z-[3] flex items-center gap-3 sm:right-8">
          <span className="hidden font-mono text-[0.7rem] text-muted-foreground sm:inline">Drag to turn</span>
          {tools}
        </div>
      </div>
    );
  }

  return (
    <figure className={cn("m-0 grid overflow-hidden rounded-xl border bg-card squircle", className)}>
      <div className="flex items-center justify-between gap-3 border-b py-1.5 pl-3.5 pr-1.5 font-mono text-xs text-muted-foreground">
        <span className="flex min-w-0 items-center gap-2 truncate">
          <i aria-hidden className="size-1.5 shrink-0 rounded-full bg-destructive" />
          {name || "Loading model"}
        </span>
        {tools}
      </div>
      {stageEl}
    </figure>
  );
}
