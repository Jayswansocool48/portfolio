// Build-time helpers. These run in Astro frontmatter only, never in the browser.
import { existsSync } from "node:fs";
import { join } from "node:path";
import { STORES, type Item, type Offer } from "@/data/catalog";
import { href } from "./utils";

/** The public URL of a media file, or null when the file isn't in public/ yet. */
export function media(path?: string): string | null {
  if (!path) return null;
  return existsSync(join(process.cwd(), "public", path)) ? href(path) : null;
}

export function itemHref(item: Item) {
  return href(`${item.kind === "game" ? "games" : "store"}/${item.id}`);
}

export interface LiveOffer extends Offer { name: string; text: string }

export function offers(item: Item): { live: LiveOffer[]; planned: LiveOffer[] } {
  const all = item.get.map(o => ({
    ...o,
    name: STORES[o.store].name,
    text: o.label || STORES[o.store].action,
  }));
  return { live: all.filter(o => o.url), planned: all.filter(o => !o.url) };
}

export function price(item: Item) {
  return item.get.find(o => o.url && o.price)?.price;
}
