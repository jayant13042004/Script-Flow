import React, { useState } from 'react';
import { Upload, FileText, Check, AlertCircle } from 'lucide-react';
import { Modal, Button } from '../ui';
import { parseImportedFile } from '../../lib/exportImport';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (title: string, text: string) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    await processFile(selectedFile);
  };

  const processFile = async (selectedFile: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const parsed = await parseImportedFile(selectedFile);
      setFile(selectedFile);
      setPreviewTitle(parsed.title);
      setPreviewText(parsed.text);
    } catch (err: any) {
      setError('Could not parse file. Supported formats: .txt, .md, .doc');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      await processFile(droppedFile);
    }
  };

  const handleImportSubmit = () => {
    if (previewText.trim()) {
      onImport(previewTitle || 'Imported Script', previewText);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Script File" size="md">
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {!file ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-gray-50/50 transition-all cursor-pointer"
          >
            <Upload className="w-10 h-10 text-gray-400 mb-3" />
            <p className="text-sm font-semibold text-gray-900 mb-1">
              Drag & drop your script file here
            </p>
            <p className="text-xs text-gray-500 mb-4">Supports .txt, .md, and text documents</p>
            <label className="px-4 py-2 text-xs font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
              Browse File
              <input
                type="file"
                accept=".txt,.md,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-blue-900 truncate">{previewTitle}</p>
                <p className="text-xs text-blue-700">{file.name} ({Math.ceil(file.size / 1024)} KB)</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFile(null);
                  setPreviewText('');
                }}
              >
                Change
              </Button>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                Preview Text ({previewText.split(/\s+/).filter(Boolean).length} words)
              </label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-serif text-gray-700 max-h-48 overflow-y-auto whitespace-pre-wrap">
                {previewText}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleImportSubmit}
            disabled={!previewText.trim() || isLoading}
            isLoading={isLoading}
            icon={<Check className="w-4 h-4" />}
          >
            Import into Editor
          </Button>
        </div>
      </div>
    </Modal>
  );
};
