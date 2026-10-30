// Turns catalog entries into the plain data the React islands need. Build time only.
import { CATEGORIES, STORES, type Item } from "@/data/catalog";
import { itemHref, media, price } from "./media";
import type { CardData } from "@/components/ProductCard";

export function toCard(item: Item): CardData {
  const live = item.get.filter(o => o.url);
  return {
    id: item.id,
    kind: item.kind,
    href: itemHref(item),
    name: item.name,
    meta: item.kind === "asset" ? `${CATEGORIES[item.category]} · ${item.engine}` : item.platforms.join(" · "),
    summary: item.summary,
    status: item.status,
    available: live.length > 0,
    price: price(item),
    stores: item.get.slice(0, 3).map(o => STORES[o.store].name === "This site" ? "Direct" : STORES[o.store].name),
    coverUrl: media(item.cover) ?? media(item.images?.[0]?.src),
    tint: item.tint,
    has3d: item.kind === "asset" && !!(media(item.model) || item.standIn),
    tags: item.tags,
    category: item.kind === "asset" ? item.category : undefined,
    added: item.kind === "asset" ? item.added : undefined,
    featured: item.featured,
  };
}
