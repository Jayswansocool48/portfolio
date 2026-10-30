// The message form opens the visitor's own email app. Nothing is sent to this site.
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { springs } from "@/lib/springs";

export default function ContactForm({ email, topic: initialTopic = "" }: { email: string; topic?: string }) {
  const [errors, setErrors] = useState<{ msg?: boolean; ok?: boolean }>({});
  const [sent, setSent] = useState(false);
  const msgRef = useRef<HTMLTextAreaElement>(null);
  const okRef = useRef<HTMLInputElement>(null);
  const topics = ["A custom asset", "Working together", "One of the games", "Something else"];

  return (
    <form
      noValidate
      className="grid gap-5 rounded-xl border bg-card p-6 squircle sm:p-8"
      onSubmit={e => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const msg = String(f.get("message") || "").trim(), ok = !!f.get("ok");
        const next = { msg: !msg, ok: !ok };
        setErrors(next);
        if (next.msg) return msgRef.current?.focus();
        if (next.ok) return okRef.current?.focus();
        const name = String(f.get("name") || "").trim();
        const subject = `${f.get("topic")}${name ? " from " + name : ""}`;
        window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(msg + (name ? "\n\n" + name : ""))}`;
        setSent(true);
      }}
    >
      <h2 className="m-0 font-display text-3xl font-extrabold uppercase tracking-wide">Write a message</h2>
      <div className="grid gap-1.5">
        <label htmlFor="f-name" className="text-sm font-semibold">Your name</label>
        <input id="f-name" name="name" autoComplete="name" className="min-h-12 rounded-lg border bg-background px-3.5 focus-visible:border-primary-text squircle" />
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="f-topic" className="text-sm font-semibold">What's it about?</label>
        <select id="f-topic" name="topic" defaultValue={topics.includes(initialTopic) ? initialTopic : topics[0]} className="min-h-12 rounded-lg border bg-background px-3 squircle">
          {topics.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="f-msg" className="text-sm font-semibold">Message</label>
        <textarea
          ref={msgRef}
          id="f-msg"
          name="message"
          rows={6}
          aria-invalid={errors.msg || undefined}
          aria-describedby={errors.msg ? "f-msg-err" : undefined}
          className="rounded-lg border bg-background px-3.5 py-3 focus-visible:border-primary-text aria-[invalid=true]:border-destructive squircle"
        />
        {errors.msg && <p id="f-msg-err" className="m-0 text-sm text-destructive-text">Write a message first.</p>}
      </div>
      <label className="grid cursor-pointer grid-cols-[auto_1fr] items-start gap-3 text-sm text-muted-foreground">
        <input ref={okRef} type="checkbox" name="ok" aria-invalid={errors.ok || undefined} aria-describedby={errors.ok ? "f-ok-err" : undefined} className="mt-0.5 size-5 accent-[#c8203c]" />
        <span>I understand this opens my own email app, and Iron Lantern Studios will reply to the address I send from.</span>
      </label>
      {errors.ok && <p id="f-ok-err" className="-mt-3 m-0 text-sm text-destructive-text">Tick the box to continue.</p>}
      <button type="submit" className="min-h-12 rounded-lg bg-primary px-5 font-semibold text-primary-foreground hover:brightness-110 squircle">
        Open in my email app
      </button>
      <AnimatePresence>
        {sent && (
          <motion.p role="status" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={springs.standard} className="m-0 text-sm text-primary-text">
            Your email app should be open with the message filled in. If nothing opened, write to {email}.
          </motion.p>
        )}
      </AnimatePresence>
      <p className="m-0 font-mono text-[0.72rem] text-muted-foreground">This site never sees what you type.</p>
    </form>
  );
}
