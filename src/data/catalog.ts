// Everything the site shows lives in this file. Edit an entry and every page updates on the
// next build. Media paths point into public/, so "media/after-hours-cover.webp" means
// public/media/after-hours-cover.webp. A path to a file that doesn't exist yet shows the
// placeholder cover instead.

export const STUDIO = {
  name: "Iron Lantern Studios",
  owner: "Jason",
  since: 2020,
  email: "jason.harvey@brickedmyportfolio.com",
  discord: "ironlanternstudio",
  /** The company that runs checkout for "Buy here" links. Shown under the button. */
  checkoutProvider: "",
  /** Paste a full link to show it in the footer and on the Contact page. Empty ones stay hidden. */
  socials: {
    itch: "",
    youtube: "",
    github: "",
    steam: "",
    x: "",
    instagram: "",
  } as Record<string, string>,
};

export const SOCIAL_NAMES: Record<string, string> = {
  itch: "itch.io", youtube: "YouTube", github: "GitHub", steam: "Steam", x: "X", instagram: "Instagram",
};

export type StoreKey =
  | "site" | "steam" | "itch" | "google-play" | "app-store" | "browser"
  | "roblox" | "roblox-store" | "fab" | "unity-store";

export const STORES: Record<StoreKey, { name: string; action: string }> = {
  site: { name: "This site", action: "Buy here" },
  steam: { name: "Steam", action: "Get it on Steam" },
  itch: { name: "itch.io", action: "Get it on itch.io" },
  "google-play": { name: "Google Play", action: "Get it on Google Play" },
  "app-store": { name: "App Store", action: "Download on the App Store" },
  browser: { name: "Browser", action: "Play in your browser" },
  roblox: { name: "Roblox", action: "Play on Roblox" },
  "roblox-store": { name: "Roblox Creator Store", action: "Get it on Roblox" },
  fab: { name: "Fab", action: "Get it on Fab" },
  "unity-store": { name: "Unity Asset Store", action: "Get it on the Unity Asset Store" },
};

/** Where to buy or play something. Leave `url` empty until the store page exists. */
export interface Offer {
  store: StoreKey;
  url: string;
  price?: string;
  /** Overrides the button text, for example "Wishlist on Steam". */
  label?: string;
}

export interface Shot { src: string; alt: string }

interface Base {
  id: string;
  name: string;
  tags: string[];
  status: string;
  summary: string;
  about: string[];
  get: Offer[];
  featured?: boolean;
  /** Background color for the placeholder cover. */
  tint: string;
  cover?: string;
  images?: Shot[];
  show?: boolean;
}

export interface Game extends Base {
  kind: "game";
  platforms: string[];
  /** Shows in the Now building strip on the home page. */
  current?: boolean;
  /** One line under it in Now building. */
  caption?: string;
  trailer?: { src: string; poster?: string };
}

export type AssetCategory = "models" | "gui" | "scripts" | "audio" | "textures";

export interface Asset extends Base {
  kind: "asset";
  category: AssetCategory;
  engine: string;
  /** "YYYY-MM-DD", for the Newest sort. */
  added: string;
  /** A .glb or .gltf export from Blender, opened in the 3D inspector. */
  model?: string;
  /** A built-in low-poly stand-in for the 3D inspector until the real model exists. */
  standIn?: "road-props" | "lantern";
}

export const CATEGORIES: Record<AssetCategory, string> = {
  models: "3D models",
  gui: "GUI and UI",
  scripts: "Scripts",
  audio: "Audio",
  textures: "Textures",
};

