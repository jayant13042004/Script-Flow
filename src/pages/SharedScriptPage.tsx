import React, { useEffect, useState } from 'react';
import { Download, Copy, AlertCircle, Clock, FileText, Check } from 'lucide-react';
// import { supabaseStorage } from '@/lib/supabaseStorage';

interface SharedScriptPageProps {
  token?: string;
}

export default function SharedScriptPage({ token }: SharedScriptPageProps) {
  const [script, setScript] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchScript = async () => {
      try {
        setLoading(true);
        // Mocking the fetch
        await new Promise(r => setTimeout(r, 1000));
        
        // Simulating data
        const data = {
          title: "The Future of AI in Filmmaking",
          content: "Fade in:\n\nINT. STUDIO - DAY\n\nA brilliant light shines down on the script...",
          wordCount: 1540,
          estimatedDuration: "6 mins"
        };
        
        if (data) setScript(data);
        else setError(true);
      } catch (e) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchScript();
  }, [token]);

  const handleCopyText = async () => {
    if (script?.content) {
      await navigator.clipboard.writeText(script.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportPDF = () => {
    alert("Exporting PDF...");
  };

  const handleExportTXT = () => {
    if (!script) return;
    const blob = new Blob([script.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${script.title || 'script'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Loading script...</p>
        </div>
      </div>
    );
  }

  if (error || !script) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Script not found</h1>
          <p className="text-gray-500 mb-6">
            The link may have expired, or the script is no longer public.
          </p>
          <a href="/" className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
            Return Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans selection:bg-indigo-100">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              S
            </div>
            <span className="font-semibold text-gray-900 hidden sm:block">ScriptFlow</span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={handleCopyText}
              className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            <button 
              onClick={handleExportTXT}
              className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">TXT</span>
            </button>
            <button 
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
            {script.title}
          </h1>
          <div className="flex items-center justify-center gap-6 text-gray-500 text-sm font-medium">
            <div className="flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              {script.wordCount} words
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              ~{script.estimatedDuration}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">
          <div className="prose prose-lg max-w-none prose-p:font-serif prose-p:leading-relaxed text-gray-800 whitespace-pre-wrap font-serif">
            {script.content}
          </div>
        </div>
      </main>

      <footer className="mt-12 py-8 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-500 flex items-center justify-center gap-2">
            Written with <span className="font-semibold text-gray-900">ScriptFlow</span> 
            <span className="mx-2 px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full">FREE</span>
          </p>
          <a href="/" className="inline-block mt-3 text-indigo-600 hover:text-indigo-700 font-medium hover:underline">
            Start writing your scripts today
          </a>
        </div>
      </footer>
    </div>
  );
}
