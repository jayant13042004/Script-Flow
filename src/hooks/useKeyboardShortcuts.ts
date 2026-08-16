import { useEffect } from 'react';
import { useEditorStore } from '../stores/editorStore';

export function useKeyboardShortcuts() {
  const { toggleFindReplace, toggleFullscreen, setActivePanel, isFullscreen, showFindReplace, isDirty } = useEditorStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S / Cmd+S: Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        // The save is handled by autosave when isDirty is true,
        // but if we want to force an immediate save, we would trigger it here.
        // For now, we just prevent default browser save behavior.
      }

      // Ctrl+F / Cmd+F: Toggle find/replace
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'f') {
        e.preventDefault();
        toggleFindReplace();
      }

      // Ctrl+Shift+F / Cmd+Shift+F: Toggle fullscreen
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleFullscreen();
      }

      // Escape: Exit fullscreen or close panels
      if (e.key === 'Escape') {
        if (isFullscreen) {
          toggleFullscreen();
        }
        if (showFindReplace) {
          toggleFindReplace();
        }
        setActivePanel(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFindReplace, toggleFullscreen, setActivePanel, isFullscreen, showFindReplace, isDirty]);
}
