import mongoose, { Schema, Document, Model } from "mongoose";
import type { ScriptData } from "@/store/useScriptStore";

// ── Subdocument interfaces ────────────────────────────────────────────────────

interface IDialogue {
  speaker: string;
  line: string;
}

interface ICharacter {
  name: string;
  role: string;
  personality: string;
  description: string;
  avatar: string;
}

interface IScene {
  sceneNumber: number;
  title: string;
  description: string;
  charactersPresent: string[];
  dialogue: IDialogue[];
}

// ── Top-level document interface ──────────────────────────────────────────────

export interface IScript extends Document {
  // UUID string generated in the generate route — also stored as `id` so the
  // existing ScriptData type and loadFromHistory(id) work without changes.
  id: string;
  title: string;
  tagline: string;
  characters: ICharacter[];
  scenes: IScene[];

  // Extra metadata not in ScriptData (useful for history sidebar display)
  situation: string;
  mood: string;
  createdAt: Date;
  updatedAt: Date;
}

// ── Subdocument schemas ───────────────────────────────────────────────────────

const DialogueSchema = new Schema<IDialogue>(
  {
    speaker: { type: String, required: true },
    line: { type: String, required: true },
  },
  { _id: false } // No separate _id for dialogue lines
);

const CharacterSchema = new Schema<ICharacter>(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    personality: { type: String, required: true },
    description: { type: String, required: true },
    avatar: { type: String, default: "🎭" },
  },
  { _id: false }
);

const SceneSchema = new Schema<IScene>(
  {
    sceneNumber: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    charactersPresent: [{ type: String }],
    dialogue: [DialogueSchema],
  },
  { _id: false }
);

// ── Root schema ───────────────────────────────────────────────────────────────

const ScriptSchema = new Schema<IScript>(
  {
    // Store our UUID as `id` — Mongoose will also create its own `_id` (ObjectId)
    // but we query by this `id` string to match the existing ScriptData contract.
    // id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    tagline: { type: String, required: true },
    characters: [CharacterSchema],
    scenes: [SceneSchema],
    situation: { type: String, required: true },
    mood: { type: String, required: true },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// ── Model (hot-reload safe) ───────────────────────────────────────────────────
// In Next.js dev mode, modules get re-evaluated on hot reload.
// `mongoose.models.Script` check prevents "Cannot overwrite model" errors.

const Script: Model<IScript> =
  mongoose.models.Script ?? mongoose.model<IScript>("Script", ScriptSchema);

export default Script;

// ── Utility: convert IScript document → ScriptData ───────────────────────────
// Used in GET /api/scripts/[id] to return the shape the store expects.
export function toScriptData(doc: IScript): ScriptData {
  return {
    id: doc._id.toString(),
    title: doc.title,
    tagline: doc.tagline,
    characters: doc.characters.map((c) => ({
      name: c.name,
      role: c.role,
      personality: c.personality,
      description: c.description,
      avatar: c.avatar,
    })),
    scenes: doc.scenes.map((s) => ({
      sceneNumber: s.sceneNumber,
      title: s.title,
      description: s.description,
      charactersPresent: s.charactersPresent,
      dialogue: s.dialogue.map((d) => ({ speaker: d.speaker, line: d.line })),
    })),
  };
}

// ── Utility: lightweight shape for history sidebar ────────────────────────────
// Avoids sending full scene/dialogue data to the sidebar list.
export type HistoryItem = {
  id: string;
  title: string;
  tagline: string;
  mood: string;
  createdAt: string; // ISO string (serialised for client)
};

export function toHistoryItem(doc: IScript): HistoryItem {
  return {
    id: doc.id,
    title: doc.title,
    tagline: doc.tagline,
    mood: doc.mood,
    createdAt: doc.createdAt.toISOString(),
  };
}
