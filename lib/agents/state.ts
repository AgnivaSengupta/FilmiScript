import { Annotation } from "@langchain/langgraph";
import { Character, Scene, Dialogue } from "@/store/useScriptStore";

export const GraphState = Annotation.Root({
  // 1. Initial Input (Overwrites state)
  input: Annotation<{ situation: string; mood: string }>({
    reducer: (state, update) => update,
  }),
  
  // 2. Story Output (Overwrites state)
  story: Annotation<{ title: string; tagline: string; plot: string } | null>({
    reducer: (state, update) => update,
    default: () => null,
  }),
  
  // 3. Characters Output (Overwrites state)
  characters: Annotation<Character[]>({
    reducer: (state, update) => update,
    default: () => [],
  }),
  
  // 4. Scenes Output (Overwrites state)
  scenes: Annotation<Scene[]>({
    reducer: (state, update) => update,
    default: () => [],
  }),
  
  // 5. Dialogues Output (Merges state — keyed by sceneNumber for incremental updates)
  dialogues: Annotation<Record<number, Dialogue[]>>({
    reducer: (state, update) => ({ ...state, ...update }),
    default: () => ({}),
  }),
  
  // 6. Orchestration Flag (Used for the Regenerate Bonus Feature)
  regenerate: Annotation<{ 
    target: "story" | "characters" | "scenes" | "dialogues"; 
    sceneId?: number 
  } | null>({
    reducer: (state, update) => update,
    default: () => null,
  }),
});