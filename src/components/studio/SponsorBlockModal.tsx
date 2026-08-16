import React, { useState } from 'react';
import {
  DollarSign, Sparkles, Check, Copy, ArrowDownToLine,
  Building, Link as LinkIcon, List, AlertCircle, RefreshCw
} from 'lucide-react';
import { Modal, Button, Input, Textarea, Select } from '../ui';
import { getAiService } from '../../services/ai';
import type { SponsorBlockResponse } from '../../types/ai';

interface SponsorBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentScriptContext: string;
  onInsert: (sponsorText: string) => void;
}

export function SponsorBlockModal({
  isOpen,
  onClose,
  currentScriptContext,
  onInsert,
}: SponsorBlockModalProps) {
  const [brandName, setBrandName] = useState('');
  const [sponsorUrl, setSponsorUrl] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [talkingPoints, setTalkingPoints] = useState('');
  const [placement, setPlacement] = useState<'organic-bridge' | 'mid-roll' | 'problem-solution'>('organic-bridge');

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SponsorBlockResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const ai = getAiService();
      if (ai.generateSponsorBlock) {
        const res = await ai.generateSponsorBlock({
          brandName: brandName.trim(),
          sponsorUrl: sponsorUrl.trim(),
          promoCode: promoCode.trim(),
          talkingPoints: talkingPoints.trim(),
          placement,
          currentScriptContext,
        });
        setResult(res);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate sponsor read.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sponsorship & Ad-Read Segment Builder" size="lg">
      <div className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Sponsor / Brand Name"
              placeholder="e.g. Notion, NordVPN, Epidemic Sound"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              required
            />
            <Input
              label="Promo Link / URL"
              placeholder="e.g. brand.com/creator"
              value={sponsorUrl}
              onChange={(e) => setSponsorUrl(e.target.value)}
            />
            <Input
              label="Promo Code / Discount"
              placeholder="e.g. SCRIPTFLOW (20% off)"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
            />
          </div>

          <Textarea
            label="Key Talking Points & Requirements"
            placeholder="e.g. Mention cloud sync, 30-day money-back guarantee, and how it helped organize my channel."
            value={talkingPoints}
            onChange={(e) => setTalkingPoints(e.target.value)}
            rows={2}
          />

          <div className="flex items-center justify-between">
            <div className="w-64">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Transition Style
              </label>
              <select
                value={placement}
                onChange={(e) => setPlacement(e.target.value as any)}
                className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="organic-bridge">✨ Organic Content Bridge (Most Natural)</option>
                <option value="mid-roll">⏱️ Traditional Mid-Roll Segment</option>
                <option value="problem-solution">💡 Problem → Sponsor as Solution</option>
              </select>
            </div>

            <Button
              type="submit"
              disabled={!brandName.trim() || isLoading}
              isLoading={isLoading}
              icon={<Sparkles className="w-4 h-4" />}
            >
              Generate Smooth Ad-Read
            </Button>
          </div>
        </form>

        {/* Output Result Card */}
        {result && (
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" /> Generated 45-60s Sponsorship Block
              </span>

              <button
                type="button"
                onClick={() => handleCopy(result.fullSponsorBlock)}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-emerald-100 font-serif text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
              {result.fullSponsorBlock}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => {
                  onInsert(`\n\n[SPONSOR: ${brandName.toUpperCase()}]\n${result.fullSponsorBlock}\n\n`);
                  onClose();
                }}
                icon={<ArrowDownToLine className="w-4 h-4" />}
              >
                Insert into Script at Cursor
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
