import { useScriptStore } from "@/store/useScriptStore"
import { AvatarCard } from "./AvatarCards";

export const AvatarSection = () => {

  const { currentScript } = useScriptStore();

  if (!currentScript || currentScript.characters.length === 0) return null;
  
  return (
    <div className="rounded-xl border border-gray-200 p-5 bg-white shadow-sm">
      <h3 className="text-2xl font-serif text-slate-900 mb-4">Avatars</h3>

      <div className="space-y-3">
        {currentScript.characters.map((character, index) => (
          <AvatarCard key={index} character={ character } />
        ))}
      </div>
    </div>
  )
}