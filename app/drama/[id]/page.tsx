import connectDB from "@/lib/db/mongodb";
import Script from "@/lib/db/models/Script";
import { toScriptData } from "@/lib/db/models/Script";
import { Types } from "mongoose";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ScriptData } from "@/store/useScriptStore";
import Link from "next/link";

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
    <div className="min-h-screen w-full bg-zinc-50 font-sans text-slate-800">
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* ── Header ── */}
        <div className="mb-12 text-center flex flex-col items-center">
          <Link 
            href="/" 
            className="inline-block mb-8 text-xs font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-widest transition-colors"
          >
            &larr; Back to FilmiScript
          </Link>
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-wider text-slate-900 mb-4">
            {script.title}
          </h1>
          <p className="text-lg text-gray-500 italic mb-6 max-w-2xl">
            &ldquo;{script.tagline}&rdquo;
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100">
              {mood}
            </span>
            <span className="text-gray-300">·</span>
            <span className="text-sm text-gray-500 max-w-md text-center">
              {situation}
            </span>
          </div>
        </div>

        {/* ── Characters ── */}
        <section className="mb-12">
          <h2 className="text-sm font-bold tracking-wide text-gray-400 uppercase mb-6 text-center">
            Cast of Characters
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {script.characters.map((char) => (
              <div
                key={char.name}
                className="bg-white rounded-xl border border-gray-200 p-5 text-center shadow-sm"
              >
                <div className="text-4xl mb-3">{char.avatar}</div>
                <p className="font-serif font-semibold text-slate-800 text-lg">{char.name}</p>
                <p className="text-xs text-indigo-600 capitalize font-medium">{char.role.replace("_", " ")}</p>
                <p className="text-xs text-gray-500 mt-3 line-clamp-3">{char.personality}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Scenes ── */}
        <section className="space-y-6">
          <h2 className="text-sm font-bold tracking-wide text-gray-400 uppercase mb-6 text-center">
            The Script
          </h2>
          
          {script.scenes.map((scene) => (
            <div 
              key={scene.sceneNumber} 
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
            >
              {/* Scene Header */}
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
                <span className="inline-block w-2 h-2 rounded-full bg-gray-300"></span>
                <span className="text-xs font-bold tracking-wide text-gray-500 uppercase">
                  Scene {scene.sceneNumber} : {scene.title}
                </span>
              </div>

              {/* Scene description + characters */}
              <div className="mb-6 space-y-3">
                <p className="text-sm text-gray-700 italic border-l-2 border-gray-200 pl-3">
                  {scene.description}
                </p>

                <div className="flex gap-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">
                    Present:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {scene.charactersPresent.map((char, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100"
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dialogue layout matching SceneCard.tsx */}
              <div className="space-y-4">
                {scene.dialogue.map((line, idx) => {
                  const isPrimary =
                    scene.charactersPresent.indexOf(line.speaker) % 2 === 0;
                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 ${!isPrimary ? "ml-8" : ""}`}
                    >
                      <div
                        className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${isPrimary ? "bg-blue-400" : "bg-rose-400"}`}
                      ></div>
                      <div>
                        <span className="text-xs font-bold text-gray-900 uppercase block mb-0.5">
                          {line.speaker}
                        </span>
                        <p className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                          {line.line}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        {/* ── Footer ── */}
        <div className="mt-16 text-center border-t border-gray-200 pt-10 pb-6">
          <Link href="/" className="inline-block group">
            <p className="text-xs text-gray-400 mb-1">Generated with</p>
            <p className="font-serif text-xl text-slate-800 font-bold group-hover:text-indigo-600 transition-colors">
              FilmiScript
            </p>
            <p className="text-xs text-indigo-500 mt-2 font-medium group-hover:underline">
              Create your own Bollywood drama &rarr;
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}