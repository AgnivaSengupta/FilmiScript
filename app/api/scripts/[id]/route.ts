import Script, { toScriptData } from "@/lib/db/models/Script";
import connectDB from "@/lib/db/mongodb";
import { Types } from "mongoose";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
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
  } catch (error: any) {
    return Response.json(
      { error: error.message ?? "Failed to fetch script" },
      { status: 500 }
    );
  }
}