import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Wand2, 
  Scissors, 
  MessageSquare, 
  HelpCircle, 
  ArrowUpRight, 
  Smile, 
  Briefcase, 
  Languages, 
  RefreshCw, 
  Send
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Spinner } from '../ui/Spinner';
import { AiSuggestion } from './AiSuggestion';
import { getAiService } from '../../services/ai';
import { AI_ACTIONS } from '../../lib/constants';
import { useEditorStore } from '../../stores/editorStore';

interface AiPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onReplace?: (text: string) => void;
  onInsert?: (text: string) => void;
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  improve: <Sparkles className="w-4 h-4" />,
  shorten: <Scissors className="w-4 h-4" />,
  clarify: <Wand2 className="w-4 h-4" />,
  make_conversational: <MessageSquare className="w-4 h-4" />,
  improve_hook: <ArrowUpRight className="w-4 h-4" />,
  increase_curiosity: <HelpCircle className="w-4 h-4" />,
  improve_retention: <Sparkles className="w-4 h-4" />,
  add_storytelling: <MessageSquare className="w-4 h-4" />,
  add_examples: <Briefcase className="w-4 h-4" />,
  add_emotion: <Smile className="w-4 h-4" />,
  add_cta: <ArrowUpRight className="w-4 h-4" />,
  fix_grammar: <Wand2 className="w-4 h-4" />,
  change_tone: <Smile className="w-4 h-4" />,
  translate: <Languages className="w-4 h-4" />,
  generate_alternatives: <RefreshCw className="w-4 h-4" />
};

export const AiPanel: React.FC<AiPanelProps> = ({ isOpen, onClose, onReplace, onInsert }) => {
  const { selectedText, plainText } = useEditorStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [askInput, setAskInput] = useState('');

  if (!isOpen) return null;

  const handleAction = async (actionId: string, customInstruction?: string) => {
    if (!selectedText) return;
    
    setIsLoading(true);
    setActiveAction(actionId);
    setSuggestion(null);
    
    try {
      const response = await getAiService().improveText({
        selectedText,
        instruction: customInstruction || actionId,
        fullScriptContext: plainText
      });
      setSuggestion(response.result);
    } catch (error) {
      console.error('Failed to get AI suggestion', error);
      // Handle error appropriately
    } finally {
      setIsLoading(false);
      setActiveAction(null);
    }
  };

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!askInput.trim()) return;
    handleAction('ask', askInput);
    setAskInput('');
  };

  const handleReject = () => {
    setSuggestion(null);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="w-80 border-l border-gray-200 bg-white h-full flex flex-col overflow-hidden shadow-xl">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h2 className="font-semibold text-gray-800">AI Assistant</h2>
        </div>
        <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!selectedText ? (
          <div className="text-center text-gray-500 mt-10">
            <Sparkles className="w-8 h-8 mx-auto mb-3 text-gray-400" />
            <p className="text-sm">Select text in your script to use AI actions</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-50 p-3 rounded-md border border-gray-200 text-sm italic text-gray-600 line-clamp-4 relative">
               "{selectedText}"
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-3">
                <Spinner size="lg" />
                <p className="text-sm text-gray-500">AI is thinking...</p>
              </div>
            ) : suggestion ? (
              <AiSuggestion 
                originalText={selectedText}
                suggestion={suggestion}
                onReplace={() => {
                  onReplace?.(suggestion);
                  setSuggestion(null);
                }}
                onInsert={() => {
                  onInsert?.(suggestion);
                  setSuggestion(null);
                }}
                onCopy={() => handleCopy(suggestion)}
                onReject={handleReject}
              />
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {AI_ACTIONS.map(action => (
                    <button
                      key={action.value}
                      onClick={() => handleAction(action.value)}
                      className="flex items-center gap-2 text-left px-3 py-2 text-xs rounded-md border border-gray-200 bg-white hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors"
                    >
                      {ACTION_ICONS[action.value] || <Sparkles className="w-4 h-4" />}
                      <span className="truncate">{action.label}</span>
                    </button>
                  ))}
                </div>

                <form onSubmit={handleAsk} className="pt-4 border-t border-gray-100">
                  <div className="relative">
                    <Input
                      value={askInput}
                      onChange={(e) => setAskInput(e.target.value)}
                      placeholder="Ask AI about this script..."
                      className="pr-10 text-sm"
                    />
                    <button
                      type="submit"
                      disabled={!askInput.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 disabled:opacity-50 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
