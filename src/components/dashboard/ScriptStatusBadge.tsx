import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export type ScriptStatus = 'draft' | 'in-production' | 'filmed' | 'published';

interface ScriptStatusBadgeProps {
  status: ScriptStatus;
  onChange?: (newStatus: ScriptStatus) => void;
  readOnly?: boolean;
}

const statusConfig: Record<ScriptStatus, { label: string; color: string; dotColor: string }> = {
  'draft': { label: '📝 Draft', color: 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200', dotColor: 'bg-gray-400' },
  'in-production': { label: '🎬 In Production', color: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200', dotColor: 'bg-blue-500' },
  'filmed': { label: '🎥 Filmed', color: 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200', dotColor: 'bg-purple-500' },
  'published': { label: '🚀 Published', color: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200', dotColor: 'bg-emerald-500' },
};

export function ScriptStatusBadge({ status, onChange, readOnly = false }: ScriptStatusBadgeProps) {
  const [currentStatus, setCurrentStatus] = useState<ScriptStatus>(status || 'draft');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status) {
      setCurrentStatus(status);
    }
  }, [status]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const currentConfig = statusConfig[currentStatus] || statusConfig['draft'];

  const handleSelect = (newStatus: ScriptStatus) => {
    setCurrentStatus(newStatus);
    setIsOpen(false);
    if (onChange) {
      onChange(newStatus);
    }
  };

  const badgeClasses = `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${currentConfig.color} ${!readOnly && onChange ? 'cursor-pointer hover:shadow-xs' : 'cursor-default'}`;

  if (readOnly || !onChange) {
    return (
      <span className={badgeClasses}>
        {currentConfig.label}
      </span>
    );
  }

  return (
    <div className="relative inline-block z-50" ref={dropdownRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={badgeClasses}
      >
        {currentConfig.label}
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 ring-1 ring-black/5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 mb-1">
            Change Script Status
          </div>
          {(Object.entries(statusConfig) as [ScriptStatus, typeof statusConfig[ScriptStatus]][]).map(([key, config]) => (
            <button
              key={key}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(key as ScriptStatus);
              }}
              className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-gray-50 transition-colors ${
                currentStatus === key ? 'bg-blue-50/50 font-semibold' : ''
              }`}
            >
              <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
                <span className="text-gray-800">{config.label}</span>
              </span>
              {currentStatus === key && <Check className="w-3.5 h-3.5 text-blue-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
