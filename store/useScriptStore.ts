import { create } from 'zustand'

export type Dialogue = {speaker: string, line: string}
export type Character = { name: string, role: string, personality: string, description: string, avatar: string }
export type Scene = { sceneNumber: number, title: string, description: string, charactersPresent: string[], dialogue: Dialogue[]}

export type ScriptData = {
  id: string; // Useful for the shareable link later!
  title: string;
  tagline: string;
  characters: Character[];
  scenes: Scene[];
};

interface ScriptStore {
  currentScript: ScriptData | null;
  history: ScriptData[];
  isLoading: boolean;
  error: string | null;

  generateScript: (situation: string, mood: string) => Promise<void>;
  loadFromHistory: (id: string) => void;
  clearError: () => void;  
}


export const useScriptStore = create<ScriptStore>((set, get) => ({
  currentScript: null,
  history: [], // You can later initialize this from localStorage
  isLoading: false,
  error: null,

  generateScript: async (situation, mood) => {
    set({ isLoading: true, error: null });
    
    try {
      // Replace this with your actual OpenRouter API call
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation, mood })
      });

      if (!response.ok) throw new Error('Failed to generate script');
      
      const newScript: ScriptData = await response.json();
      
      set((state) => ({ 
        currentScript: newScript,
        history: [newScript, ...state.history], // Add to history automatically
        isLoading: false 
      }));
      
    } catch (err: any) {
      set({ error: err.message || 'Something went wrong', isLoading: false });
    }
  },

  loadFromHistory: (id) => {
    const { history } = get();
    const script = history.find(s => s.id === id);
    if (script) set({ currentScript: script });
  },

  clearError: () => set({ error: null })
}));