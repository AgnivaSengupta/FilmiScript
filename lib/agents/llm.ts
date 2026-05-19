import { ChatGroq } from "@langchain/groq";
import { jsonrepair } from "jsonrepair";

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY environment variable is not set. Add it to .env.local");
}

// Primary model — best free-tier creative model
export const llm = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
  maxTokens: 1024,
  apiKey: process.env.GROQ_API_KEY,
});

// Tighter budget for dialogue (called once per scene to stay under TPM limits)
export const llmDialogue = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0.8, // Slightly more creative for dialogue
  maxTokens: 800,
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Retry wrapper with exponential backoff.
 * Handles Groq's free-tier rate limits (429 errors).
 * Backoff: 4s → 8s → 16s → 30s (capped)
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 4,
  baseDelayMs = 4000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const errMessage = error instanceof Error ? error.message.toLowerCase() : "";
        const isRateLimit = errMessage.includes("rate limit") || errMessage.includes("too many requests");

      if (!isRateLimit || attempt === maxRetries - 1) throw error;

      const delay = Math.min(baseDelayMs * Math.pow(2, attempt), 30000);
      console.log(
        `[FilmiScript] Rate limited. Retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`
      );
      await sleep(delay);
    }
  }
  throw new Error("Max retries exceeded");
}

/**
 * Safely parse JSON from LLM output using a multi-layer repair strategy:
 *
 * 1. Strip markdown code fences
 * 2. Run jsonrepair — fixes unescaped newlines, trailing commas, single quotes,
 *    truncated JSON, and ~40 other common LLM output issues
 * 3. JSON.parse the repaired string
 * 4. Fallback: extract first JSON array/object and attempt repair on that
 */
export function parseJsonSafely<T>(text: string): T {
  // Step 1: strip markdown fences
  const clean = text
    .replace(/```(?:json)?\n?/gi, "")
    .replace(/```/g, "")
    .trim();

  // Step 2 & 3: repair then parse
  try {
    return JSON.parse(jsonrepair(clean)) as T;
  } catch {
    // Step 4 fallback: extract first JSON array or object, then repair
    const match = clean.match(/[\[{][\s\S]*/);
    if (match) {
      try {
        return JSON.parse(jsonrepair(match[0])) as T;
      } catch {}
    }
    throw new Error(
      `[FilmiScript] Failed to parse JSON from LLM response:\n${text.slice(0, 300)}`
    );
  }
}

/** Simple async sleep */
export const sleep = (ms: number) =>
  new Promise<void>((r) => setTimeout(r, ms));
