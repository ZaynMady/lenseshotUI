import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import {Underline} from '@tiptap/extension-underline';
import {FontFamily} from '@tiptap/extension-font-family';
import {TextAlign} from '@tiptap/extension-text-align';
import {StarterKit} from '@tiptap/starter-kit';

// We export a function so we can pass configuration if needed later
export const getCommonExtensions = (nodeTypes = []) => [
 

  // 2. Text Style & Formatting
  TextStyle.configure({
    types: ['heading', 'paragraph', ...nodeTypes],
  }),
  Underline.configure({
    types: ['heading', 'paragraph', ...nodeTypes],
  }),
  Color.configure({
    types: ['heading', 'paragraph', ...nodeTypes],
  }),
  Highlight.configure({
    multicolor: true,
    types: ['heading', 'paragraph', ...nodeTypes],
  }),
  FontFamily.configure({
    types: ['heading', 'paragraph', ...nodeTypes],
  }),

  // 3. Alignment
  // We configure this dynamically based on the template's nodes
  TextAlign.configure({
    types: ['heading', 'paragraph', ...nodeTypes],
  }),
];