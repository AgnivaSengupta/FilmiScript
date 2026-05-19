import Script, { toScriptData } from "@/lib/db/models/Script";
import connectDB from "@/lib/db/mongodb";
import { Types } from "mongoose";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Guard against malformed ObjectIds — Mongoose throws a CastError otherwise
    if (!Types.ObjectId.isValid(id)) {
      return Response.json({ error: "Invalid script ID" }, { status: 400 });
    }

    await connectDB();

    // Use findById — `id` from the URL is the _id ObjectId string
    const script = await Script.findById(id);

    if (!script) {
      return Response.json({ error: "Script not found" }, { status: 404 });
    }

    return Response.json(toScriptData(script));
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch the script",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/scripts/[id]
 * Permanently removes the script document from MongoDB.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return Response.json({ error: "Invalid script ID" }, { status: 400 });
    }

    await connectDB();

    const deleted = await Script.findByIdAndDelete(id);
    if (!deleted) {
      return Response.json({ error: "Script not found" }, { status: 404 });
    }

    console.log(`[API] Deleted script "${deleted.title}" (${id})`);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete script",
      },
      { status: 500 },
    );
  }
}
