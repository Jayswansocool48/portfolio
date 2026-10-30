// The filterable grid on the Games and Store pages. Cards rearrange on a spring.
import { useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import ProductCard, { type CardData } from "./ProductCard";
import { springs } from "@/lib/springs";
import { cn } from "@/lib/utils";

type SortKey = "featured" | "newest" | "low" | "high";
const priceNum = (d: CardData) => (d.price ? parseFloat(d.price.replace(/[^0-9.]/g, "")) : Number.POSITIVE_INFINITY);

export default function Browser({
  cards, filters, filterBy, sortable = false, noun,
}: {
  cards: CardData[];
  filters: { key: string; label: string }[];
  filterBy: "tag" | "category";
  sortable?: boolean;
  noun: [string, string];
}) {
  const [active, setActive] = useState("all");
  const [sort, setSort] = useState<SortKey>("featured");

  const counts = useMemo(() => Object.fromEntries(filters.map(f => [
    f.key, cards.filter(c => (filterBy === "tag" ? c.tags.includes(f.key) : c.category === f.key)).length,
  ])), [cards, filters, filterBy]);

  const shown = useMemo(() => {
    const list = active === "all" ? cards : cards.filter(c => (filterBy === "tag" ? c.tags.includes(active) : c.category === active));
    const order: Record<SortKey, (a: CardData, b: CardData) => number> = {
      featured: (a, b) => Number(!!b.featured) - Number(!!a.featured),
      newest: (a, b) => String(b.added).localeCompare(String(a.added)),
      low: (a, b) => priceNum(a) - priceNum(b),
      high: (a, b) => (priceNum(b) === Infinity ? -1 : priceNum(b)) - (priceNum(a) === Infinity ? -1 : priceNum(a)),
    };
    return [...list].sort(order[sort]);
  }, [cards, active, sort, filterBy]);

  const chip = (key: string, label: string, n: number) => (
    <button
      key={key}
      type="button"
      role="tab"
      aria-selected={active === key}
      disabled={n === 0}
      onClick={() => setActive(key)}
      className={cn(
        "relative inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 text-sm disabled:cursor-default disabled:opacity-40",
        active === key ? "border-transparent text-primary-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {active === key && <motion.span layoutId={`chip-${noun[0]}`} transition={springs.standard} className="absolute inset-0 -z-0 rounded-full bg-primary" />}
      <span className="relative">{label}</span>
      <b className="relative font-mono text-[0.68rem] font-normal num">{n}</b>
    </button>
  );

  return (
    <div>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label={`Filter ${noun[1]}`}
          className="flex flex-wrap gap-1.5"
          onKeyDown={e => {
            if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
            const btns = [...e.currentTarget.querySelectorAll<HTMLButtonElement>("button:not([disabled])")];
            const i = btns.indexOf(document.activeElement as HTMLButtonElement);
            const next = btns[(i + (e.key === "ArrowRight" ? 1 : -1) + btns.length) % btns.length];
            next?.focus(); next?.click();
          }}
        >
          {chip("all", "All", cards.length)}
          {filters.map(f => chip(f.key, f.label, counts[f.key]))}
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-muted-foreground num" aria-live="polite">
            {shown.length} {shown.length === 1 ? noun[0] : noun[1]}
          </span>
          {sortable && (
            <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              Sort
              <select
                value={sort}
                onChange={e => setSort(e.target.value as SortKey)}
                className="min-h-10 rounded-lg border bg-card px-3 text-foreground squircle"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
              </select>
            </label>
          )}
        </div>
      </div>
      <LayoutGroup>
        <motion.ul layout className="m-0 grid list-none grid-cols-1 gap-5 p-0 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {shown.map(c => (
              <motion.li
                key={c.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={springs.standard}
              >
                <ProductCard d={c} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </LayoutGroup>
    </div>
  );
}
