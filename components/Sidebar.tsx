"use client"

import { PanelLeft, Plus, LogOut, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useScriptStore } from "@/store/useScriptStore";
import { HistoryItem } from "@/lib/db/models/Script";

// ── HistoryTab ────────────────────────────────────────────────────────────────

const HistoryTab = ({
  open,
  item,
  onClick,
  onDelete,
}: {
  open: boolean;
  item: HistoryItem;
  onClick: () => void;
  onDelete: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className={`group bg-white border border-gray-200 rounded-lg flex items-center relative overflow-hidden shrink-0 transition-all cursor-pointer hover:border-green-400 hover:bg-green-50 ${
        open ? "h-14 px-3 w-full" : "h-10 w-10 mx-auto"
      }`}
    >
      {open ? (
        <>
          <div className="flex-1 min-w-0">
            <p className="font-serif text-sm font-semibold text-slate-800 truncate leading-tight">
              {item.title}
            </p>
            <p className="text-xs text-gray-400 truncate">{item.mood}</p>
          </div>
          {/* Trash icon — visible on hover only */}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            title="Delete script"
            className="ml-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-500 transition-all shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </>
      ) : (
        <span className="font-serif font-bold text-green-600 text-center w-full">
          {item.title.charAt(0)}
        </span>
      )}
    </div>
  );
};

// ── Sidebar ───────────────────────────────────────────────────────────────────

export const Sidebar = () => {
  const [open, setOpen] = useState(true);
  const { history, fetchHistory, loadFromHistory, currentScript, deleteScript } = useScriptStore();

  // Fetch history from DB on every mount — this is what persists over reloads
  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <motion.aside
      initial={false}
      animate={{ width: open ? 256 : 80 }}
      className="flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-full p-4 overflow-hidden"
    >
      {/* Heading */}
      <div className={`flex items-center mb-5 ${open ? "justify-between" : "justify-center flex-col gap-4"}`}>
        <div className="flex items-center gap-2 overflow-hidden">
          <Image
            src="/logo2.png"
            alt="FilmiScript Logo"
            width={open ? 60 : 40}
            height={open ? 60 : 40}
            className="shrink-0 transition-all"
          />
          <AnimatePresence>
            {open && (
              <motion.h1
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-2xl font-bold font-serif whitespace-nowrap"
              >
                FilmiScript
              </motion.h1>
            )}
          </AnimatePresence>
        </div>

        <PanelLeft
          onClick={() => setOpen(!open)}
          className="w-5 h-5 cursor-pointer text-gray-500 hover:text-gray-900 shrink-0 transition-colors"
        />
      </div>

      {/* New Chat Button */}
      <button
        onClick={() => useScriptStore.setState({ currentScript: null })}
        className={`flex items-center justify-center gap-2 w-full bg-green-500 text-white font-serif py-2 rounded-lg mb-6 transition-all hover:bg-green-600 shadow-sm cursor-pointer ${
          open ? "px-4 text-xl" : "px-0 text-sm"
        }`}
      >
        <Plus className="w-5 h-5 shrink-0" />
        {open && <span className="whitespace-nowrap">New Chat</span>}
      </button>

      {/* History Section */}
      <div className="flex flex-col gap-2 flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
        {open && (
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
            History
          </h3>
        )}

        {history.length === 0 && open && (
          <p className="text-xs text-gray-400 text-center mt-4">
            No scripts yet. Generate one!
          </p>
        )}

        {history.map((item) => (
          <HistoryTab
            key={item.id}
            open={open}
            item={item}
            onClick={() => loadFromHistory(item.id)}
            onDelete={() => deleteScript(item.id)}
          />
        ))}
      </div>

      {/* Log Out Button */}
      <button
        className={`mt-auto border border-gray-300 bg-zinc-100 hover:bg-zinc-200 py-2 rounded-lg transition-colors font-medium font-serif cursor-pointer flex items-center justify-center gap-2 ${
          open ? "text-lg px-4" : "text-sm px-0"
        }`}
      >
        {!open && <LogOut className="w-4 h-4 shrink-0 text-gray-600" />}
        {open && <span className="whitespace-nowrap">Log Out</span>}
      </button>
    </motion.aside>
  );
};