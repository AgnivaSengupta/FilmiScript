import connectDB from "@/lib/db/mongodb";
import Script from "@/lib/db/models/Script";
import type { HistoryItem } from "@/lib/db/models/Script";

export const runtime = "nodejs";

/**
 * GET /api/scripts
 * Returns a lightweight history list for the sidebar.
 * Only fetches: id, title, tagline, mood, createdAt — NO scenes or dialogue.
 * Sorted newest-first, capped at 50 entries.
 */
export async function GET() {
    try {
        await connectDB();

        const scripts = await Script.find(
            {},
            "_id title tagline mood createdAt"  // projection — skip characters/scenes
        )
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();                           // plain JS objects, faster than full docs

        const history: HistoryItem[] = scripts.map((s) => ({
            id: (s._id as any).toString(),   // lean() strips Mongoose virtuals — use _id directly
            title: s.title as string,
            tagline: s.tagline as string,
            mood: s.mood as string,
            createdAt: (s.createdAt as Date).toISOString(),
        }));

        return Response.json(history);
    } catch (error: any) {
        return Response.json(
            { error: error.message ?? "Failed to fetch history" },
            { status: 500 }
        );
    }
}