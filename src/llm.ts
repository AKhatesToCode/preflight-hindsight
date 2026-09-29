import Groq from "groq-sdk";
import { getConfig } from "./config";
const FALLBACK = "openai/gpt-oss-20b";
async function call(model: string, sys: string, user: string, json: boolean) {
  const c = getConfig();
  const groq = new Groq({ apiKey: c.GROQ_API_KEY }); // key read at request time
  const r = await groq.chat.completions.create({
    model, temperature: 0.2,
    messages: [{ role: "system", content: sys }, { role: "user", content: user }],
    ...(json ? { response_format: { type: "json_object" as const } } : {}),
  });
  return r.choices[0]?.message?.content ?? "";
}
const strip = (s: string) => s.replace(/<think>[\s\S]*?<\/think>/g, "").replace(/```json|```/g, "").trim();
export async function groqText(sys: string, user: string) {
  const m = getConfig().GROQ_MODEL;
  try { return strip(await call(m, sys, user, false)); } catch { return strip(await call(FALLBACK, sys, user, false)); }
}
/** One retry on malformed JSON / function-call errors, second attempt uses fallback model. */
export async function groqJSON<T = any>(sys: string, user: string): Promise<T> {
  const m = getConfig().GROQ_MODEL;
  try { return JSON.parse(strip(await call(m, sys, user, true))); }
  catch { return JSON.parse(strip(await call(FALLBACK, sys, user, true))); }
}
