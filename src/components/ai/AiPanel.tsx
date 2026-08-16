import React, { useState, useRef, useEffect } from 'react';
import {
  X, Sparkles, Send, Copy, Check, ArrowDownToLine,
  Replace, Bot, User, CornerDownLeft, FileText,
  Wand2, Scissors, Smile, Flame, Target, Lightbulb
} from 'lucide-react';
import { getAiService } from '../../services/ai';
import { useEditorStore } from '../../stores/editorStore';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  targetSelection?: string;
  timestamp: string;
}

interface AiPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onReplace?: (text: string) => void;
  onInsert?: (text: string) => void;
}

const QUICK_PROMPTS = [
  { label: 'Fix Grammar', icon: Wand2, prompt: 'Fix all grammar and punctuation errors while keeping my authentic voice.' },
  { label: 'Make Emotional', icon: Smile, prompt: 'Rewrite to make it more emotional, engaging, and personal.' },
  { label: 'Make Punchy', icon: Flame, prompt: 'Make this punchier and remove unnecessary filler words.' },
  { label: 'Add Strong CTA', icon: Target, prompt: 'Add a high-converting call to action that gets viewers to subscribe and comment.' },
  { label: 'Brainstorm Titles', icon: Lightbulb, prompt: 'Brainstorm 5 high-CTR, viral YouTube video titles based on this content.' },
  { label: 'Shorten', icon: Scissors, prompt: 'Shorten this significantly while keeping the core message intact.' },
];

export const AiPanel: React.FC<AiPanelProps> = ({
  isOpen,
  onClose,
  onReplace,
  onInsert,
}) => {
  const { selectedText, plainText, title } = useEditorStore();
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hey! I'm your AI Script Assistant. 🎬\n\n• Highlight any text in your editor to rewrite, fix grammar, or change tone.\n• Or ask me anything about your entire script — brainstorm titles, fix pacing, or write new sections!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSendMessage = async (promptToSend?: string) => {
    const prompt = (promptToSend || inputMessage).trim();
    if (!prompt || isLoading) return;

    const currentSelection = selectedText ? selectedText.trim() : '';

    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      sender: 'user',
      text: prompt,
      targetSelection: currentSelection || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const aiService = getAiService();
      let responseText = '';

      if (currentSelection) {
        // Selected text instruction
        const res = await aiService.improveText({
          selectedText: currentSelection,
          instruction: prompt,
          fullScriptContext: plainText,
        });
        responseText = res.result;
      } else {
        // Full script context query
        const res = await aiService.askAboutScript({
          question: prompt,
          scriptContext: `Title: ${title}\n\n${plainText || 'Empty script draft'}`,
        });
        responseText = res.result;
      }

      const assistantMessage: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        sender: 'assistant',
        text: responseText,
        targetSelection: currentSelection || undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        sender: 'assistant',
        text: `Sorry, I encountered an issue: ${err.message || 'Please try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleCopy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 leading-none">AI Assistant</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">Your video co-writer & strategist</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Context Pill Indicator */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-xs">
        {selectedText ? (
          <div className="flex items-center gap-1.5 text-indigo-700 font-medium truncate">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="truncate">Selected text active ({selectedText.length} chars)</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-gray-500 font-medium truncate">
            <FileText className="w-3.5 h-3.5" />
            <span>Full script context active</span>
          </div>
        )}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            {/* Sender header */}
            <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-gray-400">
              {msg.sender === 'user' ? (
                <>
                  <span>You</span>
                  <User className="w-3 h-3 text-gray-500" />
                </>
              ) : (
                <>
                  <Bot className="w-3 h-3 text-indigo-600" />
                  <span>AI Assistant</span>
                </>
              )}
            </div>

            {/* Target Selection Context Quote if present on user message */}
            {msg.sender === 'user' && msg.targetSelection && (
              <div className="max-w-[85%] mb-1 px-2.5 py-1 bg-gray-100 border border-gray-200 rounded-md text-[11px] text-gray-600 italic truncate">
                "{msg.targetSelection}"
              </div>
            )}

            {/* Message Bubble */}
            <div
              className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                msg.sender === 'user'
                  ? 'bg-gray-900 text-white rounded-tr-none'
                  : 'bg-gray-50 border border-gray-200 text-gray-800 rounded-tl-none font-serif'
              }`}
            >
              {msg.text}
            </div>

            {/* Assistant Action Buttons */}
            {msg.sender === 'assistant' && msg.id !== 'welcome' && (
              <div className="flex items-center gap-1 mt-1.5 px-1 flex-wrap">
                {onReplace && (
                  <button
                    onClick={() => onReplace(msg.text)}
                    className="flex items-center gap-1 px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md text-[11px] font-medium transition-colors"
                    title="Replace selected text in editor"
                  >
                    <Replace className="w-3 h-3" />
                    <span>Replace</span>
                  </button>
                )}

                {onInsert && (
                  <button
                    onClick={() => onInsert(msg.text)}
                    className="flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-[11px] font-medium transition-colors"
                    title="Insert at cursor position"
                  >
                    <ArrowDownToLine className="w-3 h-3" />
                    <span>Insert Below</span>
                  </button>
                )}

                <button
                  onClick={() => handleCopy(msg.id, msg.text)}
                  className="flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md text-[11px] font-medium transition-colors"
                  title="Copy to clipboard"
                >
                  {copiedId === msg.id ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl rounded-tl-none px-3.5 py-2.5 text-xs text-gray-500">
              <span className="inline-flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]" />
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-3 pt-2 pb-1 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {QUICK_PROMPTS.map((chip) => (
            <button
              key={chip.label}
              onClick={() => handleSendMessage(chip.prompt)}
              className="flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 text-gray-600 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors shadow-2xs"
            >
              <chip.icon className="w-3 h-3" />
              <span>{chip.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-white border-t border-gray-200"
      >
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              selectedText
                ? 'Instruct AI on selected text (e.g. "make it emotional")...'
                : 'Ask AI or type an instruction for this script...'
            }
            className="w-full pl-3 pr-10 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all placeholder:text-gray-400"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="absolute right-1.5 p-1.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-30 text-white rounded-lg transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
