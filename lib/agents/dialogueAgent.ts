import { GraphState } from "./state";
import { llmDialogue, withRetry, parseJsonSafely, sleep } from "./llm";
import { Dialogue } from "@/store/useScriptStore";

type AgentState = typeof GraphState.State;

/**
 * Agent 4: Bollywood Dialogue Generator
 *
 * Generates dramatic Bollywood-style dialogues for each scene independently.
 * Rate limit strategy: one LLM call per scene + 2s sleep between calls.
 * Injects the full "Character Bible" into every prompt for personality consistency.
 * Token budget: ~800 tokens per scene × 4-5 scenes = ~3500-4000 total.
 */
export async function dialogueAgentNode(
  state: AgentState,
): Promise<Partial<AgentState>> {
  const { mood } = state.input;
  const { story, characters, scenes } = state;

  if (!story || !characters?.length || !scenes?.length) {
    throw new Error(
      "[DialogueAgent] Story, characters, and scenes are all required",
    );
  }

  // Build the Character Bible — injected into every scene prompt for consistency
  const characterBible = characters
    .map(
      (c) =>
        `• ${c.name} (${c.role})\n  Personality: ${c.personality}\n  Description: ${c.description}`,
    )
    .join("\n\n");

  const dialogues: Record<number, Dialogue[]> = {};

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];

    const prompt = `You are a Bollywood dialogue writer specializing in ${mood} dramas.

=== CHARACTER BIBLE (Follow personalities STRICTLY) ===
${characterBible}

=== STORY CONTEXT ===
Title: ${story.title}
Overall Plot: ${story.plot}

=== CURRENT SCENE ===
Scene ${scene.sceneNumber}: "${scene.title}"
What happens: ${scene.description}
Characters present: ${scene.charactersPresent.join(", ")}

=== YOUR TASK ===
Write 3-4 Bollywood-style dialogue lines for this scene.

Rules:
1. ONLY use characters from this list: ${JSON.stringify(scene.charactersPresent)}
2. Each character MUST speak in their established personality from the Character Bible above
3. Naturally weave in Hindi/Urdu phrases (e.g., "Yaar", "Bas!", "Tum samjhe nahi", "Kya baat hai", "Nahi!", "Sach mein?")
4. Use dramatic pauses with "..." and add stage directions in [square brackets]
5. Build emotional tension — the intensity must match mood: "${mood}"
6. Dialogues should feel cinematic, not conversational

Return a JSON array where each item has:
- "speaker": character name (must be from the present characters list)
- "line": the full dialogue line with Bollywood flair

Return ONLY a valid JSON array. No markdown, no explanation.`;

    const response = await withRetry(() => llmDialogue.invoke(prompt));
    const sceneDialogues = parseJsonSafely<Dialogue[]>(
      response.content as string,
    );

    // Validate speakers — only allow characters present in this scene
    const validDialogues = sceneDialogues.filter((d) =>
      scene.charactersPresent.includes(d.speaker),
    );

    dialogues[scene.sceneNumber] = validDialogues;

    console.log(
      `[DialogueAgent] Scene ${scene.sceneNumber}/${scenes.length} "${scene.title}" — ${validDialogues.length} lines`,
    );

    // Rate limit buffer: sleep between calls (except after last scene)
    if (i < scenes.length - 1) {
      await sleep(2000);
    }
  }

  return { dialogues };
}
