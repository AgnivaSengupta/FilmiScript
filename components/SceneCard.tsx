import { Copy, RefreshCw } from "lucide-react";
import { motion } from "motion/react"


const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
};

export const SceneCard = ({sceneNumber}: {sceneNumber: number}) => {
  return (
      <motion.div variants={itemVariants} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-gray-300"></span>
          <span className="text-xs font-bold tracking-wide text-gray-500 uppercase">Scene {sceneNumber}</span>
        </div> 


        <div className="flex items-center gap-5">        
          <div className="hover:bg-zinc-100 p-0.5 rounded-sm cursor-pointer hover:scale-105">
            <RefreshCw className="w-4 h-4" />
          </div>
          <div className="hover:bg-zinc-100 p-0.5 rounded-sm cursor-pointer hover:scale-105">
            <Copy className="w-4 h-4" />
          </div>
        </div>
        
        </div>

        <div className="space-y-4">
          {/* Blue Text Block */}
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-400"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 w-full bg-blue-50 rounded-full"></div>
              <div className="h-3 w-2/3 bg-blue-50 rounded-full"></div>
            </div>
          </div>

          {/* Red Text Block (Right aligned dot) */}
          <div className="flex items-start gap-3 mt-2 ml-10">
            <div className="flex-1 space-y-2">
              <div className="h-3 w-full bg-rose-50 rounded-full"></div>
              <div className="h-3 w-3/4 bg-rose-50 rounded-full"></div>
            </div>
            <div className="w-2 h-2 mt-1.5 rounded-full bg-rose-400"></div>
          </div>
          
          {/* Second Blue Block */}
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-400"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/2 bg-blue-50 rounded-full"></div>
            </div>
          </div>
        </div>
      </motion.div>
  )
}