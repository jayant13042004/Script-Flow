import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { X, Search as SearchIcon, ArrowUp, ArrowDown, Replace, ReplaceAll } from 'lucide-react';

interface FindReplaceProps {
  editor: Editor | null;
  isOpen: boolean;
  onClose: () => void;
}

export function FindReplace({ editor, isOpen, onClose }: FindReplaceProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [matches, setMatches] = useState<{ from: number; to: number }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!editor || !isOpen || !searchTerm.trim()) {
      setMatches([]);
      setCurrentIndex(-1);
      return;
    }

    const text = editor.getText();
    const newMatches: { from: number; to: number }[] = [];

    const lowerText = text.toLowerCase();
    const lowerSearch = searchTerm.toLowerCase();
    let index = lowerText.indexOf(lowerSearch, 0);

    while (index !== -1) {
      newMatches.push({ from: index, to: index + searchTerm.length });
      index = lowerText.indexOf(lowerSearch, index + 1);
    }

    setMatches(newMatches);
    if (newMatches.length > 0) {
      setCurrentIndex(0);
    } else {
      setCurrentIndex(-1);
    }
  }, [searchTerm, editor, isOpen]);

  const highlightMatch = (index: number) => {
    if (!editor || matches.length === 0 || index < 0 || index >= matches.length) return;
    const match = matches[index];
    // Set selection in TipTap editor (+1 for TipTap 1-indexed doc offset)
    try {
      editor.commands.setTextSelection({ from: match.from + 1, to: match.to + 1 });
      editor.commands.scrollIntoView();
    } catch (e) {
      // Fallback
    }
  };

  const handleNext = () => {
    if (matches.length === 0) return;
    const nextIndex = (currentIndex + 1) % matches.length;
    setCurrentIndex(nextIndex);
    highlightMatch(nextIndex);
  };

  const handlePrev = () => {
    if (matches.length === 0) return;
    const prevIndex = (currentIndex - 1 + matches.length) % matches.length;
    setCurrentIndex(prevIndex);
    highlightMatch(prevIndex);
  };

  const handleReplaceCurrent = () => {
    if (!editor || matches.length === 0 || currentIndex === -1) return;
    const match = matches[currentIndex];

    try {
      editor
        .chain()
        .focus()
        .setTextSelection({ from: match.from + 1, to: match.to + 1 })
        .insertContent(replaceTerm)
        .run();

      // Trigger search refresh
      setSearchTerm((s) => s);
    } catch (err) {
      console.warn('Replace error:', err);
    }
  };

  const handleReplaceAll = () => {
    if (!editor || !searchTerm.trim()) return;

    try {
      const fullText = editor.getHTML();
      const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const newHtml = fullText.replace(regex, replaceTerm);
      editor.commands.setContent(newHtml);
      setMatches([]);
      setCurrentIndex(-1);
    } catch (err) {
      console.warn('Replace all error:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        handlePrev();
      } else {
        handleNext();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="sticky top-[3.5rem] z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-md px-4 py-2.5 flex items-center justify-between gap-4 max-w-4xl mx-auto w-full rounded-b-xl animate-in slide-in-from-top-1 duration-150">
      <div className="flex flex-wrap items-center gap-3 flex-1">
        {/* Find Input */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <SearchIcon className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Find in script..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-8 pr-16 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
          <div className="absolute right-2.5 top-2 text-[11px] font-mono text-gray-400">
            {matches.length > 0 ? `${currentIndex + 1}/${matches.length}` : '0/0'}
          </div>
        </div>

        {/* Prev / Next Buttons */}
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200">
          <button
            type="button"
            onClick={handlePrev}
            disabled={matches.length === 0}
            className="p-1 hover:bg-white rounded text-gray-600 disabled:opacity-30 transition-colors"
            title="Previous Match (Shift+Enter)"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={matches.length === 0}
            className="p-1 hover:bg-white rounded text-gray-600 disabled:opacity-30 transition-colors"
            title="Next Match (Enter)"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Replace Input */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <input
            type="text"
            placeholder="Replace with..."
            value={replaceTerm}
            onChange={(e) => setReplaceTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        {/* Replace Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleReplaceCurrent}
            disabled={matches.length === 0 || currentIndex === -1}
            className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-lg font-medium disabled:opacity-40 transition-colors flex items-center gap-1"
          >
            <Replace className="w-3.5 h-3.5" />
            <span>Replace</span>
          </button>
          <button
            type="button"
            onClick={handleReplaceAll}
            disabled={matches.length === 0}
            className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-lg font-medium disabled:opacity-40 transition-colors flex items-center gap-1"
          >
            <ReplaceAll className="w-3.5 h-3.5" />
            <span>Replace All</span>
          </button>
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
