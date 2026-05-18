import { motion } from "motion/react"
import { CharacterSketch } from "./CharacterSketch"
import { AvatarCard } from "./AvatarCards"
import { AvatarSection } from "./AvatarSection"

export const RightSideBar = () => {
  return (
    <motion.aside
      initial={{ x: 10, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-180 flex-shrink-0 bg-white border-l border-gray-200 h-full p-6 overflow-y-auto"
    >
      {/* Character Sketch Card */}
      <CharacterSketch/>

      {/* Avatars Section */}
      {/*<div className="rounded-xl border border-gray-200 p-5 bg-white shadow-sm">
        <h3 className="text-2xl font-serif text-slate-900 mb-4">Avatars</h3>

        <div className="space-y-3">
          <AvatarCard />
          <AvatarCard />
          <AvatarCard />
          <AvatarCard />
        </div>
      </div>*/}

      <AvatarSection/>
    </motion.aside>
  )
}