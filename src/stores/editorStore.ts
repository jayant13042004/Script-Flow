import { create } from 'zustand';
import { countWords, countCharacters, estimateDuration } from '../lib/wordCount';

interface EditorState {
  scriptId: string | null;
  title: string;
  content: any; // TipTap JSON
  htmlContent: string;
  plainText: string;
  isDirty: boolean;
  lastSaved: string | null;
  wordCount: number;
  characterCount: number;
  estimatedDuration: number; // seconds
  selectedText: string;
  isFullscreen: boolean;
  activePanel: 'ai' | 'hooks' | 'analyzer' | 'planner' | 'structure' | 'repurpose' | null;
  showFindReplace: boolean;
  
  setScriptId: (id: string | null) => void;
  setTitle: (title: string) => void;
  setContent: (content: any, html: string, plainText: string) => void;
  setSelectedText: (text: string) => void;
  setIsDirty: (dirty: boolean) => void;
  setLastSaved: (date: string) => void;
  toggleFullscreen: () => void;
  setActivePanel: (panel: EditorState['activePanel']) => void;
  togglePanel: (panel: NonNullable<EditorState['activePanel']>) => void;
  toggleFindReplace: () => void;
  reset: () => void;
}

const initialState = {
  scriptId: null,
  title: 'Untitled Script',
  content: null,
  htmlContent: '',
  plainText: '',
  isDirty: false,
  lastSaved: null,
  wordCount: 0,
  characterCount: 0,
  estimatedDuration: 0,
  selectedText: '',
  isFullscreen: false,
  activePanel: null as EditorState['activePanel'],
  showFindReplace: false,
};

export const useEditorStore = create<EditorState>((set) => ({
  ...initialState,

  setScriptId: (id) => set({ scriptId: id }),
  
  setTitle: (title) => set({ title, isDirty: true }),
  
  setContent: (content, htmlContent, plainText) => {
    const wordCount = countWords(plainText);
    const characterCount = countCharacters(plainText);
    const duration = estimateDuration(wordCount);
    
    set({
      content,
      htmlContent,
      plainText,
      wordCount,
      characterCount,
      estimatedDuration: duration,
      isDirty: true
    });
  },
  
  setSelectedText: (text) => set({ selectedText: text }),
  
  setIsDirty: (dirty) => set({ isDirty: dirty }),
  
  setLastSaved: (date) => set({ lastSaved: date }),
  
  toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),
  
  setActivePanel: (panel) => set({ activePanel: panel }),
  
  togglePanel: (panel) => set((state) => ({ 
    activePanel: state.activePanel === panel ? null : panel 
  })),
  
  toggleFindReplace: () => set((state) => ({ showFindReplace: !state.showFindReplace })),
  
  reset: () => set({ ...initialState }),
}));
