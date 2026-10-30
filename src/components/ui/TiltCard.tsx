// Adapted from "Tilt Card" by tom_ui on 21st.dev (https://21st.dev/tom_ui/tilt-card).
// Changes: the CSS ease-out transitions are replaced with springs, the tilt is driven by
// motion values instead of React state (no re-render per pointer move), the spotlight is
// tinted with the theme's phosphor green, and reduced motion turns the tilt off.
import { useRef, type ReactNode, type CSSProperties } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion, useMotionTemplate } from "motion/react";
import { cn } from "@/lib/utils";
import { springs } from "@/lib/springs";

export interface TiltCardProps {
  /** Maximum tilt angle in degrees */
  tiltLimit?: number;
  /** Scale factor on hover */
  scale?: number;
  perspective?: number;
  /** "gravitate" leans toward the cursor, "evade" leans away */
  effect?: "gravitate" | "evade";
  spotlight?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export function TiltCard({
  tiltLimit = 6, scale = 1.015, perspective = 1100, effect = "gravitate", spotlight = true,
  className, style, children,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const px = useMotionValue(0.5), py = useMotionValue(0.5), hover = useMotionValue(0);
  const dir = effect === "evade" ? -1 : 1;
  const rx = useSpring(useTransform(py, v => (reduce ? 0 : (v - 0.5) * tiltLimit * 2 * dir)), springs.standard);
  const ry = useSpring(useTransform(px, v => (reduce ? 0 : (v - 0.5) * -tiltLimit * 2 * dir)), springs.standard);
  const s = useSpring(useTransform(hover, v => (reduce ? 1 : 1 + (scale - 1) * v)), springs.micro);
  const glow = useSpring(hover, springs.micro);
  const gx = useTransform(px, v => `${v * 100}%`), gy = useTransform(py, v => `${v * 100}%`);
  const bg = useMotionTemplate`radial-gradient(420px circle at ${gx} ${gy}, hsl(164 52% 62% / 0.12), transparent 60%)`;

  return (
    <motion.div
      ref={ref}
      onPointerMove={e => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width);
        py.set((e.clientY - r.top) / r.height);
      }}
      onPointerEnter={e => { if (e.pointerType === "mouse") hover.set(1); }}
      onPointerLeave={() => { hover.set(0); px.set(0.5); py.set(0.5); }}
      className={cn("relative will-change-transform", className)}
      style={{ transformPerspective: perspective, rotateX: rx, rotateY: ry, scale: s, ...style }}
    >
      {children}
      {spotlight && (
        <motion.div aria-hidden className="pointer-events-none absolute inset-0 z-10 rounded-[inherit]" style={{ background: bg, opacity: glow }} />
      )}
    </motion.div>
  );
}
