// Phone menu: a panel that drops from the top, links rising in one after another.
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { List, X } from "@phosphor-icons/react/dist/ssr";
import { springs } from "@/lib/springs";

export default function MobileMenu({ links, current }: { links: { href: string; label: string }[]; current: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const lenis = (window as any).__lenis;
    if (open) lenis?.stop(); else lenis?.start();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button type="button" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)} className="grid size-11 place-items-center rounded-lg text-foreground md:hidden">
        <List size={22} weight="bold" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 md:hidden" initial="closed" animate="open" exit="closed">
            <motion.div className="absolute inset-0 bg-shade" variants={{ open: { opacity: 1 }, closed: { opacity: 0 } }} transition={springs.micro} onClick={() => setOpen(false)} />
            <motion.nav
              aria-label="Pages"
              className="absolute inset-x-0 top-0 rounded-b-2xl border-b bg-background pb-6 pt-[env(safe-area-inset-top)]"
              variants={{ open: { y: 0 }, closed: { y: "-100%" } }}
              transition={springs.standard}
            >
              <div className="wrap flex min-h-16 items-center justify-between">
                <span className="font-display text-lg font-extrabold uppercase tracking-wide">Iron Lantern</span>
                <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="grid size-11 place-items-center rounded-lg">
                  <X size={22} weight="bold" />
                </button>
              </div>
              <motion.ul className="wrap m-0 list-none p-0" variants={{ open: { transition: { staggerChildren: 0.05, delayChildren: 0.06 } } }}>
                {links.map(l => (
                  <motion.li key={l.href} variants={{ open: { opacity: 1, y: 0 }, closed: { opacity: 0, y: -12 } }} transition={springs.standard} className="border-t">
                    <a
                      href={l.href}
                      aria-current={current === l.href ? "page" : undefined}
                      className="flex min-h-16 items-center gap-3 font-display text-4xl font-extrabold uppercase tracking-wide text-muted-foreground aria-[current=page]:text-foreground"
                    >
                      {l.label}
                      {current === l.href && <span className="size-2.5 rounded-full bg-primary" aria-hidden />}
                    </a>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
