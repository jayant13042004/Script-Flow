import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { 
  Bold, Italic, Underline as UnderlineIcon, 
  Heading1, Heading2, Heading3, 
  List, ListOrdered, Highlighter, 
  AlignLeft, AlignCenter, Undo2, Redo2, Search,
  ChevronDown, Type, Check, X
} from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';

interface EditorToolbarProps {
  editor: Editor | null;
}

const HIGHLIGHT_COLORS = [
  { name: 'Yellow', color: '#fef08a', border: '#fde047', label: 'Yellow' },
  { name: 'Green', color: '#bbf7d0', border: '#86efac', label: 'Green' },
  { name: 'Blue', color: '#bfdbfe', border: '#93c5fd', label: 'Blue' },
  { name: 'Purple', color: '#e9d5ff', border: '#d8b4fe', label: 'Purple' },
  { name: 'Pink', color: '#fecdd3', border: '#fca5a5', label: 'Pink' },
  { name: 'Orange', color: '#fed7aa', border: '#fdba74', label: 'Orange' },
];

const FONT_SIZES = [
  { label: '12px', value: '12px', name: 'Small' },
  { label: '14px', value: '14px', name: 'Body Small' },
  { label: '16px', value: '16px', name: 'Normal' },
  { label: '18px', value: '18px', name: 'Medium' },
  { label: '20px', value: '20px', name: 'Large' },
  { label: '24px', value: '24px', name: 'Subheading' },
  { label: '28px', value: '28px', name: 'Heading' },
  { label: '32px', value: '32px', name: 'Title' },
];

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const showFindReplace = useEditorStore(state => state.showFindReplace);
  const toggleFindReplace = useEditorStore(state => state.toggleFindReplace);

  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showFontSizePicker, setShowFontSizePicker] = useState(false);
  const [selectedHighlightColor, setSelectedHighlightColor] = useState('#fef08a');

  const highlightRef = useRef<HTMLDivElement>(null);
  const fontSizeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (highlightRef.current && !highlightRef.current.contains(event.target as Node)) {
        setShowHighlightPicker(false);
      }
      if (fontSizeRef.current && !fontSizeRef.current.contains(event.target as Node)) {
        setShowFontSizePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ 
    onClick, 
    isActive, 
    disabled, 
    icon: Icon, 
    title 
  }: { 
    onClick: () => void, 
    isActive?: boolean, 
    disabled?: boolean, 
    icon: React.ElementType, 
    title: string 
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        p-1.5 rounded-md flex items-center justify-center transition-colors duration-150
        ${isActive ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  const Separator = () => (
    <div className="w-[1px] h-5 bg-gray-200 mx-1 self-center" />
  );

  const currentFontSize = editor.getAttributes('textStyle').fontSize || '16px';

  return (
    <div className="sticky top-0 z-20 flex flex-wrap items-center gap-0.5 p-1.5 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-2xs">
      {/* Font Size Dropdown */}
      <div className="relative inline-block" ref={fontSizeRef}>
        <button
          type="button"
          onClick={() => setShowFontSizePicker(!showFontSizePicker)}
          className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-colors"
          title="Font Size"
        >
          <Type className="w-3.5 h-3.5 text-gray-500" />
          <span>{currentFontSize}</span>
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </button>

        {showFontSizePicker && (
          <div className="absolute left-0 top-full mt-1.5 w-36 bg-white border border-gray-200 rounded-xl shadow-xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Font Size
            </div>
            {FONT_SIZES.map((size) => (
              <button
                key={size.value}
                type="button"
                onClick={() => {
                  (editor.chain().focus() as any).setFontSize(size.value);
                  setShowFontSizePicker(false);
                }}
                className={`w-full text-left px-2 py-1.5 text-xs rounded-lg flex items-center justify-between transition-colors ${
                  currentFontSize === size.value
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{size.name}</span>
                <span className="text-[10px] text-gray-400 font-mono">{size.label}</span>
              </button>
            ))}
            <div className="my-1 border-t border-gray-100" />
            <button
              type="button"
              onClick={() => {
                (editor.chain().focus() as any).unsetFontSize();
                setShowFontSizePicker(false);
              }}
              className="w-full text-left px-2 py-1 text-[11px] text-gray-500 hover:bg-gray-50 rounded-lg"
            >
              Reset to Default
            </button>
          </div>
        )}
      </div>

      <Separator />

      {/* Bold, Italic, Underline */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        icon={Bold}
        title="Bold (Ctrl+B)"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        icon={Italic}
        title="Italic (Ctrl+I)"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        icon={UnderlineIcon}
        title="Underline (Ctrl+U)"
      />
      
      {/* Multi-Color Highlighter Dropdown */}
      <div className="relative inline-flex items-center" ref={highlightRef}>
        <button
          type="button"
          onClick={() => {
            if (editor.isActive('highlight')) {
              editor.chain().focus().unsetHighlight().run();
            } else {
              editor.chain().focus().toggleHighlight({ color: selectedHighlightColor }).run();
            }
          }}
          className={`p-1.5 rounded-l-md flex items-center justify-center transition-colors ${
            editor.isActive('highlight') ? 'bg-amber-100 text-amber-900' : 'text-gray-600 hover:bg-gray-100'
          }`}
          title="Highlight Text"
        >
          <Highlighter className="w-4 h-4" />
          <span
            className="w-2 h-2 rounded-full ml-1 border border-black/10"
            style={{ backgroundColor: selectedHighlightColor }}
          />
        </button>

        <button
          type="button"
          onClick={() => setShowHighlightPicker(!showHighlightPicker)}
          className={`p-1 rounded-r-md flex items-center justify-center border-l border-gray-200 transition-colors ${
            editor.isActive('highlight') ? 'bg-amber-100 text-amber-900' : 'text-gray-600 hover:bg-gray-100'
          }`}
          title="Pick Highlight Color"
        >
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </button>

        {showHighlightPicker && (
          <div className="absolute left-0 top-full mt-1.5 w-44 bg-white border border-gray-200 rounded-xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-1 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Highlight Color
            </div>
            <div className="grid grid-cols-3 gap-1.5 mb-2">
              {HIGHLIGHT_COLORS.map((item) => (
                <button
                  key={item.color}
                  type="button"
                  onClick={() => {
                    setSelectedHighlightColor(item.color);
                    editor.chain().focus().toggleHighlight({ color: item.color }).run();
                    setShowHighlightPicker(false);
                  }}
                  className={`h-7 rounded-lg border flex items-center justify-center transition-transform hover:scale-105 ${
                    selectedHighlightColor === item.color ? 'ring-2 ring-blue-500 ring-offset-1 font-bold' : ''
                  }`}
                  style={{ backgroundColor: item.color, borderColor: item.border }}
                  title={item.name}
                >
                  {selectedHighlightColor === item.color && (
                    <Check className="w-3.5 h-3.5 text-gray-800" />
                  )}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                editor.chain().focus().unsetHighlight().run();
                setShowHighlightPicker(false);
              }}
              className="w-full text-left px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>Remove Highlight</span>
            </button>
          </div>
        )}
      </div>

      <Separator />
      
      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
        icon={Heading1}
        title="Heading 1"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        icon={Heading2}
        title="Heading 2"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
        icon={Heading3}
        title="Heading 3"
      />
      
      <Separator />
      
      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        icon={List}
        title="Bullet List"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        icon={ListOrdered}
        title="Ordered List"
      />
      
      <Separator />
      
      {/* Alignment */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        isActive={editor.isActive({ textAlign: 'left' })}
        icon={AlignLeft}
        title="Align Left"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        isActive={editor.isActive({ textAlign: 'center' })}
        icon={AlignCenter}
        title="Align Center"
      />
      
      <Separator />
      
      {/* Undo / Redo */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        icon={Undo2}
        title="Undo (Ctrl+Z)"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        icon={Redo2}
        title="Redo (Ctrl+Y)"
      />
      
      <Separator />

      {/* Find & Replace */}
      <ToolbarButton
        onClick={toggleFindReplace}
        isActive={showFindReplace}
        icon={Search}
        title="Find & Replace (Ctrl+F)"
      />
    </div>
  );
}
