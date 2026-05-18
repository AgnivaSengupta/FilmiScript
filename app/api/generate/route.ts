import { buildGraph } from "@/lib/agents/graph";
import { ScriptData } from "@/store/useScriptStore";
import { randomUUID } from "crypto";

// Use Node.js runtime — LangGraph and Groq SDK require Node APIs
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { situation, mood } = body as { situation?: string; mood?: string };

    if (!situation?.trim() || !mood?.trim()) {
      return Response.json(
        { error: "Both 'situation' and 'mood' are required" },
        { status: 400 }
      );
    }

    console.log(`[API] Generating script — mood: "${mood}", situation: "${situation}"`);

    const graph = buildGraph();

    const result = await graph.invoke({
      input: { situation: situation.trim(), mood: mood.trim() },
      story: null,
      characters: [],
      scenes: [],
      dialogues: {},
      regenerate: null,
    });

    if (!result.story) {
      return Response.json(
        { error: "Story generation returned no output" },
        { status: 500 }
      );
    }

    // Merge the dialogue records back into their respective scenes
    const scenesWithDialogue = result.scenes.map((scene: any) => ({
      ...scene,
      dialogue: result.dialogues[scene.sceneNumber] ?? [],
    }));

    const scriptData: ScriptData = {
      id: randomUUID(),
      title: result.story.title,
      tagline: result.story.tagline,
      characters: result.characters,
      scenes: scenesWithDialogue,
    };

    console.log(`[API] Done — "${scriptData.title}" (${scriptData.scenes.length} scenes)`);
    return Response.json(scriptData);

  } catch (error: any) {
    console.error("[API] Generation error:", error);
    return Response.json(
      { error: error.message ?? "Script generation failed" },
      { status: 500 }
    );
  }
}
