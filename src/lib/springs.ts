// Spring presets shared by every animation on the site. No easing curves anywhere.
export const springs = {
  micro: { type: "spring", stiffness: 400, damping: 40 },
  standard: { type: "spring", stiffness: 260, damping: 20 },
  modal: { type: "spring", stiffness: 100, damping: 15 },
  heavy: { type: "spring", stiffness: 80, damping: 25, mass: 2 },
} as const;
