import { AnimatePresence, motion } from "motion/react";
import { CharacterSketch } from "./CharacterSketch";
import { AvatarSection } from "./AvatarSection";
import { useScriptStore } from "@/store/useScriptStore";
import Image from "next/image";

interface RightSidebarProp {
  isOpen: boolean;
  onClose: () => void;
}

export const RightSideBar = ({ isOpen, onClose }: RightSidebarProp) => {
  const { currentScript } = useScriptStore();
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40 md:hidden cursor-pointer"
          />
        )}
      </AnimatePresence>
      <motion.aside
        initial={{ x: "100%", opacity: 0 }}
        animate={{
          x: isOpen ? 0 : "100%",
          opacity: 1,
        }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className={`
                  fixed inset-y-0 right-0 z-50 w-[80%] max-w-sm 
                  md:max-w-none md:relative md:inset-auto md:w-[400px] lg:w-[400px] 2xl:w-[800px] md:z-0 flex-shrink-0 
                  bg-white border-l border-gray-200 h-full p-4 md:p-6 
                  overflow-y-auto flex flex-col gap-6 
                  md:!transform-none
                `}
      >
        {/* Mobile Close Button */}
        <div className="flex justify-end md:hidden mb-2">
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        {!currentScript && (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-center -translate-y-30">          
              <Image src="/Breeze.png" alt='No Story' width={200} height={200} />
              <h1 className="font-serif text-xl text-center text-gray-500">Generate a Script to get Character Sketch and Avatars</h1>
            </div>
          </div>
        )}
        {/* Character Sketch Card */}
        <CharacterSketch />
        <AvatarSection />
      </motion.aside>
    </>
  );
};
