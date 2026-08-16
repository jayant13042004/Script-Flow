import React from 'react';
import { Button } from '../ui/Button';
import { Check, Copy, ArrowDownToLine, X, ArrowDown } from 'lucide-react';

interface AiSuggestionProps {
  originalText: string;
  suggestion: string;
  onReplace: () => void;
  onInsert: () => void;
  onCopy: () => void;
  onReject: () => void;
}

export const AiSuggestion: React.FC<AiSuggestionProps> = ({
  originalText,
  suggestion,
  onReplace,
  onInsert,
  onCopy,
  onReject
}) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
        <p className="text-sm text-gray-500 line-through decoration-gray-300 decoration-1 italic line-clamp-3">
          {originalText}
        </p>
      </div>
      
      <div className="flex justify-center -my-4 relative z-10">
        <div className="bg-white rounded-full p-1 border border-gray-100 shadow-sm text-gray-400">
          <ArrowDown className="w-4 h-4" />
        </div>
      </div>

      <div className="bg-green-50/50 p-3 rounded-md border border-green-200">
        <p className="text-sm text-gray-800 font-medium">
          {suggestion}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        <Button onClick={onReplace} size="sm" className="flex-1 bg-indigo-600 hover:bg-indigo-700">
          <Check className="w-4 h-4 mr-1.5" />
          Replace
        </Button>
        <Button onClick={onInsert} size="sm" variant="secondary" className="flex-1">
          <ArrowDownToLine className="w-4 h-4 mr-1.5" />
          Insert Below
        </Button>
      </div>
      <div className="flex gap-2">
        <Button onClick={onCopy} size="sm" variant="ghost" className="flex-1 text-gray-600">
          <Copy className="w-4 h-4 mr-1.5" />
          Copy
        </Button>
        <Button onClick={onReject} size="sm" variant="ghost" className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50">
          <X className="w-4 h-4 mr-1.5" />
          Reject
        </Button>
      </div>
    </div>
  );
};
