import { useEffect, useRef } from 'react';
import { useScriptStore } from '../stores/scriptStore';
import { useEditorStore } from '../stores/editorStore';

export function useAutosave() {
  const { updateScript, createVersion } = useScriptStore();
  const {
    scriptId,
    content,
    title,
    plainText,
    wordCount,
    characterCount,
    estimatedDuration,
    isDirty,
    setLastSaved,
    setIsDirty,
  } = useEditorStore();

  const saveCountRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isDirty || !scriptId) return;

    // Do not autosave empty, untouched scripts
    const isUntouched = (!title.trim() || title === 'Untitled Script') && !plainText?.trim();
    if (isUntouched) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      // Perform async save to Supabase (or localStorage fallback)
      await updateScript(scriptId, {
        title,
        content,
        plainText,
        wordCount,
        characterCount,
        estimatedDuration,
        updatedAt: new Date().toISOString(),
      });

      setLastSaved(new Date().toISOString());
      setIsDirty(false);

      // Every 5th save, create a version snapshot
      saveCountRef.current += 1;
      if (saveCountRef.current % 5 === 0) {
        await createVersion(scriptId);
      }
    }, 3000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    scriptId,
    content,
    title,
    plainText,
    wordCount,
    characterCount,
    estimatedDuration,
    isDirty,
    updateScript,
    setLastSaved,
    setIsDirty,
    createVersion,
  ]);
}
