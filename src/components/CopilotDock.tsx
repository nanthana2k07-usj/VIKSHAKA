import { useChat } from "@ai-sdk/react";
import { Send, X, Sparkles, Loader2, FileText, Search, Compass } from "lucide-react";
import { useEffect, useRef } from "react";
import { MarkdownWithCitations, CitationFooter } from "@/components/CitationText";
import { useSession } from "@/lib/auth";
import { can } from "@/lib/rbac";

interface Props { open: boolean; onOpenChange: (v: boolean) => void; }

const QUICK_PROMPTS = [
  { icon: Search, label: "Show open cases", prompt: "List all open and investigating cases sorted by priority with citations to case IDs. Include district and IO." },
  { icon: FileText, label: "Draft FIR", prompt: "Draft an FIR for case VK-BLR-2024-0421 (armed robbery at Jayanagar jewellery store) following standard Indian police FIR format. Cite the case ID." },
  { icon: Compass, label: "Next steps", prompt: "For case VK-DEL-2024-0921 (attempted homicide, Karol Bagh), recommend the next 5 investigative steps in priority order with citations." },
];

export function CopilotDock({ open, onOpenChange }: Props) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { session } = useSession();
  const readOnly = session ? !can(session.role, "action:create_fir") : false;
  const { messages, sendMessage, status, error } = useChat({
    api: "/api/chat",
  });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 50); }, [open, messages.length]);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, status]);

  const submit = () => {
    const text = inputRef.current?.value.trim();
    if (!text || busy) return;
    sendMessage({ text });
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-background/40 backdrop-blur-sm z-40" onClick={() => onOpenChange(false)} />}
      <aside className={`fixed top-0 right-0 h-full w-full sm:w-[440px] border-l border-border bg-surface z-50 flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <header className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="size-9 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
                <Sparkles className="size-4 text-primary" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-success border-2 border-surface pulse-dot" />
            </div>
            <div>
              <div className="font-display font-bold leading-none">ARIA</div>
              <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-0.5">AI Copilot · v2.4</div>
            </div>
          </div>
          <button onClick={() => onOpenChange(false)} className="size-8 rounded-md hover:bg-muted flex items-center justify-center">
            <X className="size-4" />
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-surface-2 p-4">
                <div className="text-xs font-mono text-primary uppercase tracking-widest mb-2">System</div>
                <p className="text-sm leading-relaxed">
                  Namaste{session ? `, ${session.name.split(" ").slice(-1)[0]}` : ""}. I have context on all active cases, hotspots, alerts and officers.
                  Ask anything — I cite case IDs, criminal IDs and hotspot IDs so you can jump straight to the record.
                </p>
                {readOnly && (
                  <p className="text-[10px] font-mono uppercase tracking-widest text-warning mt-2">Read-only mode · Analyst role cannot draft FIRs</p>
                )}
              </div>
              <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Quick actions</div>
              <div className="grid gap-2">
                {QUICK_PROMPTS.map(q => (
                  <button key={q.label}
                    onClick={() => sendMessage({ text: q.prompt })}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border bg-surface-2/60 hover:bg-surface-2 hover:border-primary/30 text-left transition-colors">
                    <q.icon className="size-4 text-primary shrink-0" />
                    <span className="text-sm">{q.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map(m => {
            const text = m.parts.map(p => (p.type === "text" ? p.text : "")).join("");
            return (
              <div key={m.id} className={`rounded-lg p-3 border ${m.role === "user" ? "bg-primary/10 border-primary/20 ml-6" : "bg-surface-2 border-border mr-6"}`}>
                <div className={`text-[10px] font-mono uppercase tracking-widest mb-1.5 ${m.role === "user" ? "text-primary" : "text-accent"}`}>
                  {m.role === "user" ? "You" : "ARIA"}
                </div>
                <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none prose-headings:font-display prose-headings:mt-3 prose-headings:mb-1.5 prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5 prose-strong:text-foreground prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-code:font-mono prose-code:text-[11px] prose-code:font-semibold">
                  <MarkdownWithCitations text={text} />
                </div>
                {m.role === "assistant" && <CitationFooter text={text} />}
              </div>
            );
          })}

          {busy && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mr-6">
              <Loader2 className="size-3 animate-spin" />
              <span className="font-mono uppercase tracking-widest">ARIA analysing…</span>
            </div>
          )}
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              {error.message}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border shrink-0 bg-surface">
          <div className="relative">
            <textarea ref={inputRef} rows={2}
              placeholder="Query tactical intelligence…  (Enter to send)"
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
              className="w-full bg-background border border-border rounded-lg py-2.5 pl-3 pr-11 text-sm resize-none focus:outline-none focus:border-primary/50" />
            <button onClick={submit} disabled={busy}
              className="absolute right-2 bottom-2 size-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 hover:opacity-90">
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </button>
          </div>
          <div className="text-[10px] font-mono text-muted-foreground mt-2 uppercase tracking-widest">
            All queries logged · session S-{session?.serviceId.slice(-4) ?? "0000"}
          </div>
        </div>
      </aside>
    </>
  );
}
