import React, { useState } from 'react';
import { Copy, Globe, X, Check } from 'lucide-react';

export interface Script {
  id: string;
  isPublic?: boolean;
  shareToken?: string;
  [key: string]: any;
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  script: Script;
  onUpdateScript: (updates: Partial<Script>) => void;
}

export function ShareModal({ isOpen, onClose, script, onUpdateScript }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const isPublic = script.isPublic || false;

  if (!isOpen) return null;

  const shareUrl = script.shareToken 
    ? `${window.location.origin}/share/${script.shareToken}`
    : '';

  const handleToggle = () => {
    if (!isPublic) {
      // Enable sharing
      const newToken = script.shareToken || Math.random().toString(36).substring(2, 15);
      onUpdateScript({ isPublic: true, shareToken: newToken });
    } else {
      // Disable sharing
      onUpdateScript({ isPublic: false });
    }
  };

  const copyToClipboard = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-gray-500" />
            Share Script
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Enable Public Link</h3>
              <p className="text-sm text-gray-500 mt-1">
                Anyone with the link can view this script
              </p>
            </div>
            <button 
              onClick={handleToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${isPublic ? 'bg-indigo-600' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {isPublic && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={shareUrl}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button 
                  onClick={copyToClipboard}
                  className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors flex items-center justify-center min-w-[40px]"
                  title="Copy link"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded-lg flex items-start gap-2">
                <Globe className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>Anyone with this link can view the script and export it as PDF/TXT. They cannot edit the script.</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
