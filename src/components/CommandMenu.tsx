// Ctrl+K search over every page, game and asset. Built on cmdk, the library behind
// shadcn/ui's Command component (MIT), styled with the site's theme tokens.
import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { AnimatePresence, motion } from "motion/react";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { springs } from "@/lib/springs";

export interface CmdItem { label: string; group: string; href: string; keywords?: string }

export default function CommandMenu({ items }: { items: CmdItem[] }) {
  const [open, setOpen] = useState(false);
  const [mac, setMac] = useState(false);

  useEffect(() => {
    setMac(/Mac|iPhone|iPad/.test(navigator.platform));
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen(o => !o); }
    };
    const onOpen = () => setOpen(true);
    addEventListener("keydown", onKey);
    addEventListener("open-search", onOpen);
    return () => { removeEventListener("keydown", onKey); removeEventListener("open-search", onOpen); };
  }, []);

  useEffect(() => {
    const lenis = (window as any).__lenis;
    if (open) lenis?.stop(); else lenis?.start();
  }, [open]);

  const groups = [...new Set(items.map(i => i.group))];
  const go = (href: string) => { setOpen(false); window.location.href = href; };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="inline-flex min-h-10 min-w-10 items-center justify-center gap-2 rounded-lg border bg-card px-2.5 text-sm text-muted-foreground hover:text-foreground squircle"
      >
        <MagnifyingGlass size={17} weight="bold" aria-hidden />
        <kbd className="hidden rounded border bg-background px-1.5 py-0.5 font-mono text-[0.68rem] sm:inline">{mac ? "⌘ K" : "Ctrl K"}</kbd>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-start justify-center bg-shade px-4 pt-[12vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={springs.micro}
            onMouseDown={e => { if (e.target === e.currentTarget) setOpen(false); }}
          >
            <motion.div
              initial={{ opacity: 0, y: -14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={springs.standard}
              className="w-full max-w-[34rem]"
            >
              <Command
                label="Search the site"
                filter={(value, search, keywords) => {
                  const q = search.trim().toLowerCase();
                  if (!q) return 1;
                  const v = value.toLowerCase();
                  if (v.startsWith(q)) return 1;
                  if (v.split(/\s+/).some(w => w.startsWith(q))) return 0.9;
                  if (v.includes(q)) return 0.7;
                  return (keywords || []).some(k => k.toLowerCase().includes(q)) ? 0.4 : 0;
                }}
                className="overflow-hidden rounded-xl border bg-popover text-popover-foreground squircle"
                onKeyDown={e => { if (e.key === "Escape") setOpen(false); }}
              >
                <div className="flex items-center gap-2.5 border-b px-4">
                  <MagnifyingGlass size={18} className="text-muted-foreground" aria-hidden />
                  <Command.Input autoFocus placeholder="Jump to a game, asset or page" className="h-14 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground" />
                </div>
                <Command.List data-lenis-prevent className="max-h-[50vh] overflow-y-auto p-1.5">
                  <Command.Empty className="px-3 py-6 text-center text-sm text-muted-foreground">Nothing matches that.</Command.Empty>
                  {groups.map(g => (
                    <Command.Group key={g} heading={g} className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2.5 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[0.66rem] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.16em] [&_[cmdk-group-heading]]:text-muted-foreground">
                      {items.filter(i => i.group === g).map(i => (
                        <Command.Item
                          key={i.href + i.label}
                          value={i.label}
                          keywords={i.keywords ? i.keywords.split(/\s+/) : undefined}
                          onSelect={() => go(i.href)}
                          className="flex min-h-11 cursor-pointer items-center rounded-lg px-3 text-[0.95rem] data-[selected=true]:bg-secondary data-[selected=true]:text-primary-text"
                        >
                          {i.label}
                        </Command.Item>
                      ))}
                    </Command.Group>
                  ))}
                </Command.List>
                <div className="flex flex-wrap items-center gap-1.5 border-t px-4 py-2.5 text-xs text-muted-foreground">
                  <kbd className="rounded border px-1.5 font-mono">↑</kbd><kbd className="rounded border px-1.5 font-mono">↓</kbd> to move
                  <kbd className="ml-2 rounded border px-1.5 font-mono">Enter</kbd> to open
                  <kbd className="ml-2 rounded border px-1.5 font-mono">Esc</kbd> to close
                </div>
              </Command>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
