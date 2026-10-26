// Everything shown on the site lives in this file. Edit an entry and the page updates.

window.STUDIO = {
  email: "jason.harvey@brickedmyportfolio.com",
  discord: "ironlanternstudio",
};

// Games and assets.
//
// id      lowercase-with-dashes, used in the link (#after-hours)
// kind    "game" or "asset"
// tags    a few genre or format words
// status  a short label, like "In development" or "Coming soon"
// summary one line for the list
// about   a paragraph or two for the detail sheet
// price   optional, like "$9.99". Leave it out until the item is for sale
// images  optional, [{ src: "media/after-hours-1.webp", alt: "...", tint: "#2a2f2b" }]
// links   optional, [{ label: "Buy on Gumroad", href: "https://..." }]
// show    set to false to hide an entry without deleting it

window.PROJECTS = [
  {
    id: "after-hours",
    name: "After Hours",
    kind: "game",
    tags: ["Horror", "First-person", "PSX style"],
    status: "In development",
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
    kind: "game",
    tags: ["Action", "Racing", "Arcade"],
    status: "Building assets",
    summary: "Grab a fare, beat the clock, pull a stunt on the way.",
    about: [
      "You tear through city streets picking up passengers and dropping them off before the timer runs out, with jumps and stunts along the route.",
      "I'm modeling the city and the cars right now.",
    ],
    show: true,
  },
  {
    id: "mirrored-life",
    name: "Mirrored Life",
    kind: "game",
    tags: ["Fantasy", "Story-driven", "Casual"],
    status: "In development",
    summary: "One person, two parallel lives.",
    about: ["You follow two storylines that run side by side, each showing a different side of the same person."],
    show: true,
  },
  {
    id: "the-last-draft",
    name: "The Last Draft",
    kind: "game",
    tags: ["Mystery", "Adventure", "Story-driven"],
    status: "In development",
    summary: "A writer fights to finish one final manuscript.",
    about: ["You play a writer trying to finish their last manuscript, and you piece together why it matters so much to them."],
    show: true,
  },
  {
    id: "road-prop-pack",
    name: "Road Prop Pack",
    kind: "asset",
    tags: ["3D", "Low poly", "Props"],
    status: "In progress",
    summary: "Low-poly props for roads and racing scenes.",
    about: ["Cones, barriers, signs and street furniture, modeled low-poly so you can fill a whole city block without hurting frame rate. I'm building it alongside Crazy Taxi."],
    show: true,
  },
  {
    id: "roblox-menu-gui",
    name: "Roblox Menu GUI",
    kind: "asset",
    tags: ["Roblox", "GUI", "Animated"],
    status: "In progress",
    summary: "An animated menu system for Roblox games.",
    about: ["A full menu system for Roblox with animated transitions, themes you can change, and layouts that work on phones."],
    show: true,
  },
];

window.KINDS = { game: "Game", asset: "Asset" };
