import { generateSingleSceneDialogue } from "@/lib/agents/dialogueAgent";
import Script from "@/lib/db/models/Script";
import connectDB from "@/lib/db/mongodb";
import { Types } from "mongoose";

export const runtime = "nodejs";

/**
 * POST /api/scripts/[id]/regenerate-scene
 * Body: { sceneNumber: number }
 *
 * Re-generates dialogues for a single scene without touching the rest of the script.
 * 1. Fetches the full script from DB (needs characters, mood, situation)
 * 2. Calls generateSingleSceneDialogue() — no full pipeline
 * 3. Updates just that scene's dialogue array in MongoDB
 * 4. Returns the new Dialogue[] to the client
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { sceneNumber } = (await req.json()) as { sceneNumber: number };

    if (!Types.ObjectId.isValid(id)) {
      return Response.json({ error: "Invalid script ID" }, { status: 400 });
    }
    if (typeof sceneNumber !== "number") {
      return Response.json(
        { error: "sceneNumber is required" },
        { status: 400 },
      );
    }

    await connectDB();

    const script = await Script.findById(id);
    if (!script) {
      return Response.json({ error: "Script not found" }, { status: 404 });
    }

    const scene = script.scenes.find((s) => s.sceneNumber === sceneNumber);
    if (!scene) {
      return Response.json(
        { error: `Scene ${sceneNumber} not found` },
        { status: 404 },
      );
    }

    console.log(
      `[RegenerateScene] Script "${script.title}" — Scene ${sceneNumber} "${scene.title}"`,
    );

    // Generate fresh dialogues for this scene only
    const newDialogues = await generateSingleSceneDialogue({
      scene: {
        sceneNumber: scene.sceneNumber,
        title: scene.title,
        description: scene.description,
        charactersPresent: scene.charactersPresent,
      },
      characters: script.characters.map((c) => ({
        name: c.name,
        role: c.role,
        personality: c.personality,
        description: c.description,
      })),
      storyTitle: script.title,
      storySituation: script.situation, // original user input — serves as plot context
      mood: script.mood,
    });

    // Update just this scene's dialogue in MongoDB using an array filter
    await Script.findOneAndUpdate(
      { _id: id },
      { $set: { "scenes.$[elem].dialogue": newDialogues } },
      { arrayFilters: [{ "elem.sceneNumber": sceneNumber }] },
    );

    console.log(`[RegenerateScene] Done — ${newDialogues.length} new lines`);
    return Response.json(newDialogues);
  } catch (error) {
    console.error("[RegenerateScene] Error:", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Regeneration failed",
      },
      { status: 500 },
    );
  }
}
