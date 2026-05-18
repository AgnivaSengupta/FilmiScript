"use client";

import { motion } from "framer-motion";
import { Sidebar } from "../components/Sidebar";
import { SceneCard } from "../components/SceneCard";
import { InputBox } from "../components/InputBox";
import { RightSideBar } from "../components/RightSidebar";
import { Share2, Check } from "lucide-react";
import { useScriptStore } from "@/store/useScriptStore";
import Image from "next/image";
import { useState } from "react";
import { MobileNavbar } from "@/components/MobileNavbar";

// --- Variants for smooth motion (optional) ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

export default function Dashboard() {
  const { currentScript, isLoading } = useScriptStore();
  const [copied, setCopied] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);

  const handleShare = () => {
    if (!currentScript) return;
    const url = `${window.location.origin}/drama/${currentScript.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-zinc-50 font-sans text-slate-800">
      {/* --- LEFT SIDEBAR --- */}
      <Sidebar
        isMobileOpen={isLeftSidebarOpen}
        onMobileClose={() => setIsLeftSidebarOpen(false)}
      />

      {/* --- MAIN CONTENT --- */}
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 flex flex-col overflow-y-auto p-8 h-full w-full"
      >
        {/*<button
          onClick={() => setIsRightSidebarOpen(true)}
          className="md:hidden mb-4 p-2 bg-blue-600 text-white rounded-md w-fit"
        >
          Open Menu
        </button>*/}

        <MobileNavbar setIsRightSidebarOpen={setIsRightSidebarOpen} setIsLeftSidebarOpen={ setIsLeftSidebarOpen } />

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

            <div
              onClick={handleShare}
              title={
                currentScript
                  ? `Share: /drama/${currentScript.id}`
                  : "Generate a script first"
              }
              className={`p-1 rounded-sm border transition-all ${
                currentScript
                  ? copied
                    ? "bg-green-100 text-green-600 border-green-300"
                    : "hover:bg-green-100 hover:text-green-600 cursor-pointer border-gray-200"
                  : "opacity-30 cursor-not-allowed border-gray-200"
              }`}
            >
              {copied ? (
                <Check className="w-5 h-5" />
              ) : (
                <Share2 className="w-5 h-5" />
              )}
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
                <Image
                  src="/filler2.png"
                  alt="No script yet"
                  width={300}
                  height={300}
                />
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
      <RightSideBar
        isOpen={isRightSidebarOpen}
        onClose={() => setIsRightSidebarOpen(false)}
      />
    </div>
  );
}
