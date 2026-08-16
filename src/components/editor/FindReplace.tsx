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
  const [matches, setMatches] = useState<{from: number, to: number}[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!editor || !isOpen || !searchTerm) {
      setMatches([]);
      setCurrentIndex(-1);
      return;
    }

    // Naive text search implementation
    const text = editor.getText();
    const newMatches: {from: number, to: number}[] = [];
    
    if (searchTerm) {
      const lowerText = text.toLowerCase();
      const lowerSearch = searchTerm.toLowerCase();
      let index = lowerText.indexOf(lowerSearch, 0);
      
      while (index !== -1) {
        newMatches.push({ from: index, to: index + searchTerm.length });
        index = lowerText.indexOf(lowerSearch, index + 1);
      }
    }
    
    setMatches(newMatches);
    if (newMatches.length > 0) {
      setCurrentIndex(0);
    } else {
      setCurrentIndex(-1);
    }
    
  }, [searchTerm, editor, isOpen]);

  const handleNext = () => {
    if (matches.length === 0) return;
    const nextIndex = (currentIndex + 1) % matches.length;
    setCurrentIndex(nextIndex);
  };

  const handlePrev = () => {
    if (matches.length === 0) return;
    const prevIndex = (currentIndex - 1 + matches.length) % matches.length;
    setCurrentIndex(prevIndex);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
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
    <div className="absolute top-0 right-4 z-20 w-80 bg-white shadow-lg border border-gray-200 rounded-b-lg p-3 flex flex-col gap-3 animate-in slide-in-from-top-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-2.5 top-1.5 w-4 h-4 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Find"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-8 pr-16 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="absolute right-2 top-1.5 text-xs text-gray-400">
            {matches.length > 0 ? `${currentIndex + 1}/${matches.length}` : '0/0'}
          </div>
        </div>
        <div className="flex bg-gray-100 rounded">
          <button onClick={handlePrev} className="p-1 hover:bg-gray-200 rounded-l text-gray-600">
            <ArrowUp className="w-4 h-4" />
          </button>
          <button onClick={handleNext} className="p-1 hover:bg-gray-200 rounded-r text-gray-600 border-l border-gray-200">
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>
        <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Replace className="absolute left-2.5 top-1.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Replace with"
            value={replaceTerm}
            onChange={(e) => setReplaceTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-8 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-1">
          <button 
            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded font-medium disabled:opacity-50"
            disabled={matches.length === 0}
            title="Replace"
          >
            <Replace className="w-4 h-4" />
          </button>
          <button 
            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded font-medium disabled:opacity-50"
            disabled={matches.length === 0}
            title="Replace All"
          >
            <ReplaceAll className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
