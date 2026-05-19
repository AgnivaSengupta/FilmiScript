import { GraphState } from "./state";
import { llm, withRetry, parseJsonSafely } from "./llm";

type AgentState = typeof GraphState.State;

interface StoryOutput {
  title: string;
  tagline: string;
  plot: string;
}

/**
 * Agent 1: Story Generator
 *
 * Given a situation and mood, generates a short Bollywood story synopsis
 * with title, tagline, and a plot that names 3-5 characters.
 * Token budget: ~550 tokens (prompt + response).
 */
export async function storyAgentNode(
  state: AgentState,
): Promise<Partial<AgentState>> {
  const { situation, mood } = state.input;

  const prompt = `You are a creative Bollywood screenplay writer.

 Situation: ${situation}
 Mood: ${mood}

 Write a SHORT story synopsis based on the situation, strictly following the requested "${mood}" mood.

 Return a JSON object with these EXACT fields:
 - "title": A unique catchy heavily Bollywood-style title fitting the ${mood} genre (5 words max, no quotes inside)
 - "tagline": A punchy one-liner tagline that teases the story's tone
 - "plot": Story synopsis (100 words). Must include:
     • Setting (time and place)
     • 2-4 character names with one-line roles each
     • Central conflict (tailored to the ${mood} mood)
     • A hint of the resolution
 - "core_trope": Name one classic Bollywood trope used here (e.g., "Punar Janam", "Rich Girl/Poor Boy", "Judwaa", "Shaadi Mandap Crash").

 CRITICAL TONE INSTRUCTIONS:
 Do NOT default to heavy drama, betrayal, or sacrifice unless the mood specifically calls for it.
 - If Mood is "Funny": Use slapstick, silly misunderstandings, overreactions, and chaotic humor.
 - If Mood is "Romantic": Focus on love-hate dynamics, intense chemistry, and classic Bollywood meet-cutes.
 - If Mood is "Dramatic" or "Action": Use high stakes, intense emotional conflicts, and dramatic standoffs.

 Make it feel like a blockbuster Bollywood film in the exact genre of "${mood}".

 Return ONLY a valid JSON object. No markdown, no explanation.`;

  const response = await withRetry(() => llm.invoke(prompt));
  const story = parseJsonSafely<StoryOutput>(response.content as string);

  console.log(`[StoryAgent] Generated: "${story.title}"`);
  return { story };
}