const GAMES_ALL: Game[] = [
  {
    kind: "game",
    id: "after-hours",
    name: "After Hours",
    tags: ["Horror", "First-person", "PSX style"],
    platforms: ["Windows"],
    get: [
      { store: "steam", url: "", label: "Wishlist on Steam" },
      { store: "itch", url: "" },
      { store: "site", url: "" },
    ],
    status: "In development",
    featured: true,
    current: true,
    caption: "Building Chapter 1",
    cover: "media/after-hours-cover.webp",
    trailer: { src: "media/after-hours-teaser.mp4", poster: "media/after-hours-cover.webp" },
    tint: "#1f1417",
    summary: "First-person horror you play from a desk chair.",
    about: [
      "You stay late at a computer after everyone else goes home. The computer runs a full in-game operating system with a browser, a mail client and files to dig through, and you use it to finish each chapter's work.",
      "The scares come from the room behind you. Each chapter puts you at a different person's desk. Chapter 1 takes place in a house.",
    ],
  },
  {
    kind: "game",
    id: "crazy-taxi",
    name: "Crazy Taxi",
    tags: ["Action", "Racing", "Arcade"],
    platforms: ["Windows"],
    get: [
      { store: "steam", url: "" },
      { store: "itch", url: "" },
    ],
    status: "Building assets",
    featured: true,
    current: true,
    caption: "Modeling the city and the cars",
    tint: "#1c1a18",
    summary: "Pick up fares and race the clock across a stunt-filled city.",
    about: [
      "You tear through city streets picking up passengers and dropping them off before the timer runs out, with jumps and stunts along the route.",
      "I'm modeling the city and the cars right now.",
    ],
  },
  {
    kind: "game",
    id: "mirrored-life",
    name: "Mirrored Life",
    tags: ["Fantasy", "Story-driven", "Casual"],
    platforms: ["Android", "iOS"],
    get: [
      { store: "google-play", url: "" },
      { store: "app-store", url: "" },
      { store: "itch", url: "" },
    ],
    status: "In development",
    featured: true,
    tint: "#151820",
    summary: "One person, two parallel lives.",
    about: ["You follow two storylines that run side by side, each showing a different side of the same person."],
  },
  {
    kind: "game",
    id: "the-last-draft",
    name: "The Last Draft",
    tags: ["Mystery", "Adventure", "Story-driven"],
    platforms: ["Windows", "Android", "iOS"],
    get: [
      { store: "steam", url: "" },
      { store: "google-play", url: "" },
      { store: "app-store", url: "" },
    ],
    status: "In development",
    featured: true,
    tint: "#1c191e",
    summary: "A writer fights to finish one final manuscript.",
    about: ["You play a writer trying to finish their last manuscript, and you piece together why it matters so much to them."],
  },
];

const ASSETS_ALL: Asset[] = [
  {
    kind: "asset",
    id: "road-prop-pack",
    name: "Road Prop Pack",
    category: "models",
    engine: "Any engine",
    tags: ["Low poly", "Props", "Racing"],
    get: [
      { store: "site", url: "" },
      { store: "fab", url: "" },
      { store: "itch", url: "" },
    ],
    status: "In progress",
    featured: true,
    added: "2025-06-01",
    tint: "#1f1918",
    standIn: "road-props",
    summary: "Low-poly props for roads and racing scenes.",
    about: ["Cones, barriers, signs and street furniture for city and racing scenes, modeled low-poly. I'm building the pack alongside Crazy Taxi."],
  },
  {
    kind: "asset",
    id: "roblox-menu-gui",
    name: "Roblox Menu GUI",
    category: "gui",
    engine: "Roblox",
    tags: ["Menu", "Animated", "Mobile-ready"],
    get: [
      { store: "roblox-store", url: "" },
      { store: "site", url: "" },
    ],
    status: "In progress",
    featured: true,
    added: "2025-03-01",
    tint: "#15181f",
    summary: "An animated menu system for Roblox games.",
    about: ["A full menu system for Roblox with animated transitions, themes you can change, and layouts that work on phones."],
  },
];

export const GAMES = GAMES_ALL.filter(g => g.show !== false);
export const ASSETS = ASSETS_ALL.filter(a => a.show !== false);
export type Item = Game | Asset;
export const ITEMS: Item[] = [...GAMES, ...ASSETS];
