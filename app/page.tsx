"use client";

import { motion } from "framer-motion";
import { Sidebar } from "../components/Sidebar";
import { SceneCard } from "../components/SceneCard";
import { InputBox } from "../components/InputBox";
import { RightSideBar } from "../components/RightSidebar";
import { Share2 } from "lucide-react";
import { useScriptStore } from "@/store/useScriptStore";
import Image from "next/image";

// --- Variants for smooth motion (optional) ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

export default function Dashboard() {
  const { currentScript, isLoading } = useScriptStore();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-zinc-50 font-sans text-slate-800">
      {/* --- LEFT SIDEBAR --- */}
      <Sidebar />

      {/* --- MAIN CONTENT --- */}
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 flex flex-col overflow-y-auto p-8 h-full w-full"
      >
        <div className="flex-1 max-w-4xl w-full mx-auto overflow-y-auto no-scrollbar">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-serif tracking-wider text-slate-900 mb-2">
                {isLoading
                  ? "Writing your blockbuster..."
                  : currentScript?.title || "Waiting for Drama..."}
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                {currentScript?.tagline ||
                  "Enter a situation below to generate your Bollywood script."}
              </p>
            </div>

            <div className="p-1 rounded-sm border hover:bg-green-100 hover:text-green-600 cursor-pointer">
              <Share2 className="w-5 h-5" />
            </div>
          </div>


          <div className="space-y-6 pb-20">
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-40 bg-white border border-gray-200 rounded-xl"></div>
                <div className="h-40 bg-white border border-gray-200 rounded-xl"></div>
              </div>
            ) : !currentScript ? (
              // No script generated yet — show empty state
              <div className="flex flex-col items-center justify-center pt-16 opacity-50">
                <Image src="/filler2.png" alt="No script yet" width={300} height={300} />
              </div>
            ) : (
              currentScript.scenes.map((scene) => (
                <SceneCard key={scene.sceneNumber} scene={scene} />
              ))
            )}
          </div>
        </div>

        <div className="w-full max-w-4xl mx-auto pt-0">
          <InputBox />
        </div>
      </motion.main>

      {/* --- RIGHT SIDEBAR --- */}
      <RightSideBar />
    </div>
  );
}
