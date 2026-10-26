// Every project on the site lives here. Add, remove or reorder entries and the page updates.
//
// id        lowercase-with-dashes, used in the link (#after-hours)
// name      shown on the page
// kind      "game", "app", "system" or "asset"
// platform  where it runs
// status    a short label, like "In development" or "Rebuilding"
// summary   one line for the index
// about     a paragraph or two for the detail sheet (array of strings)
// images    optional, [{ src: "media/after-hours-1.webp", alt: "...", tint: "#2a2f2b" }]
// links     optional, [{ label: "Source on GitHub", href: "https://github.com/..." }]
// show      set to false to hide a project without deleting it

// Contact email shown in the footer. Leave it empty to hide the line.
window.STUDIO = { email: "" };

window.PROJECTS = [
  {
    id: "after-hours",
    name: "After Hours",
    kind: "game",
    platform: "PC",
    status: "In development",
    summary: "First-person horror you play from a desk chair.",
    about: [
      "You stay late at a computer after everyone else goes home. The computer runs a full in-game operating system with a browser, a mail client and files to dig through, and you use it to finish each chapter's work.",
      "The scares come from the room behind you. Each chapter puts you at a different person's desk. Chapter 1 takes place in a house.",
    ],
    show: true,
  },
  {
    id: "game-codex",
    name: "Game Codex",
    kind: "app",
    platform: "Pop!_OS",
    status: "Rebuilding",
    summary: "A game design app for planning a game from first idea onward.",
    about: ["You keep a game's ideas, story and design documents in one desktop app. After Hours started its life here."],
    show: true,
  },
  {
    id: "poputil",
    name: "PopUtil",
    kind: "app",
    platform: "Pop!_OS",
    status: "Rebuilding",
    summary: "A one-window control panel for Pop!_OS.",
    about: ["PopUtil gathers system tweaks, disk cleanup and AI-assisted file sorting into one window, in the spirit of WinUtil on Windows."],
    show: true,
  },
  {
    id: "codeling",
    name: "Codeling",
    kind: "app",
    platform: "Web, Android",
    status: "Rebuilding",
    summary: "A web app that teaches you to code.",
    about: ["You learn to code through short lessons in the browser. Codeling also ships as an Android APK."],
    show: true,
  },
  {
    id: "inkwell",
    name: "Inkwell",
    kind: "app",
    platform: "Android, Fire tablets",
    status: "Rebuilding",
    summary: "A drawing app for Fire tablets.",
    about: ["A painting and sketching app in the spirit of ibisPaint and Procreate, tuned for the Fire 7 and Fire HD 8."],
    show: true,
  },
  {
    id: "deskmate",
    name: "Deskmate",
    kind: "app",
    platform: "Android, Linux, Windows",
    status: "Rebuilding",
    summary: "Turns a tablet into a tool panel for your desktop.",
    about: ["You pick a tool on the tablet and use it alongside your computer. Deskmate works with Pop!_OS, other Linux distributions and Windows."],
    show: true,
  },
  {
    id: "haven",
    name: "Haven",
    kind: "app",
    platform: "Fire TV, Android",
    status: "Rebuilding",
    summary: "A clean Fire TV launcher with a phone remote.",
    about: ["Haven replaces the Fire TV home screen with a calmer one, and a companion app turns your phone into the remote."],
    show: true,
  },
  {
    id: "hub",
    name: "Hub",
    kind: "app",
    platform: "Roku",
    status: "Rebuilding",
    summary: "One Roku channel that holds several apps.",
    about: ["Hub bundles a home screen with a clock, a web browser with an ad blocker, a media library and a photo screensaver into one sideloaded channel. A small server on your home network lets you send things to the TV from your PC."],
    show: true,
  },
  {
    id: "lumen-os",
    name: "Lumen OS",
    kind: "system",
    platform: "Nintendo DSi",
    status: "Rebuilding",
    summary: "A custom system menu for the Nintendo DSi.",
    about: ["Lumen OS keeps the feel of the original DSi menu and adds smoother animations, soft sounds and a launch that zooms into an app's cartridge."],
    show: true,
  },
  {
    id: "flip-phone-rom",
    name: "T435D ROM",
    kind: "system",
    platform: "TCL T435D, KaiOS",
    status: "Rebuilding",
    summary: "A custom ROM for the TCL T435D flip phone.",
    about: ["A replacement system for the TCL T435D, in a standard build and a Death Note themed build."],
    show: true,
  },
];

window.KINDS = {
  game: "Game",
  app: "App",
  system: "System",
  asset: "Asset",
};
