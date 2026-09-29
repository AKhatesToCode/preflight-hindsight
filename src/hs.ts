import { HindsightClient } from "@vectorize-io/hindsight-client";
import { getConfig } from "./config";
const logged = new Set<string>();
const logOnce = (k: string, v: unknown) => { if (!logged.has(k)) { logged.add(k); console.log(`[hindsight:${k}] raw shape:`, JSON.stringify(v)?.slice(0, 600)); } };
function client() { const c = getConfig(); return { c, h: new HindsightClient({ baseUrl: c.HINDSIGHT_API_URL, apiKey: c.HINDSIGHT_API_KEY }) }; }

export async function retain(content: string, documentId?: string) {
  const { c, h } = client();
  const r = await h.retain(c.HINDSIGHT_BANK_ID, content, { documentId, async: true });
  logOnce("retain", r); return r;
}
export async function recall(query: string): Promise<string[]> {
  const { c, h } = client();
  const r: any = await h.recall(c.HINDSIGHT_BANK_ID, query, { budget: c.HINDSIGHT_RECALL_BUDGET as any });
  logOnce("recall", r);
  const items: any[] = r?.results ?? r?.memories ?? [];
  return items.map((i) => (typeof i === "string" ? i : i.text ?? i.content ?? JSON.stringify(i)));
}
export async function recallMany(queries: string[]) {
  const t0 = Date.now();
  const per = await Promise.all(queries.map(async (q) => ({ query: q, results: await recall(q) })));
  const seen = new Set<string>(); const merged: string[] = [];
  for (const p of per) for (const t of p.results) if (!seen.has(t)) { seen.add(t); merged.push(t); }
  return { queries: per, merged, latencyMs: Date.now() - t0 };
}
export async function reflect(query: string): Promise<string> {
  const { c, h } = client();
  const r: any = await h.reflect(c.HINDSIGHT_BANK_ID, query, { budget: c.HINDSIGHT_RECALL_BUDGET as any });
  logOnce("reflect", r);
  return r?.text ?? r?.answer ?? r?.response ?? "";
}
