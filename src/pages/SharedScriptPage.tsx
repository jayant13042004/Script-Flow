import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { Download, Copy, AlertCircle, Clock, FileText, Check, ArrowLeft, Printer } from 'lucide-react';
import { supabaseStorage } from '../services/supabase/storageService';
import { LocalStorageService } from '../services/storage/localStorage';
import { exportToPdf, exportToTxt } from '../lib/exportImport';
import type { Script } from '../types';

const localStorageService = new LocalStorageService();

export default function SharedScriptPage() {
  const { token } = useParams<{ token: string }>();
  const [script, setScript] = useState<Script | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchScript = async () => {
      if (!token) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // 1. Try Supabase first
        let fetched = await supabaseStorage.getScriptByShareToken(token);

        // 2. If not found or Supabase not configured, search local storage
        if (!fetched) {
          const localScripts = localStorageService.getScripts();
          fetched = localScripts.find((s: Script) => s.shareToken === token && s.isPublic) || null;
        }

        if (fetched) {
          setScript(fetched);
        } else {
          setError(true);
        }
      } catch (e) {
        console.error('Error loading shared script:', e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchScript();
  }, [token]);

  const handleCopyText = async () => {
    if (script?.plainText) {
      await navigator.clipboard.writeText(script.plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportPDF = () => {
    if (script) exportToPdf(script);
  };

  const handleExportTXT = () => {
    if (script) exportToTxt(script);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
          <p className="text-gray-500 font-medium text-sm">Loading shared script...</p>
        </div>
      </div>
    );
  }

  if (error || !script) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Script Not Found</h1>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            The link may have expired, or the author has turned off public sharing for this script.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-gray-900 text-white font-medium text-sm rounded-lg hover:bg-gray-800 transition-colors"
          >
            Go to ScriptFlow
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans selection:bg-blue-100">
      {/* Top Navigation */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-3 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-gray-900 font-bold text-lg">
              <span className="w-7 h-7 bg-gray-900 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                S
              </span>
              <span>ScriptFlow</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>
            <button
              onClick={handleExportTXT}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export TXT</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Script Reading Studio */}
      <main className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            {script.title || 'Untitled Script'}
          </h1>
          <div className="flex items-center justify-center gap-6 text-gray-500 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              {script.wordCount} words
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              ~{Math.ceil(script.estimatedDuration / 60)} min read
            </div>
            {script.platform && (
              <span className="px-2 py-0.5 bg-gray-100 rounded-md text-gray-700 capitalize">
                {script.platform}
              </span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-12">
          <div className="font-serif text-base sm:text-lg leading-relaxed text-gray-800 space-y-6">
            {(script.plainText || 'No content in this script.')
              .split('\n\n')
              .map((p, idx) => (
                <p key={idx} className="whitespace-pre-wrap">
                  {p}
                </p>
              ))}
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="mt-16 py-8 bg-white border-t border-gray-200 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-sm text-gray-600">
            Written with <span className="font-semibold text-gray-900">ScriptFlow</span> — The Studio for Content Creators
          </p>
          <Link
            to="/signup"
            className="inline-block mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700 underline"
          >
            Create your own scripts for free →
          </Link>
        </div>
      </footer>
    </div>
  );
}
