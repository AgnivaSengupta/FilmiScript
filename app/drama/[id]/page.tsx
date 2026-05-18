import connectDB from "@/lib/db/mongodb";
import Script from "@/lib/db/models/Script";
import { toScriptData } from "@/lib/db/models/Script";
import { Types } from "mongoose";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ScriptData } from "@/store/useScriptStore";

// ── Metadata (SEO + Open Graph for link previews) ─────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) return { title: "Drama Not Found" };

  await connectDB();
  const doc = await Script.findById(id).lean();
  if (!doc) return { title: "Drama Not Found" };

  return {
    title: `${doc.title as string} | FilmiScript`,
    description: doc.tagline as string,
    openGraph: {
      title: doc.title as string,
      description: doc.tagline as string,
      type: "article",
    },
  };
}

// ── Drama Page ────────────────────────────────────────────────────────────────

export default async function DramaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!Types.ObjectId.isValid(id)) notFound();

  await connectDB();
  const doc = await Script.findById(id);
  if (!doc) notFound();

  const script: ScriptData = toScriptData(doc);
  const mood = doc.mood as string;
  const situation = doc.situation as string;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white font-sans">
      {/* ── Film strip top bar ── */}
      <div className="w-full h-8 bg-amber-400 flex items-center overflow-hidden">
        <div className="flex gap-1 px-2 animate-none">
          {Array.from({ length: 60 }).map((_, i) => (
            <div key={i} className="w-6 h-5 bg-slate-900 rounded-sm shrink-0" />
          ))}
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-16">
        {/* ── Header ── */}
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-400 font-bold mb-4">
            FilmiScript Presents
          </p>
          <h1 className="text-5xl font-serif font-bold mb-4 leading-tight bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
            {script.title}
          </h1>
          <p className="text-lg text-indigo-200 italic mb-6">&ldquo;{script.tagline}&rdquo;</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className="text-xs bg-indigo-800/60 border border-indigo-600/40 px-3 py-1 rounded-full text-indigo-200">
              {mood}
            </span>
            <span className="text-indigo-500">·</span>
            <span className="text-xs text-indigo-300 max-w-xs text-center truncate">
              {situation}
            </span>
          </div>
        </div>

        {/* ── Characters ── */}
        <section className="mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-amber-400/70 mb-5 text-center">
            Cast of Characters
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {script.characters.map((char) => (
              <div
                key={char.name}
                className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm"
              >
                <div className="text-3xl mb-2">{char.avatar}</div>
                <p className="font-serif font-semibold text-white text-sm">{char.name}</p>
                <p className="text-[11px] text-indigo-300 capitalize">{char.role.replace("_", " ")}</p>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{char.personality}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Scenes ── */}
        <section className="space-y-10">
          {script.scenes.map((scene) => (
            <div key={scene.sceneNumber} className="relative">
              {/* Scene header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-px bg-amber-400/40 shrink-0" />
                <span className="text-[10px] font-bold tracking-widest text-amber-400/80 uppercase whitespace-nowrap">
                  Scene {scene.sceneNumber}
                </span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="font-serif text-xl text-white font-semibold mb-2">
                  {scene.title}
                </h3>
                <p className="text-sm text-indigo-300 italic mb-5 border-l-2 border-indigo-600/50 pl-3">
                  {scene.description}
                </p>

                {/* Characters present */}
                <div className="flex gap-1.5 flex-wrap mb-5">
                  {scene.charactersPresent.map((name) => {
                    const char = script.characters.find((c) => c.name === name);
                    return (
                      <span
                        key={name}
                        className="text-xs bg-indigo-900/60 border border-indigo-700/40 text-indigo-200 px-2 py-0.5 rounded-md"
                      >
                        {char?.avatar} {name}
                      </span>
                    );
                  })}
                </div>

                {/* Dialogue */}
                <div className="space-y-4">
                  {scene.dialogue.map((line, idx) => {
                    const char = script.characters.find((c) => c.name === line.speaker);
                    const isPrimary =
                      scene.charactersPresent.indexOf(line.speaker) % 2 === 0;
                    return (
                      <div
                        key={idx}
                        className={`flex gap-3 ${!isPrimary ? "flex-row-reverse" : ""}`}
                      >
                        <div className="text-xl shrink-0 mt-1">{char?.avatar ?? "🎭"}</div>
                        <div className={`max-w-[80%] ${!isPrimary ? "items-end" : ""} flex flex-col`}>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                              isPrimary ? "text-blue-300" : "text-rose-300"
                            }`}
                          >
                            {line.speaker}
                          </span>
                          <p
                            className={`text-sm px-4 py-2.5 rounded-2xl leading-relaxed ${
                              isPrimary
                                ? "bg-indigo-800/60 text-indigo-100 rounded-tl-none border border-indigo-700/30"
                                : "bg-rose-900/40 text-rose-100 rounded-tr-none border border-rose-800/30"
                            }`}
                          >
                            {line.line}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* ── Footer ── */}
        <div className="text-center mt-16 pt-8 border-t border-white/10">
          <p className="text-xs text-indigo-500 mb-1">Generated with</p>
          <p className="font-serif text-lg text-amber-400 font-bold">FilmiScript</p>
          <p className="text-xs text-indigo-600 mt-1">
            Create your own Bollywood drama at FilmiScript
          </p>
        </div>
      </main>

      {/* ── Film strip bottom bar ── */}
      <div className="w-full h-8 bg-amber-400 flex items-center overflow-hidden">
        <div className="flex gap-1 px-2">
          {Array.from({ length: 60 }).map((_, i) => (
            <div key={i} className="w-6 h-5 bg-slate-900 rounded-sm shrink-0" />
          ))}
        </div>
      </div>
    </div>
  );
}
