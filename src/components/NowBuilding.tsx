// The Now building carousel from the old site, rebuilt: big media frame, side arrows, drag or
// flick to switch, dots, and a caption that rises in for each project. Position is one spring.
import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, AnimatePresence, type PanInfo } from "motion/react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import Cover from "./Cover";
import { springs } from "@/lib/springs";

export interface Slide {
  id: string; name: string; href: string; tag: string; status: string; caption?: string;
  coverUrl: string | null; tint: string; trailer?: { src: string; poster: string | null } | null;
}

export default function NowBuilding({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const frame = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const reduce = useReducedMotion();
  const width = () => frame.current?.clientWidth || 1;

  const go = (n: number, velocity = 0) => {
    const next = Math.max(0, Math.min(slides.length - 1, n));
    setI(next);
    frame.current?.querySelectorAll("video").forEach((v, j) => { if (j !== next) v.pause(); });
    animate(x, -next * width(), reduce ? { duration: 0 } : { ...springs.standard, velocity });
  };
  useEffect(() => {
    const onResize = () => x.set(-i * width());
    addEventListener("resize", onResize);
    return () => removeEventListener("resize", onResize);
  }, [i, x]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const w = width();
    const projected = -x.get() / w - info.velocity.x / w * 0.25;
    go(Math.round(projected), info.velocity.x);
  };

  const s = slides[i];
  if (!slides.length) return null;
  return (
    <div>
      <div
        ref={frame}
        className="relative overflow-hidden rounded-xl border bg-card squircle"
        role="group"
        aria-roledescription="carousel"
        aria-label="Projects in progress"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === "ArrowRight") { e.preventDefault(); go(i + 1); }
          if (e.key === "ArrowLeft") { e.preventDefault(); go(i - 1); }
        }}
      >
        <motion.div
          className="flex touch-pan-y"
          style={{ x }}
          drag={slides.length > 1 ? "x" : false}
          dragConstraints={{ left: -(slides.length - 1) * 2000, right: 0 }}
          dragElastic={0.12}
          dragMomentum={false}
          onDragEnd={onDragEnd}
        >
          {slides.map((sl, j) => (
            <div key={sl.id} className="aspect-[16/9] w-full shrink-0" aria-hidden={j !== i} role="group" aria-roledescription="slide" aria-label={`${sl.name}, ${j + 1} of ${slides.length}`}>
              {sl.trailer ? (
                <div className="scanlines relative h-full w-full" style={{ background: sl.tint }}>
                  <video
                    className="absolute inset-0 h-full w-full object-cover"
                    src={sl.trailer.src}
                    poster={sl.trailer.poster || undefined}
                    controls
                    playsInline
                    preload="metadata"
                    tabIndex={j === i ? 0 : -1}
                  />
                </div>
              ) : (
                <Cover name={sl.name} url={sl.coverUrl} tint={sl.tint} id={`slide-${sl.id}`} size="hero" />
              )}
            </div>
          ))}
        </motion.div>
        {slides.length > 1 && (["prev", "next"] as const).map(k => (
          <button
            key={k}
            type="button"
            aria-label={k === "prev" ? "Previous project" : "Next project"}
            disabled={k === "prev" ? i === 0 : i === slides.length - 1}
            onClick={() => go(i + (k === "prev" ? -1 : 1))}
            className={`absolute top-1/2 z-[3] grid size-12 -translate-y-1/2 place-items-center rounded-full border bg-background/80 text-foreground backdrop-blur-sm hover:bg-background disabled:opacity-30 ${k === "prev" ? "left-3 sm:left-4" : "right-3 sm:right-4"}`}
          >
            {k === "prev" ? <CaretLeft size={20} weight="bold" /> : <CaretRight size={20} weight="bold" />}
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-5">
        <div className="min-w-0" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={springs.standard}
            >
              <p className="m-0 font-mono text-xs text-muted-foreground">{s.tag} · {s.status}</p>
              <h3 className="m-0 mt-1 font-display text-4xl font-extrabold uppercase leading-none tracking-wide">{s.name}</h3>
              {s.caption && <p className="m-0 mt-1.5 text-muted-foreground">{s.caption}</p>}
              <a href={s.href} className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary-text hover:underline">
                See the game <CaretRight size={14} weight="bold" aria-hidden />
              </a>
            </motion.div>
          </AnimatePresence>
        </div>
        {slides.length > 1 && (
          <div role="tablist" aria-label="Choose a project" className="flex">
            {slides.map((sl, j) => (
              <button key={sl.id} type="button" role="tab" aria-selected={j === i} aria-label={`Show ${sl.name}`} onClick={() => go(j)} className="grid size-11 place-items-center">
                <motion.span
                  className="block h-2 rounded-full"
                  animate={{ width: j === i ? 26 : 8, backgroundColor: j === i ? "#c8203c" : "#34353c" }}
                  transition={springs.standard}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
