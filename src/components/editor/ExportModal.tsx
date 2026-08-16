import React from 'react';
import { Download, FileText, Code, FileCode, Tv, Printer } from 'lucide-react';
import { Modal, Button } from '../ui';
import type { Script } from '../../types';
import {
  exportToPdf,
  exportToMarkdown,
  exportToWordHtml,
  exportToTxt,
  exportToTeleprompterTxt,
} from '../../lib/exportImport';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  script: Script;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, script }) => {
  const exportFormats = [
    {
      id: 'pdf',
      title: 'PDF Document',
      desc: 'Print-ready PDF with professional header & typography',
      icon: Printer,
      action: () => exportToPdf(script),
      color: 'text-red-600 bg-red-50 border-red-200',
    },
    {
      id: 'md',
      title: 'Markdown (.md)',
      desc: 'Clean GFM Markdown format for Notion or GitHub',
      icon: Code,
      action: () => exportToMarkdown(script),
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
    {
      id: 'word',
      title: 'Microsoft Word (.doc)',
      desc: 'Word-compatible document formatting',
      icon: FileCode,
      action: () => exportToWordHtml(script),
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      id: 'txt',
      title: 'Plain Text (.txt)',
      desc: 'Simple plain text without formatting',
      icon: FileText,
      action: () => exportToTxt(script),
      color: 'text-gray-600 bg-gray-50 border-gray-200',
    },
    {
      id: 'teleprompter',
      title: 'Teleprompter Text (.txt)',
      desc: 'Formatted all-caps line script for teleprompter glass',
      icon: Tv,
      action: () => exportToTeleprompterTxt(script),
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Script" size="md">
      <div className="space-y-4">
        <p className="text-xs text-gray-500">Choose a format to export "{script.title}":</p>

        <div className="grid grid-cols-1 gap-3">
          {exportFormats.map((fmt) => (
            <button
              key={fmt.id}
              onClick={() => {
                fmt.action();
                onClose();
              }}
              className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-left group"
            >
              <div className={`p-2.5 rounded-lg border ${fmt.color}`}>
                <fmt.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 flex items-center justify-between">
                  <span>{fmt.title}</span>
                  <Download className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{fmt.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};
