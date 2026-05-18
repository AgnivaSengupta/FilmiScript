import { HistoryItem } from '@/lib/db/models/Script';
import { create } from 'zustand'

export type Dialogue = { speaker: string, line: string }
export type Character = { name: string, role: string, personality: string, description: string, avatar: string }
export type Scene = { sceneNumber: number, title: string, description: string, charactersPresent: string[], dialogue: Dialogue[] }

export type ScriptData = {
  id: string; // Useful for the shareable link later!
  title: string;
  tagline: string;
  characters: Character[];
  scenes: Scene[];
};

interface ScriptStore {
  currentScript: ScriptData | null;
  history: HistoryItem[];
  isLoading: boolean;
  error: string | null;

  generateScript: (situation: string, mood: string) => Promise<void>;
  fetchHistory: () => Promise<void>;
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

      const historyForm = {
        id: newScript.id,
        title: newScript.title,
        tagline: newScript.tagline,
        mood: mood,
        createdAt: new Date().toISOString()
      }
      set((state) => ({
        currentScript: newScript,
        history: [historyForm, ...state.history], // Add to history automatically
        isLoading: false
      }));

    } catch (err: any) {
      set({ error: err.message || 'Something went wrong', isLoading: false });
    }
  },

  fetchHistory: async () => {
    try {
      const response = await fetch('/api/scripts');
      if (!response.ok) throw new Error('Failed to fetch history');
      const history: HistoryItem[] = await response.json();
      set({ history });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch history' });
    }
  },

  loadFromHistory: async (id) => {
    try {
      const response = await fetch(`/api/scripts/${id}`);
      if (!response.ok) throw new Error('Failed to load script');
      const script: ScriptData = await response.json();
      set({ currentScript: script });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load script' });
    }
  },

  clearError: () => set({ error: null })
}));