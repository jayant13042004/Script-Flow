import React, { useState } from 'react';
import { BarChart3, X, CheckCircle2, AlertTriangle, AlertCircle, Info, RefreshCw } from 'lucide-react';
import { analyzeScript } from '../../lib/analyzer';
import { Button, EmptyState } from '../ui';

interface ScriptAnalyzerProps {
  isOpen: boolean;
  onClose: () => void;
  plainText: string;
}

export const ScriptAnalyzer: React.FC<ScriptAnalyzerProps> = ({
  isOpen,
  onClose,
  plainText,
}) => {
  const [results, setResults] = useState<ReturnType<typeof analyzeScript> | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!isOpen) return null;

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // Simulate slight delay for effect
    setTimeout(() => {
      setResults(analyzeScript(plainText));
      setIsAnalyzing(false);
    }, 600);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500 stroke-green-500';
    if (score >= 60) return 'text-blue-500 stroke-blue-500';
    if (score >= 40) return 'text-amber-500 stroke-amber-500';
    return 'text-red-500 stroke-red-500';
  };

  const getBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-gray-50 border-l border-gray-200 shadow-xl flex flex-col z-40 transform transition-transform duration-300">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2 font-semibold text-gray-800">
          <BarChart3 className="text-blue-500" size={20} />
          <h2>Script Analysis</h2>
        </div>
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        {!plainText.trim() ? (
          <EmptyState 
            icon={<Info size={40} />}
            title="No Content to Analyze"
            description="Write some script content first before running the analysis."
          />
        ) : !results ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <BarChart3 size={48} className="text-gray-300" />
            <p className="text-gray-500 text-sm text-center px-4">
              Analyze your script to get feedback on pacing, hooks, and retention elements.
            </p>
            <Button onClick={handleAnalyze} disabled={isAnalyzing} className="gap-2">
              {isAnalyzing ? <RefreshCw className="animate-spin" size={16} /> : <BarChart3 size={16} />}
              {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
            </Button>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-center mb-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Overall Score</h3>
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    className="text-gray-100 stroke-current"
                    strokeWidth="8"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                  ></circle>
                  <circle
                    className={`${getScoreColor(results.overallScore)} transition-all duration-1000 ease-out`}
                    strokeWidth="8"
                    strokeLinecap="round"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * results.overallScore) / 100}
                  ></circle>
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className={`text-3xl font-bold ${getScoreColor(results.overallScore).split(' ')[0]}`}>
                    {results.overallScore}
                  </span>
                  <span className="text-xs text-gray-400">/ 100</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {results.metrics.map((metric, i) => (
                <div key={i} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex flex-col gap-2">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-semibold text-gray-700 truncate pr-2" title={metric.name}>
                      {metric.name}
                    </span>
                    <span className="text-xs font-bold text-gray-900">{metric.score}</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getBarColor(metric.score)} rounded-full`}
                      style={{ width: `${metric.score}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 uppercase font-medium">{metric.label}</span>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Lightbulb size={16} className="text-amber-500" />
                Actionable Feedback
              </h3>
              <ul className="flex flex-col gap-2">
                {results.suggestions.map((suggestion, i) => (
                  <li key={i} className="bg-amber-50/50 p-3 rounded text-sm text-gray-700 border border-amber-100/50 flex gap-2 items-start">
                    <span className="text-amber-500 shrink-0 mt-0.5">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
            
            <Button variant="secondary" className="w-full gap-2" onClick={handleAnalyze}>
              <RefreshCw size={16} />
              Re-analyze Script
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Mock Lightbulb for analyzer since it wasn't imported directly
import { Lightbulb } from 'lucide-react';
