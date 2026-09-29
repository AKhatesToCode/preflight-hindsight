import type { Ev } from "./seedData";
export const lessonRecord = (x: Ev) =>
`LESSON RECORD ${x.id} | Type: ${x.type} | Date: ${x.date}
Situation: ${x.situation} | Believed: ${x.what_people_believed} | Decision: ${x.decision} | What happened: ${x.what_happened} |
Root cause: ${x.root_cause} | Recovery: ${x.recovery} | LESSON: ${x.lesson} | Trigger conditions: ${x.trigger_conditions.join("; ")}`;

export const CONDITIONS_SYS = `Extract 2-6 short trigger conditions (risk factors) from the plan, e.g. "Friday deploy", "dependency updates", "database migration", "Saturday overnight". Return only JSON: {"conditions": string[]}`;

export const JUDGE_SYS = `You are Preflight, an institutional-memory risk judge. Use ONLY the recalled memories provided; never invent history. Cite by event ID (e.g. E002).
Verdicts: RED = plan matches >=2 conditions of a past failure, or >=2 independent failures share one condition. YELLOW = partial match or mixed outcomes. GREEN = nothing relevant recalled (state that absence of memory is not proof of safety).
Always look for and explain counter-evidence (similar situations that went fine). Treat "PREFLIGHT OUTCOME" records as evidence: an overridden warning that later failed raises confidence for similar plans; cite it and say so.
Give 1-3 concrete recommended actions. Return ONLY valid JSON:
{"verdict":"GREEN|YELLOW|RED","summary":string,"matched_lessons":[{"event_id":string,"why_it_matches":string,"matching_conditions":string[],"key_differences":string}],"counter_evidence":[{"event_id":string,"note":string}],"recommended_actions":string[],"confidence":number,"caveat":string}`;

export const GENERIC_SYS = `You are a helpful engineering assistant. Give a short assessment of the plan. No organizational memory is available.`;

export const LESSON_SYS = `Convert the user's notes into ONE record in exactly this format (fill unknowns with "not recorded"; ID must be the one provided):
LESSON RECORD {id} | Type: {FAILURE|COUNTER-EXAMPLE|NOISE} | Date: {YYYY-MM-DD}
Situation: ... | Believed: ... | Decision: ... | What happened: ... |
Root cause: ... | Recovery: ... | LESSON: ... | Trigger conditions: a; b; c
Return only the record text.`;

export const HISTORY_SYS = `Answer using ONLY the recalled memories. Reconstruct as a chain: 1 What was happening -> 2 What people believed -> 3 What they decided -> 4 What they did -> 5 What went wrong -> 6 What fixed it -> 7 What constraint caused it -> 8 What they learned. Cite event IDs. Write "not recorded" for any step missing from memory. Do not invent.`;

export const CLUSTER_SYS = `Group the recalled failures by SHARED TRIGGER CONDITION only. Return only JSON: {"patterns":[{"title":string,"event_ids":string[],"failure_count":number,"preventive_rule":string}]} with 3-5 patterns. Use only recalled memories.`;

export const REFLECT_QUERY = `What mistakes is this organization at risk of repeating? Group past failures into 3-5 recurring patterns. For each give a title, the supporting event IDs (E###), the failure count, and a preventive rule.`;
export const PATTERNS_FROM_TEXT_SYS = `Convert this analysis into JSON only: {"patterns":[{"title":string,"event_ids":string[],"failure_count":number,"preventive_rule":string}]}. Keep only what the analysis states.`;
