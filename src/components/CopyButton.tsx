import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Copy } from "@phosphor-icons/react/dist/ssr";
import { springs } from "@/lib/springs";

export default function CopyButton({ value, label }: { value: string; label: string }) {
  const [done, setDone] = useState<"copied" | "select" | null>(null);
  return (
    <button
      type="button"
      aria-label={`Copy ${label}`}
      onClick={async e => {
        try { await navigator.clipboard.writeText(value); setDone("copied"); }
        catch {
          const node = (e.currentTarget.previousElementSibling as HTMLElement) || e.currentTarget;
          const r = document.createRange(); r.selectNodeContents(node);
          const sel = getSelection(); sel?.removeAllRanges(); sel?.addRange(r);
          setDone("select");
        }
        setTimeout(() => setDone(null), 1800);
      }}
      className="relative inline-flex min-h-11 min-w-24 items-center justify-center gap-2 rounded-lg border px-3 text-sm text-muted-foreground hover:text-foreground squircle"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={done || "idle"} className="inline-flex items-center gap-2" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={springs.micro}>
          {done === "copied" ? <><Check size={15} weight="bold" className="text-primary-text" /> Copied</> : done === "select" ? "Ctrl+C" : <><Copy size={15} /> Copy</>}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
