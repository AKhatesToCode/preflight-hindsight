import express from "express";
import path from "path";
import { getConfig, configStatus } from "./config";
import { SEED } from "./seedData";
import * as P from "./prompts";
import { groqJSON, groqText } from "./llm";
import * as hs from "./hs";

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

const wrap = (fn: (req: express.Request) => Promise<unknown>): express.RequestHandler => async (req, res) => {
  try { res.json(await fn(req)); }
  catch (e: any) { res.status(500).json({ error: String(e?.message ?? e), detail: e?.details ?? e?.statusCode ?? null }); }
};

app.get("/api/status", (_q, r) => r.json(configStatus()));

app.post("/api/test", wrap(async () => {
  const t0 = Date.now(); const r = await hs.recall("connection test");
  return { ok: true, latencyMs: Date.now() - t0, results: r.length };
}));

app.post("/api/seed", wrap(async () => {
  getConfig();
  for (const ev of SEED) await hs.retain(P.lessonRecord(ev), `seed-${ev.id}`);
  return { retained: SEED.length };
}));

// Client polls this every 5s (up to INDEXING_TIMEOUT_SECONDS). Known seeded fact: E001 batch window lesson.
app.post("/api/indexing", wrap(async () => {
  const r = await hs.recall("migration inside the 01:00-04:00 batch window IOPS rollback");
  const ready = r.some((t) => /batch window|E001|IOPS/i.test(t));
  return { ready, recalled: r.length };
}));

app.post("/api/preflight", wrap(async (req) => {
  const { plan, memory } = req.body as { plan: string; memory: boolean };
  if (!memory) {
    const answer = await groqText(P.GENERIC_SYS, plan);
    return { memoryUsed: false, label: "No organizational memory used", answer };
  }
  const { conditions } = await groqJSON<{ conditions: string[] }>(P.CONDITIONS_SYS, plan);
  const queries = [
    plan,
    conditions.join("; "),
    ...conditions.slice(0, 2).map((c) => `past failures involving ${c}`),
    `PREFLIGHT OUTCOME similar to: ${plan}`,
  ].slice(0, 4);
  const rec = await hs.recallMany(queries);
  const verdict = await groqJSON(P.JUDGE_SYS,
    `PLAN:\n${plan}\n\nTRIGGER CONDITIONS: ${conditions.join("; ")}\n\nRECALLED MEMORIES:\n${rec.merged.map((m, i) => `[${i + 1}] ${m}`).join("\n\n") || "(nothing recalled)"}`);
  return { memoryUsed: true, conditions, verdict, memory: rec };
}));

app.post("/api/outcome", wrap(async (req) => {
  const { plan, verdict, cited, action, result, note } = req.body;
  const rec = `PREFLIGHT OUTCOME | Plan: ${plan} | Verdict: ${verdict} | Cited: ${(cited ?? []).join(", ") || "none"} | Action: ${action ?? "not recorded"} | Result: ${result ?? "pending"} | Note: ${note ?? ""} | Date: ${new Date().toISOString().slice(0, 10)}`;
  await hs.retain(rec, `outcome-${Date.now()}`);
  return { retained: rec };
}));

app.post("/api/outcomes", wrap(async () => {
  const r = await hs.recallMany(["PREFLIGHT OUTCOME plan verdict action result"]);
  return { items: r.merged.filter((t) => /PREFLIGHT OUTCOME/i.test(t)) };
}));

app.post("/api/history", wrap(async (req) => {
  const { question } = req.body;
  const rec = await hs.recallMany([question, `lesson root cause recovery ${question}`, `what happened and what people decided ${question}`]);
  const answer = await groqText(P.HISTORY_SYS, `QUESTION: ${question}\n\nRECALLED:\n${rec.merged.join("\n\n") || "(nothing)"}`);
  return { answer, memory: rec };
}));

app.post("/api/patterns", wrap(async () => {
  try {
    const text = await hs.reflect(P.REFLECT_QUERY);
    if (text.trim().length > 40) {
      const j = await groqJSON<{ patterns: any[] }>(P.PATTERNS_FROM_TEXT_SYS, text);
      if (j.patterns?.length) return { path: "reflect", patterns: j.patterns, raw: text };
    }
  } catch (e) { console.warn("[patterns] reflect failed, falling back:", String(e)); }
  const rec = await hs.recallMany(["failures root cause", "recurring failure trigger conditions", "LESSON never rollback reverted"]);
  const j = await groqJSON<{ patterns: any[] }>(P.CLUSTER_SYS, rec.merged.join("\n\n"));
  return { path: "recall+groq clustering (reflect returned nothing useful)", patterns: j.patterns, memory: rec };
}));

app.post("/api/extract-lesson", wrap(async (req) => {
  const { notes } = req.body;
  const id = "E" + String(100 + Math.floor(Math.random() * 900));
  return { record: await groqText(P.LESSON_SYS, `ID: ${id}\nToday: ${new Date().toISOString().slice(0, 10)}\nNOTES:\n${notes}`) };
}));
app.post("/api/retain-record", wrap(async (req) => { await hs.retain(req.body.record); return { ok: true }; }));

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => console.log(`Preflight running at http://localhost:${port}`));
