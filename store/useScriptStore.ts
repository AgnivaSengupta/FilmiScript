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
  regeneratingSceneNumber: number | null;  // tracks which scene is spinning
  error: string | null;

  generateScript: (situation: string, mood: string) => Promise<void>;
  fetchHistory: () => Promise<void>;
  loadFromHistory: (id: string) => void;
  regenerateScene: (sceneNumber: number) => Promise<void>;
  deleteScript: (id: string) => Promise<void>;
  clearError: () => void;
}


export const useScriptStore = create<ScriptStore>((set, get) => ({
  currentScript: null,
  history: [],
  isLoading: false,
  regeneratingSceneNumber: null,
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

  regenerateScene: async (sceneNumber) => {
    const { currentScript } = get();
    if (!currentScript) return;

    set({ regeneratingSceneNumber: sceneNumber, error: null });
    try {
      const response = await fetch(
        `/api/scripts/${currentScript.id}/regenerate-scene`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sceneNumber }),
        }
      );
      if (!response.ok) throw new Error('Regeneration failed');

      const newDialogue = await response.json();

      // Swap only the affected scene's dialogue — leave everything else untouched
      set((state) => ({
        regeneratingSceneNumber: null,
        currentScript: state.currentScript
          ? {
              ...state.currentScript,
              scenes: state.currentScript.scenes.map((s) =>
                s.sceneNumber === sceneNumber
                  ? { ...s, dialogue: newDialogue }
                  : s
              ),
            }
          : null,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Regeneration failed', regeneratingSceneNumber: null });
    }
  },

  deleteScript: async (id) => {
    try {
      const response = await fetch(`/api/scripts/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete script');

      set((state) => ({
        // Remove from sidebar list
        history: state.history.filter((h) => h.id !== id),
        // Clear main view if the deleted script was being shown
        currentScript:
          state.currentScript?.id === id ? null : state.currentScript,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete script' });
    }
  },

  clearError: () => set({ error: null })
}));