"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useScriptStore } from "@/store/useScriptStore";
import { motion } from "motion/react";
import { useState } from "react";

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
};

export const InputBox = () => {
  const [situation, setSituation] = useState("");
  const [mood, setMood] = useState("");

  const { generateScript, isLoading } = useScriptStore();

  const handleGenerate = () => {
    if (!situation.trim() || !mood) return;
    generateScript(situation, mood);
  };
  return (
    <div className="w-full">
      <motion.div variants={itemVariants} className="mt-2x">
        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
          <textarea
            className="w-full min-h-[80px] p-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-200  focus:border-zinc-300 resize-none transition-all placeholder:text-gray-400 text-sm text-gray-700"
            placeholder="Write the story here..."
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            disabled={isLoading}
          ></textarea>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-400 font-medium">
              0 / 200 words
            </span>

            <div className="flex items-center gap-5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-zinc-50 shadow-sm border border-zinc-200 px-4 py-0.5 text-sm rounded-lg hover:bg-zinc-300/30 cursor-pointer"
                  >
                    {mood.length == 0 ? "Select the mood" : `Mood: ${mood}`}
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="rounded-md">
                  <DropdownMenuItem
                    className="cursor-pointer text-sm"
                    onClick={() => setMood("Romantic")}
                  >
                    Romantic
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer text-sm"
                    onClick={() => setMood("Thriller")}
                  >
                    Thriller
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer text-sm"
                    onClick={() => setMood("Emotional")}
                  >
                    Emotional
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer text-sm"
                    onClick={() => setMood("Dramatic")}
                  >
                    Dramatic
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer text-sm"
                    onClick={() => setMood("Funny")}
                  >
                    Funny
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="bg-slate-800 text-white hover:bg-slate-700 rounded-full p-2 transition-colors shadow-sm cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="19" x2="12" y2="5"></line>
                  <polyline points="5 12 12 5 19 12"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
