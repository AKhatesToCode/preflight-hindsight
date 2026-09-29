export type AppConfig = {
  HINDSIGHT_API_URL: string;
  HINDSIGHT_API_KEY: string;
  HINDSIGHT_BANK_ID: string;
  HINDSIGHT_RECALL_BUDGET: string;
  GROQ_API_KEY: string;
  GROQ_MODEL: string;
  INDEXING_TIMEOUT_SECONDS: number;
  CAT_AWAY_THRESHOLD_SECONDS: number;
};

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

export function getConfig(): AppConfig {
  return {
    HINDSIGHT_API_URL: process.env.HINDSIGHT_API_URL || "https://api.hindsight.vectorize.io",
    HINDSIGHT_API_KEY: required("HINDSIGHT_API_KEY"),
    HINDSIGHT_BANK_ID: process.env.HINDSIGHT_BANK_ID || "preflight-helix-freight",
    HINDSIGHT_RECALL_BUDGET: process.env.HINDSIGHT_RECALL_BUDGET || "mid",
    GROQ_API_KEY: required("GROQ_API_KEY"),
    GROQ_MODEL: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
    INDEXING_TIMEOUT_SECONDS: Number(process.env.INDEXING_TIMEOUT_SECONDS || 120),
    CAT_AWAY_THRESHOLD_SECONDS: Number(process.env.CAT_AWAY_THRESHOLD_SECONDS || 60),
  };
}

/** Non-throwing view for the status chip (last 4 chars only). */
export function configStatus() {
  const tail = (s: string | undefined) => s ? `…${s.slice(-4)}` : "";
  return {
    hindsightConfigured: Boolean(process.env.HINDSIGHT_API_KEY),
    hindsightKeyTail: tail(process.env.HINDSIGHT_API_KEY),
    bankId: process.env.HINDSIGHT_BANK_ID || "preflight-helix-freight",
    groqConfigured: Boolean(process.env.GROQ_API_KEY),
    groqKeyTail: tail(process.env.GROQ_API_KEY),
    indexingTimeout: Number(process.env.INDEXING_TIMEOUT_SECONDS || 120),
    catAwayThreshold: Number(process.env.CAT_AWAY_THRESHOLD_SECONDS || 60),
  };
}
