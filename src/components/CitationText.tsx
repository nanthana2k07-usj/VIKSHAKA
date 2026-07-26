import { FileText, User, MapPin } from "lucide-react";
import { Fragment, type ReactNode } from "react";

const CASE_RE = /\bVK-[A-Z]{2,4}-\d{4}-\d{4}\b/g;
const CRIM_RE = /\bC-\d{4}\b/g;
const HS_RE = /\bH\d{1,3}\b/g;

export function extractCitations(text: string) {
  const cases = Array.from(new Set(text.match(CASE_RE) ?? []));
  const criminals = Array.from(new Set(text.match(CRIM_RE) ?? []));
  const hotspots = Array.from(new Set(text.match(HS_RE) ?? []));
  return { cases, criminals, hotspots, total: cases.length + criminals.length + hotspots.length };
}

/** Inline-render markdown but replace citation tokens with badges. */
export function MarkdownWithCitations({ text }: { text: string }) {
  const blocks = text.split(/\n\s*\n/).map(block => block.trim()).filter(Boolean);

  return (
    <div className="space-y-3">
      {blocks.map((block, index) => {
        const lines = block.split("\n").map(line => line.trim()).filter(Boolean);
        const unordered = lines.every(line => /^[-*]\s+/.test(line));
        const ordered = lines.every(line => /^\d+\.\s+/.test(line));

        if (unordered) {
          return (
            <ul key={index} className="list-disc space-y-1 pl-5">
              {lines.map((line, lineIndex) => (
                <li key={lineIndex}>{renderInline(line.replace(/^[-*]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }

        if (ordered) {
          return (
            <ol key={index} className="list-decimal space-y-1 pl-5">
              {lines.map((line, lineIndex) => (
                <li key={lineIndex}>{renderInline(line.replace(/^\d+\.\s+/, ""))}</li>
              ))}
            </ol>
          );
        }

        return (
          <p key={index} className="whitespace-pre-wrap">
            {renderInline(block)}
          </p>
        );
      })}
    </div>
  );
}

function renderInline(text: string): ReactNode[] {
  const tokenRe =
    /(\bVK-[A-Z]{2,4}-\d{4}-\d{4}\b|\bC-\d{4}\b|\bH\d{1,3}\b|`[^`]+`|\*\*[^*]+\*\*)/g;

  return text.split(tokenRe).filter(Boolean).map((part, index) => {
    if (CASE_RE.test(part) || CRIM_RE.test(part) || HS_RE.test(part)) {
      CASE_RE.lastIndex = 0;
      CRIM_RE.lastIndex = 0;
      HS_RE.lastIndex = 0;
      return (
        <code
          key={index}
          className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-primary"
        >
          {part}
        </code>
      );
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-primary"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    return <Fragment key={index}>{part}</Fragment>;
  });
}

export function CitationFooter({ text }: { text: string }) {
  const { cases, criminals, hotspots, total } = extractCitations(text);
  if (total === 0) return null;
  return (
    <div className="mt-3 pt-3 border-t border-border/60">
      <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">Sources</div>
      <div className="flex flex-wrap gap-1.5">
        {cases.map(id => (
          <a key={id} href={`/cases?q=${encodeURIComponent(id)}`}
            className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20">
            <FileText className="size-2.5" />{id}
          </a>
        ))}
        {criminals.map(id => (
          <a key={id} href="/networks"
            className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20">
            <User className="size-2.5" />{id}
          </a>
        ))}
        {hotspots.map(id => (
          <a key={id} href="/hotspots"
            className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded border border-warning/30 bg-warning/10 text-warning hover:bg-warning/20">
            <MapPin className="size-2.5" />{id}
          </a>
        ))}
      </div>
    </div>
  );
}
