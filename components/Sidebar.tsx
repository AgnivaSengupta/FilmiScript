import { PanelLeft, Plus, LogOut } from "lucide-react"; // Added LogOut icon for collapsed state
import { motion, AnimatePresence } from "framer-motion"; // Use framer-motion for AnimatePresence
import Image from "next/image";
import { useState } from "react";

// Adjusted HistoryTab to handle the collapsed state gracefully
const HistoryTab = ({ open }: { open: boolean }) => {
  return (
    <div 
      className={`bg-white border border-gray-200 rounded-lg flex items-center relative overflow-hidden shrink-0 transition-all ${
        open ? "h-10 px-3 w-full" : "h-10 w-10 mx-auto"
      }`}
    >
       <div className="w-full h-full opacity-10 bg-[repeating-linear-gradient(45deg,#94a3b8_0px,#94a3b8_2px,transparent_2px,transparent_6px)]"></div>
    </div>
  );
};

export const Sidebar = () => {
  const [open, setOpen] = useState(true);

  return (
    <motion.aside 
      initial={false}
      // Animate the width smoothly instead of toggling Tailwind classes
      animate={{ width: open ? 256 : 80 }} 
      className="flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-full p-4 overflow-hidden"
    >
      {/* Heading */}
      <div className={`flex items-center mb-5 ${open ? "justify-between" : "justify-center flex-col gap-4"}`}>      
        <div className="flex items-center gap-2 overflow-hidden">      
          <Image
            src="/logo2.png"
            alt="Profile Pic"
            width={open ? 60 : 40} // Shrink logo slightly when closed
            height={open ? 60 : 40}
            className="shrink-0 transition-all"
          />
          {/* Smoothly show/hide the text */}
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
        className={`flex items-center justify-center gap-2 w-full bg-green-500 text-white font-serif py-2 rounded-lg mb-6 transition-all hover:bg-green-600 shadow-sm cursor-pointer ${
          open ? "px-4 text-xl" : "px-0 text-sm"
        }`}
      >
        <Plus className="w-5 h-5 shrink-0" /> 
        {open && <span className="whitespace-nowrap">New Chat</span>}
      </button>

      {/* History Section */}
      <div className="flex flex-col gap-3 flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
        {open && (
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
            History
          </h3>
        )}
        
        {/* Dashed Wireframe Boxes */}
        <HistoryTab open={open} />
        <HistoryTab open={open} />
        <HistoryTab open={open} />
        <HistoryTab open={open} />
        <HistoryTab open={open} />
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