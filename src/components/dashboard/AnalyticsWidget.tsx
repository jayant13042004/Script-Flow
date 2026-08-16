import React, { useMemo } from 'react';
import { FileText, Type, Clock, CheckCircle2, TrendingUp, Calendar } from 'lucide-react';
import type { Script } from '../../types';

interface AnalyticsWidgetProps {
  scripts: Script[];
}

export function AnalyticsWidget({ scripts }: AnalyticsWidgetProps) {
  const stats = useMemo(() => {
    const totalScripts = scripts.length;
    const totalWords = scripts.reduce((acc, script) => acc + (script.wordCount || 0), 0);
    const totalDurationSeconds = scripts.reduce((acc, script) => acc + (script.estimatedDuration || 0), 0);
    const completedScripts = scripts.filter(s => s.status === 'published' || s.status === 'filmed').length;
    
    // Platform breakdown
    const platforms = scripts.reduce((acc, script) => {
      if (script.platform) {
        acc[script.platform] = (acc[script.platform] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Simple streak calculation (mocked for UI purposes)
    const streakDays = totalScripts > 0 ? 5 : 0; // In reality, calculate from createdAt dates

    return {
      totalScripts,
      totalWords,
      totalDurationHours: Math.floor(totalDurationSeconds / 3600),
      totalDurationMinutes: Math.floor((totalDurationSeconds % 3600) / 60),
      completedScripts,
      platforms,
      streakDays
    };
  }, [scripts]);

  const platformColors: Record<string, string> = {
    youtube: 'bg-red-100 text-red-700',
    shorts: 'bg-red-100 text-red-700',
    tiktok: 'bg-black text-white',
    linkedin: 'bg-blue-100 text-blue-800'
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          Creator Analytics
        </h2>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-sm font-medium">
          <Calendar className="w-4 h-4" />
          {stats.streakDays} Day Streak
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
        <div className="p-5 flex flex-col gap-1">
          <span className="text-gray-500 text-sm font-medium flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            Total Scripts
          </span>
          <span className="text-3xl font-bold text-gray-900">{stats.totalScripts}</span>
        </div>

        <div className="p-5 flex flex-col gap-1">
          <span className="text-gray-500 text-sm font-medium flex items-center gap-1.5">
            <Type className="w-4 h-4" />
            Words Written
          </span>
          <span className="text-3xl font-bold text-gray-900">{stats.totalWords.toLocaleString()}</span>
        </div>

        <div className="p-5 flex flex-col gap-1">
          <span className="text-gray-500 text-sm font-medium flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            Video Time
          </span>
          <span className="text-3xl font-bold text-gray-900">
            {stats.totalDurationHours}h {stats.totalDurationMinutes}m
          </span>
        </div>

        <div className="p-5 flex flex-col gap-1">
          <span className="text-gray-500 text-sm font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Completed
          </span>
          <span className="text-3xl font-bold text-gray-900">{stats.completedScripts}</span>
        </div>
      </div>

      {Object.keys(stats.platforms).length > 0 && (
        <div className="bg-gray-50 p-4 border-t border-gray-100 flex items-center gap-3 overflow-x-auto">
          <span className="text-sm text-gray-500 font-medium whitespace-nowrap">Platform Focus:</span>
          <div className="flex items-center gap-2">
            {Object.entries(stats.platforms).map(([platform, count]) => (
              <span 
                key={platform}
                className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider whitespace-nowrap ${platformColors[platform] || 'bg-gray-200 text-gray-700'}`}
              >
                {platform} ({count})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
