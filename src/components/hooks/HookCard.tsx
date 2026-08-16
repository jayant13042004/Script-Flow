import React from 'react';
import { Hook } from '../../types';
import { Heart, Copy, Plus, Trash2 } from 'lucide-react';
import { Button, Badge } from '../ui';

interface HookCardProps {
  hook: Hook;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onCopy: () => void;
  onInsert: () => void;
  onDelete?: () => void;
}

export const HookCard: React.FC<HookCardProps> = ({
  hook,
  isFavorite,
  onToggleFavorite,
  onCopy,
  onInsert,
  onDelete,
}) => {
  return (
    <div className="flex flex-col p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white gap-3">
      <div className="flex justify-between items-start gap-2">
        <span className="text-sm font-semibold text-gray-900 leading-snug">
          {hook.text}
        </span>
        <Badge variant="default" className="shrink-0 text-xs capitalize">
          {hook.category.toLowerCase().replace('_', ' ')}
        </Badge>
      </div>
      
      {hook.example && (
        <p className="text-sm text-gray-500 italic mt-1 bg-gray-50 p-2 rounded">
          "{hook.example}"
        </p>
      )}

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`p-1.5 h-auto ${isFavorite ? 'text-rose-500' : 'text-gray-400'}`}
            onClick={onToggleFavorite}
          >
            <Heart size={16} className={isFavorite ? "fill-current" : ""} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-1.5 h-auto text-gray-400 hover:text-gray-700"
            onClick={onCopy}
            title="Copy to clipboard"
          >
            <Copy size={16} />
          </Button>
          {onDelete && hook.isCustom && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-1.5 h-auto text-gray-400 hover:text-red-500"
              onClick={onDelete}
              title="Delete custom hook"
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
        
        <Button size="sm" onClick={onInsert} className="gap-1 px-3">
          <Plus size={16} />
          Insert
        </Button>
      </div>
    </div>
  );
};
