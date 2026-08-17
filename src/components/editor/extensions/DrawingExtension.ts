import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { DrawingNode } from './DrawingNode';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    drawing: {
      insertDrawing: () => ReturnType;
    };
  }
}

export const DrawingExtension = Node.create({
  name: 'drawing',

  group: 'block',

  atom: true,

  draggable: true,

  addAttributes() {
    return {
      dataUrl: {
        default: '',
        parseHTML: element => element.getAttribute('data-url') || '',
        renderHTML: attributes => {
          return {
            'data-url': attributes.dataUrl,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="drawing"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-type': 'drawing' }, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DrawingNode);
  },

  addCommands() {
    return {
      insertDrawing:
        () =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: this.name,
              attrs: { dataUrl: '' },
            })
            .run();
        },
    };
  },
});
