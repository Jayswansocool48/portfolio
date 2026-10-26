// Everything the site shows lives in this file. Edit an entry and every page updates.

window.STUDIO = {
  since: 2020,
  email: "jason.harvey@brickedmyportfolio.com",
  discord: "ironlanternstudio",
  // Paste a full link to show an icon in the footer and on the Contact page. Empty ones stay hidden.
  socials: {
    itch: "",
    youtube: "",
    github: "",
    steam: "",
    twitter: "",
    instagram: "",
  },
};

// Games.
//
// id        lowercase-with-dashes, used in links (games.html#after-hours)
// tags      a few genre words, used by the filter on the Games page
// status    a short label, like "In development"
// featured  true shows it on the home page
// current   true puts it in the Current projects carousel on the home page
// caption   one line under it in the carousel, like "Working on the assets"
// cover     the cover image, like "media/after-hours-cover.webp". Until the file exists, a placeholder shows
// trailer   optional teaser or trailer video file, like "media/after-hours-teaser.mp4" (with an optional poster image)
// tint      a background color for the placeholder
// summary   one line for cards
// about     a paragraph or two for the detail sheet
// images    optional, [{ src: "media/after-hours-1.webp", alt: "...", tint: "#2a2f2b" }]
// links     optional, [{ label: "Wishlist on itch.io", href: "https://..." }, { label: "Watch the trailer", href: "..." }]
// show      false hides it everywhere without deleting it

window.GAMES = [
  {
    id: "after-hours",
    name: "After Hours",
    tags: ["Horror", "First-person", "PSX style"],
    status: "In development",
    featured: true,
    current: true,
    caption: "First teaser",
    cover: "media/after-hours-cover.webp",
    trailer: { src: "media/after-hours-teaser.mp4", poster: "media/after-hours-cover.webp" },
    tint: "#1d221f",
    summary: "First-person horror you play from a desk chair.",
    about: [
      "You stay late at a computer after everyone else goes home. The computer runs a full in-game operating system with a browser, a mail client and files to dig through, and you use it to finish each chapter's work.",
      "The scares come from the room behind you. Each chapter puts you at a different person's desk. Chapter 1 takes place in a house.",
    ],
    show: true,
  },
  {
    id: "crazy-taxi",
    name: "Crazy Taxi",
    tags: ["Action", "Racing", "Arcade"],
    status: "Building assets",
    featured: true,
    current: true,
    caption: "Working on the assets",
    tint: "#2a2618",
    summary: "Pick up fares and race the clock across a stunt-filled city.",
    about: [
      "You tear through city streets picking up passengers and dropping them off before the timer runs out, with jumps and stunts along the route.",
      "I'm modeling the city and the cars right now.",
    ],
    show: true,
  },
  {
    id: "mirrored-life",
    name: "Mirrored Life",
    tags: ["Fantasy", "Story-driven", "Casual"],
    status: "In development",
    featured: true,
    tint: "#18252a",
    summary: "One person, two parallel lives.",
    about: ["You follow two storylines that run side by side, each showing a different side of the same person."],
    show: true,
  },
  {
    id: "the-last-draft",
    name: "The Last Draft",
    tags: ["Mystery", "Adventure", "Story-driven"],
    status: "In development",
    featured: true,
    tint: "#2a211b",
    summary: "A writer fights to finish one final manuscript.",
    about: ["You play a writer trying to finish their last manuscript, and you piece together why it matters so much to them."],
    show: true,
  },
];

// Store items.
//
// category  "models", "gui", "scripts", "audio" or "textures"
// engine    what it works with, like "Any engine" or "Roblox"
// price     like "$9.99". Leave it out while the item isn't for sale
// buy       where to buy it once it's for sale, { label: "Buy on itch.io", href: "https://..." }
// added     "YYYY-MM-DD", used by the Newest sort
// featured  true shows it on the home page

window.ASSETS = [
  {
    id: "road-prop-pack",
    name: "Road Prop Pack",
    category: "models",
    engine: "Any engine",
    tags: ["Low poly", "Props", "Racing"],
    status: "In progress",
    featured: true,
    added: "2025-06-01",
    tint: "#2b2018",
    summary: "Low-poly props for roads and racing scenes.",
    about: ["Cones, barriers, signs and street furniture for city and racing scenes, modeled low-poly. I'm building the pack alongside Crazy Taxi."],
    show: true,
  },
  {
    id: "roblox-menu-gui",
    name: "Roblox Menu GUI",
    category: "gui",
    engine: "Roblox",
    tags: ["Menu", "Animated", "Mobile-ready"],
    status: "In progress",
    featured: true,
    added: "2025-03-01",
    tint: "#18212b",
    summary: "An animated menu system for Roblox games.",
    about: ["A full menu system for Roblox with animated transitions, themes you can change, and layouts that work on phones."],
    show: true,
  },
];

window.CATEGORIES = {
  models: "3D models",
  gui: "GUI and UI",
  scripts: "Scripts",
  audio: "Audio",
  textures: "Textures",
};
