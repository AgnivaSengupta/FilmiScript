import { GraphState } from "./state";
import { llm, withRetry, parseJsonSafely } from "./llm";
import { Character } from "@/store/useScriptStore";

type AgentState = typeof GraphState.State;

/**
 * Agent 2: Character Generator
 *
 * Expands character mentions from the synopsis into full Bollywood character sketches.
 * Receives the full story context to ensure NO new characters are invented.
 * Token budget: ~1000 tokens (prompt + response).
 */
export async function charAgentNode(
  state: AgentState
): Promise<Partial<AgentState>> {
  const { mood } = state.input;
  const { story } = state;

  if (!story) throw new Error("[CharAgent] Story must be generated first");

  const prompt = `You are a Bollywood casting director and character writer.

Story Title: ${story.title}
Tagline: ${story.tagline}
Plot: ${story.plot}
Mood: ${mood}

Create detailed character sketches for ALL named characters in the plot above.
Return a JSON array where each character has:
- "name": Exact name as mentioned in the plot
- "role": Their dramatic role (protagonist / antagonist / love_interest / comic_relief / mentor / tragic_figure / etc.)
- "description": Physical appearance and clothing style in Bollywood context (2-3 sentences)
- "personality": Core personality traits + their Bollywood archetype (1-2 sentences). Make each character DISTINCT.

Rules:
- ONLY create characters explicitly named in the plot above — do NOT invent new ones
- Personalities must contrast each other to create dramatic tension
- Match the "${mood}" tone in their descriptions
- Use Bollywood archetypes (e.g., the brooding misunderstood hero, the scheming jealous relative, the selfless mother, the torn lover)

Return ONLY a valid JSON array. No markdown, no explanation.`;

  const response = await withRetry(() => llm.invoke(prompt));
  const characters = parseJsonSafely<Character[]>(response.content as string);

  console.log(
    `[CharAgent] Generated ${characters.length} characters: ${characters.map((c) => c.name).join(", ")}`
  );
  return { characters };
}
