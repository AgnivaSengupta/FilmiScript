import { useScriptStore } from "@/store/useScriptStore";

export const CharacterSketch = () => {
  const data = [
    {
      id: 1,
      name: "Sherlock Holmes",
      personality: "Analytical, observant, logical",
    },
    { id: 2, name: "Tony Stark", personality: "Genius, sarcastic, confident" },
    {
      id: 3,
      name: "Hermione Granger",
      personality: "Intelligent, disciplined, loyal",
    },
    {
      id: 4,
      name: "Batman",
      personality: "Brooding, strategic, justice-driven",
    },
    {
      id: 5,
      name: "Naruto Uzumaki",
      personality: "Energetic, determined, optimistic",
    },
  ];

  const currentScript = useScriptStore((state) => state.currentScript);
  const isLoading = useScriptStore((state) => state.isLoading);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 p-5 mb-6 bg-white shadow-sm animate-pulse">
        <div className="h-6 w-40 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-2 mb-5">
          <div className="h-1.5 w-full bg-gray-100 rounded-full"></div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!currentScript || currentScript.characters.length === 0) return null;
  
  return (
    <div className="rounded-xl border border-gray-200 p-5 mb-6 bg-white shadow-sm">
      <h3 className="text-2xl font-serif text-slate-900 mb-4">
        Character Sketch
      </h3>

      {/* Sketch Lines */}
      <div className="space-y-2 mb-5">
        <div className="h-1.5 w-full bg-gray-100 rounded-full"></div>
        <div className="h-1.5 w-full bg-gray-100 rounded-full"></div>
        <div className="h-1.5 w-3/4 bg-gray-100 rounded-full"></div>
      </div>

      <div className="w-full max-w-2xl mx-auto mt-6 rounded-sm border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 uppercase text-base tracking-wider">
            <tr>
              <th className="px-6 py-3 text-left font-serif border-r">
                Character
              </th>
              <th className="px-6 py-3 text-left font-serif">Personality</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {currentScript.characters.map((char, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-2 font-medium text-gray-900 border-r">
                  {char.name}
                </td>
                <td className="px-6 py-4 text-gray-600">{char.personality}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
