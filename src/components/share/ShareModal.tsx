import React, { useState, useEffect } from 'react';
import { Copy, Globe, X, Check, ExternalLink, ShieldCheck } from 'lucide-react';

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
  const [isPublic, setIsPublic] = useState<boolean>(Boolean(script.isPublic));
  const [shareToken, setShareToken] = useState<string>(
    script.shareToken || Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 8)
  );

  useEffect(() => {
    if (isOpen) {
      setIsPublic(Boolean(script.isPublic));
      if (script.shareToken) {
        setShareToken(script.shareToken);
      } else {
        const generated = Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 8);
        setShareToken(generated);
      }
    }
  }, [isOpen, script.isPublic, script.shareToken]);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/share/${shareToken}`;

  const handleToggle = () => {
    const nextState = !isPublic;
    setIsPublic(nextState);

    if (nextState) {
      onUpdateScript({ isPublic: true, shareToken });
    } else {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-gray-100 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            Share Public Script Link
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Toggle Row */}
          <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Public Web Link</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {isPublic
                  ? 'Anyone with the unique URL can view this script.'
                  : 'Link is disabled. Only you can view this script.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggle}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                isPublic ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={isPublic}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isPublic ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Active Share Link Section */}
          {isPublic && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Shareable Secret Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-xl bg-gray-50 text-gray-700 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 select-all"
                  />
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* View Public Page Link */}
              <div className="flex items-center justify-between pt-1">
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  <span>Preview public reading page</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Viewers can read your script, calculate word count, and export to PDF/TXT. They cannot make edits to your original script.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3.5 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium text-xs transition-colors shadow-2xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
