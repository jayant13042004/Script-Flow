import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import TextAlign from '@tiptap/extension-text-align';
import { useEditorStore } from '../../stores/editorStore';
import { markdownToHtml, isMarkdownText } from '../../lib/markdown';
import { EditorToolbar } from './EditorToolbar';
import { EditorStats } from './EditorStats';
import { FindReplace } from './FindReplace';

interface ScriptEditorProps {
  initialContent?: any;
  onUpdate?: (content: any, html: string, plainText: string) => void;
}

export function ScriptEditor({ initialContent, onUpdate }: ScriptEditorProps) {
  const { 
    setContent, 
    setSelectedText, 
    showFindReplace, 
    toggleFindReplace,
    wordCount,
    characterCount,
    estimatedDuration,
    lastSaved,
    isDirty
  } = useEditorStore();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight.configure({ multicolor: false }),
      Placeholder.configure({ placeholder: 'Start writing your script...' }),
      CharacterCount,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: initialContent || '',
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      const html = editor.getHTML();
      const plainText = editor.getText();
      
      setContent(json, html, plainText);
      if (onUpdate) {
        onUpdate(json, html, plainText);
      }
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      if (from !== to) {
        setSelectedText(editor.state.doc.textBetween(from, to, ' '));
      } else {
        setSelectedText('');
      }
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor prose prose-stone lg:prose-lg mx-auto focus:outline-none min-h-[500px] font-serif',
      },
      handlePaste: (_view, event) => {
        const text = event.clipboardData?.getData('text/plain');
        if (text && isMarkdownText(text)) {
          const html = markdownToHtml(text);
          if (editor) {
            editor.commands.insertContent(html);
            return true;
          }
        }
        return false;
      },
    },
  });

  return (
    <div className="flex flex-col h-full bg-white relative">
      <EditorToolbar editor={editor} />
      
      <div className="flex-1 overflow-y-auto relative">
        <FindReplace 
          editor={editor} 
          isOpen={showFindReplace} 
          onClose={toggleFindReplace} 
        />
        
        <div className="max-w-[720px] mx-auto w-full px-8 py-12">
          <EditorContent editor={editor} />
        </div>
      </div>

      <EditorStats 
        wordCount={wordCount}
        characterCount={characterCount}
        estimatedDuration={estimatedDuration}
        lastSaved={lastSaved}
        isDirty={isDirty}
      />
    </div>
  );
}
