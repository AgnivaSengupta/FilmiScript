import { GraphState } from "./state";
import { llm, withRetry, parseJsonSafely } from "./llm";
import { Scene } from "@/store/useScriptStore";

type AgentState = typeof GraphState.State;

// Scene without dialogues — dialogue agent fills this later
type SceneShell = Omit<Scene, "dialogue">;

/**
 * Agent 3: Scene Generator
 *
 * Divides the story into 4-5 dramatic scenes, each with a subset of characters.
 * Enforces: only characters from the generated list can appear in scenes.
 * Token budget: ~900 tokens (prompt + response).
 */
export async function sceneAgentNode(
  state: AgentState
): Promise<Partial<AgentState>> {
  const { mood } = state.input;
  const { story, characters } = state;

  if (!story) throw new Error("[SceneAgent] Story required");
  if (!characters?.length) throw new Error("[SceneAgent] Characters required");

  const charNames = characters.map((c) => c.name);
  const charSummary = characters
    .map((c) => `• ${c.name} (${c.role}): ${c.personality}`)
    .join("\n");

  const prompt = `You are a Bollywood scene breakdown writer.

=== STORY ===
Title: ${story.title}
Plot: ${story.plot}

=== CHARACTERS ===
${charSummary}

=== TASK ===
Mood: ${mood}
Divide this story into exactly 2-4 dramatic scenes. Return a JSON array where each scene has:
- "sceneNumber": integer (1, 2, 3...)
- "title": A dramatic scene title (e.g., "The Revelation", "Storm of Betrayal", "Price of Silence")
- "description": What happens in this scene (2-3 sentences). Be specific about actions and emotions.
- "charactersPresent": Array of character names. ONLY use names from this list: ${JSON.stringify(charNames)}

Rules:
- Every character must appear in at least one scene
- NOT all characters need to be in every scene — keep subsets natural
- Scene 1: Establish the world and conflict
- Middle scenes: Escalate tension, add complications  
- Final scene: Climax and resolution
- Emotional arc must match the "${mood}" tone throughout

Return ONLY a valid JSON array. No markdown, no explanation.`;

  const response = await withRetry(() => llm.invoke(prompt));
  const rawScenes = parseJsonSafely<SceneShell[]>(response.content as string);

  // Validate character names and add empty dialogue array to match Scene type
  const scenes: Scene[] = rawScenes.map((s) => ({
    ...s,
    charactersPresent: s.charactersPresent.filter((name) =>
      charNames.includes(name)
    ),
    dialogue: [],
  }));

  console.log(
    `[SceneAgent] Generated ${scenes.length} scenes: ${scenes.map((s) => s.title).join(" → ")}`
  );
  return { scenes };
}
