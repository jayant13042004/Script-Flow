import React from 'react';
import { formatDuration } from '../../lib/utils';
import { Check, CircleDashed } from 'lucide-react';

interface EditorStatsProps {
  wordCount: number;
  characterCount: number;
  estimatedDuration: number;
  lastSaved: string | null;
  isDirty: boolean;
}

export function EditorStats({ 
  wordCount, 
  characterCount, 
  estimatedDuration, 
  lastSaved, 
  isDirty 
}: EditorStatsProps) {
  return (
    <div className="sticky bottom-0 z-10 flex justify-between items-center px-4 py-2 bg-white/95 backdrop-blur-sm border-t border-gray-100 text-xs text-gray-400">
      <div className="flex items-center gap-2">
        <span>{wordCount} words</span>
        <span>&middot;</span>
        <span>{characterCount} characters</span>
        <span>&middot;</span>
        <span>~{formatDuration(estimatedDuration)} speaking time</span>
      </div>
      
      <div className="flex items-center gap-1.5">
        {isDirty ? (
          <>
            <CircleDashed className="w-3.5 h-3.5 animate-spin text-gray-400" />
            <span>Unsaved changes</span>
          </>
        ) : lastSaved ? (
          <>
            <Check className="w-3.5 h-3.5 text-green-500" />
            <span>Saved {lastSaved}</span>
          </>
        ) : (
          <span>Not saved yet</span>
        )}
      </div>
    </div>
  );
}
