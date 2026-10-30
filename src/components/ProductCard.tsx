import { TiltCard } from "./ui/TiltCard";
import { Cube } from "@phosphor-icons/react/dist/ssr";
import Cover from "./Cover";

export interface CardData {
  id: string;
  kind: "game" | "asset";
  href: string;
  name: string;
  meta: string;
  summary: string;
  status: string;
  /** True when at least one store link is live */
  available: boolean;
  price?: string;
  stores: string[];
  coverUrl: string | null;
  tint: string;
  has3d: boolean;
  tags: string[];
  category?: string;
  added?: string;
  featured?: boolean;
}

export default function ProductCard({ d }: { d: CardData }) {
  return (
    <TiltCard className="h-full rounded-xl">
      <a
        href={d.href}
        className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card squircle hover:border-primary/40 focus-visible:outline-offset-2"
      >
        <div className="relative">
          <Cover name={d.name} url={d.coverUrl} tint={d.tint} id={d.id} />
          {d.has3d && (
            <span className="absolute left-3 top-3 z-[2] inline-flex items-center gap-1.5 rounded-md border border-primary/50 bg-background/80 px-2 py-1 font-mono text-[0.68rem] text-primary">
              <Cube size={13} weight="bold" aria-hidden /> 3D view
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1.5 p-5">
          <span className="font-mono text-[0.7rem] text-muted-foreground">{d.meta}</span>
          <span className="font-display text-[1.7rem] font-extrabold uppercase leading-none tracking-wide">{d.name}</span>
          <span className="text-[0.95rem] text-muted-foreground">{d.summary}</span>
          <span className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
            {d.available ? (
              <span className="rounded-md bg-primary px-2 py-1 font-mono text-[0.7rem] font-medium text-primary-foreground">
                {d.price || "Available now"}
              </span>
            ) : (
              <span className="rounded-md border border-primary/40 px-2 py-1 font-mono text-[0.7rem] text-primary">{d.status}</span>
            )}
            <span className="font-mono text-[0.68rem] text-muted-foreground">{d.stores.join(" · ")}</span>
          </span>
        </div>
      </a>
    </TiltCard>
  );
}
