// A cover image, or a title-card placeholder until the real art exists.
// The placeholder is set like a PS1 game's title screen: tinted ground, the name in the
// display face, the studio mark and a scanline overlay.
import { cn } from "@/lib/utils";

export const LanternMark = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" aria-hidden className={className}>
    <path d="M16 3v3M10 8h12l-2 3H12zM11 12h10v13H11zM9 27h14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M16 15c2.2 2 2.2 4.2 0 6.2-2.2-2-2.2-4.2 0-6.2z" className="fill-primary" />
  </svg>
);

export default function Cover({
  name, url, tint, id, className, size = "card", bare = false,
}: { name: string; url: string | null; tint: string; id: string; className?: string; size?: "card" | "hero"; bare?: boolean }) {
  return (
    <div
      className={cn("scanlines relative overflow-hidden", size === "card" ? "aspect-[16/10]" : "h-full w-full", className)}
      style={{ background: tint, viewTransitionName: `cover-${id}` }}
    >
      {url ? (
        <img src={url} alt={`Cover art for ${name}`} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      ) : bare ? (
        <LanternMark className="absolute right-[6%] top-[22%] size-[min(38vw,22rem)] text-foreground/[0.04]" />
      ) : (
        <div role="img" aria-label={`${name} title card`} className="absolute inset-0 grid content-end p-5 sm:p-7">
          <div
            aria-hidden
            className="absolute inset-0 opacity-60"
            style={{ background: "linear-gradient(to top, rgb(8 8 10 / 0.82), transparent 65%)" }}
          />
          <LanternMark className="absolute right-5 top-5 size-7 text-foreground/50" />
          <span aria-hidden className={cn(
            "relative font-display font-black uppercase leading-[0.85] tracking-wide text-foreground/90",
            size === "card" ? "text-[clamp(2.2rem,5vw,3.4rem)]" : "text-[clamp(3.5rem,11vw,9rem)]",
          )}>
            {name}
          </span>
          <span aria-hidden className="relative mt-2 font-mono text-[0.66rem] uppercase tracking-[0.2em] text-foreground/45">Iron Lantern Studios</span>
        </div>
      )}
    </div>
  );
}
