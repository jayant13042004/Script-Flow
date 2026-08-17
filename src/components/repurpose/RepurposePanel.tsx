import React, { useState } from 'react';
import { 
  RefreshCw, 
  X, 
  Video, 
  Share2, 
  MessageSquare, 
  Send, 
  Mail, 
  Copy,
  Layers,
  Sparkles
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { getAiService } from '../../services/ai';
import { RepurposeFormat } from '../../types/script';

interface RepurposePanelProps {
  isOpen: boolean;
  onClose: () => void;
  scriptContent: string;
  scriptTitle: string;
}

const FORMAT_CONFIG: Record<RepurposeFormat, { icon: React.ReactNode; label: string; desc: string }> = {
  'youtube-short': { icon: <Video className="w-5 h-5 text-red-500" />, label: 'YouTube Short', desc: 'Vertical video script, <60s' },
  'instagram-reel': { icon: <Video className="w-5 h-5 text-pink-500" />, label: 'IG Reel', desc: 'Engaging vertical video' },
  'tiktok': { icon: <Video className="w-5 h-5 text-black" />, label: 'TikTok', desc: 'Fast-paced, trendy style' },
  'x-thread': { icon: <MessageSquare className="w-5 h-5 text-blue-400" />, label: 'X Thread', desc: 'Series of concise posts' },
  'linkedin-post': { icon: <Send className="w-5 h-5 text-blue-600" />, label: 'LinkedIn Post', desc: 'Professional insights' },
  'instagram-carousel': { icon: <Layers className="w-5 h-5 text-pink-500" />, label: 'IG Carousel', desc: 'Slide-by-slide text' },
  'short-teaser': { icon: <Sparkles className="w-5 h-5 text-purple-500" />, label: 'Short Teaser', desc: 'Curiosity builder' },
  'email-newsletter': { icon: <Mail className="w-5 h-5 text-green-500" />, label: 'Newsletter', desc: 'Long-form email copy' }
};

export const RepurposePanel: React.FC<RepurposePanelProps> = ({ isOpen, onClose, scriptContent, scriptTitle }) => {
  const [selectedFormat, setSelectedFormat] = useState<RepurposeFormat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!selectedFormat || !scriptContent) return;
    
    setIsLoading(true);
    try {
      const response = await getAiService().repurpose({
        scriptContent,
        targetFormat: selectedFormat,
        scriptTitle
      });
      setResult(response.result);
    } catch (error) {
      console.error('Failed to repurpose script', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
    }
  };

  return (
    <div className="w-full bg-gray-50 border-l border-gray-200 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2 font-semibold text-gray-800">
          <RefreshCw className="text-blue-600" size={20} />
          <h2>Repurpose Script</h2>
        </div>
        <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {!result && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Target Format
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {(Object.keys(FORMAT_CONFIG) as RepurposeFormat[]).map((format) => {
                const config = FORMAT_CONFIG[format];
                const isSelected = selectedFormat === format;
                return (
                  <button
                    key={format}
                    onClick={() => setSelectedFormat(format)}
                    className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="p-2 bg-gray-50 rounded-md shrink-0">
                      {config.icon}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{config.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{config.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Spinner size="lg" />
            <p className="text-sm text-gray-500 font-medium">Repurposing script content...</p>
          </div>
        )}

        {result && !isLoading && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">
                {selectedFormat ? FORMAT_CONFIG[selectedFormat]?.label : 'Result'}
              </span>
              <Button size="sm" variant="ghost" onClick={handleCopy} className="text-gray-600 gap-1.5">
                <Copy size={14} />
                Copy
              </Button>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 text-sm text-gray-800 font-sans whitespace-pre-wrap leading-relaxed">
              {result}
            </div>

            <Button 
              variant="secondary" 
              className="w-full" 
              onClick={() => setResult(null)}
            >
              Choose Different Format
            </Button>
          </div>
        )}
      </div>

      {!result && (
        <div className="p-4 border-t border-gray-200 bg-white shrink-0 shadow-xs">
          <Button 
            className="w-full" 
            disabled={!selectedFormat || !scriptContent.trim() || isLoading}
            onClick={handleGenerate}
          >
            Generate Content
          </Button>
        </div>
      )}
    </div>
  );
};
