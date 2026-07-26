import { createFileRoute } from "@tanstack/react-router";
import { convertToCoreMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { cases, criminals, hotspots, alerts, officers, patrols, kpis } from "@/lib/mock-data";

type ChatRequestBody = { messages?: unknown };

// Compact context digest so the model can answer domain questions grounded in
// the demo data without blowing the token budget.
function buildContext() {
  const openCases = cases.filter(c => c.status !== "closed").slice(0, 8).map(c =>
    `- ${c.id} | ${c.title} | ${c.ipc} | ${c.district}, ${c.state} | ${c.status.toUpperCase()} | priority ${c.priority} | suspect: ${c.suspect} | officer: ${c.officer}`
  ).join("\n");
  const wanted = criminals.filter(c => c.status === "at_large").map(c =>
    `- ${c.id} ${c.name} ("${c.alias}"), threat ${c.threatLevel}, gang ${c.gang ?? "solo"}, last seen ${c.lastSeen}, ${c.linkedCases} linked cases`
  ).join("\n");
  const hs = hotspots.slice(0, 6).map(h => `- ${h.area} (${h.district}) — ${h.incidents30d} incidents/30d, ${h.risk} risk, primary: ${h.primaryCrime}`).join("\n");
  const recentAlerts = alerts.slice(0, 5).map(a => `- ${a.time} [${a.severity.toUpperCase()}] ${a.title} @ ${a.location}`).join("\n");
  return `
VIKSHAKA operational snapshot (demo data — treat as authoritative for this session):

KPIs: ${kpis.activeCases} active cases, ${kpis.criticalAlerts} critical alerts, ${kpis.cctvOnline}/${kpis.cctvTotal} CCTV feeds online, ${kpis.officersDeployed}/${kpis.officersTotal} officers deployed.

Top open cases:
${openCases}

Wanted persons (at large):
${wanted}

Priority hotspots (30d):
${hs}

Recent alerts:
${recentAlerts}

Active patrols: ${patrols.length} units across ${new Set(patrols.map(p => p.zone)).size} zones.
Available officers: ${officers.map(o => `${o.rank} ${o.name} (${o.station})`).join("; ")}.
`.trim();
}

const SYSTEM_PROMPT = `You are ARIA, the AI copilot inside VIKSHAKA — a crime intelligence platform used by senior Indian Police Service officers (Commissioners, SPs, ACPs, Inspectors).

Your job: help officers work faster and smarter. You can:
- Answer questions about cases, criminals, hotspots, CCTV, alerts, and officers using the OPERATIONAL SNAPSHOT below.
- Draft FIRs, case summaries, situation reports, and inter-department memos on request. Follow Indian police format: header, FIR no., IPC sections, complainant, accused, statement of facts, sections applied, IO signature line.
- Recommend investigative next steps: patrol reallocation, CCTV arcs to review, ANPR queries, forensic tests, cross-jurisdiction coordination.
- Explain IPC / CrPC / NDPS / IT Act sections and standard operating procedures.
- Suggest similar past cases from the snapshot when patterns match.

CITATIONS (mandatory): Whenever you reference an entity from the snapshot, write its ID inline in the exact format used in the snapshot so the UI can turn it into a clickable chip:
- Case IDs like VK-BLR-2024-0421 (do NOT wrap in brackets, backticks, or parentheses)
- Criminal IDs like C-9012
- Hotspot IDs like H3
Cite every entity you use. Never invent IDs that are not in the snapshot; if you don't know, say so.

Voice: authoritative, concise, professional. Use bullet points and numbered lists. Do not add legal disclaimers — the officer knows the rules.

${buildContext()}`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(messages)) {
          return new Response("messages required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway("google/gemini-3.6-flash"),
          system: SYSTEM_PROMPT,
          messages: convertToCoreMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        });
      },
    },
  },
});
