import React from 'react';
import { Extension, Node, mergeAttributes, InputRule } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { FileText, Type, User, MessageSquare, Parentheses, Scissors } from 'lucide-react';
import { Plugin, PluginKey } from '@tiptap/pm/state'
import StarterKit from '@tiptap/starter-kit';
import './styles.css';

// --- 1. REACT COMPONENT FOR SCENE HEADING ---
// Fixed SceneHeadingComponent
const SceneHeadingComponent = (props) => {
  const { sceneNumber } = props.node.attrs

  return (
    <NodeViewWrapper className="scene-heading-node">
      {/* Left Margin Number */}
      <div className="scene-number left" contentEditable={false}>
        {sceneNumber}.
      </div>

      {/* The Editable Heading Text */}
      <NodeViewContent as="h3" className="scene-heading-content" />

      {/* Right Margin Number */}
      <div className="scene-number right" contentEditable={false}>
        {sceneNumber}.
      </div>
    </NodeViewWrapper>
  )
}


const SceneHeading =  Node.create({
  name: 'sceneHeading',

  group: 'block',

  content: 'text*',

  addAttributes() {
    return {
      sceneNumber: {
        default: 1,
        // Save to HTML so it persists
        parseHTML: element => element.getAttribute('data-scene-number'),
        renderHTML: attributes => {
          return {
            'data-scene-number': attributes.sceneNumber,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'scene-heading',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['scene-heading', mergeAttributes(HTMLAttributes), 0]
  },

  addNodeView() {
    return ReactNodeViewRenderer(SceneHeadingComponent)
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('scene-numbering'),
        appendTransaction: (transactions, oldState, newState) => {
          // Prevent running if no document changes occurred
          if (!transactions.some(tr => tr.docChanged)) {
            return null
          }

          const tr = newState.tr
          let modified = false
          let sceneCount = 1

          // Iterate over the document to find sceneHeadings
          newState.doc.descendants((node, pos) => {
            if (node.type.name === 'sceneHeading') {
              // If the number is incorrect, update it
              if (node.attrs.sceneNumber !== sceneCount) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  sceneNumber: sceneCount,
                })
                modified = true
              }
              sceneCount++
            }
          })

          return modified ? tr : null
        },
      }),
    ]
  },
})

const Action = StarterKit.configure({
    paragraph: {
        HTMLAttributes: {
            class: 'action', 
        },
        
    },
    heading: false 
})

const Character = Node.create({
  name: 'character',
  group: 'block',
  content: 'inline*',
  parseHTML() { return [{ tag: 'div.character' }] },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { class: 'character' }), 0]
  },
});

const Dialogue = Node.create({
  name: 'dialogue',
  group: 'block',
  content: 'inline*',
  parseHTML() { return [{ tag: 'div.dialogue' }] },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { class: 'dialogue' }), 0]
  },

});

const Parenthetical = Node.create({
  name: 'parenthetical',
  group: 'block',
  content: 'inline*',
  parseHTML() { return [{ tag: 'div.parenthetical' }] },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { class: 'parenthetical' }), 0]
  },

});

const Transition = Node.create({
  name: 'transition',
  group: 'block',
  content: 'inline*',
  parseHTML() { return [{ tag: 'div.transition' }] },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { class: 'transition' }), 0]
  },
  addInputRules() {
    return [ 
        new InputRule({
            find: /^>\s$/, 
            handler: ({ range, chain }) => chain().deleteRange(range).setNode('transition').run()
        }) 
    ]
  },
});

// --- 3. THE EXTENSION BUNDLE ---

const AmericanScreenplayExtension = [ Action, SceneHeading, Character, Dialogue, Parenthetical, Transition ]

// --- 4. EXPORT ---

// --- 4. EXPORT (FIXED) ---

export default {
 id: 'american',
 name: 'American Standard',
  extension: AmericanScreenplayExtension,
  elements: [
    { label: 'Scene Heading', node: 'sceneHeading', icon: <FileText size={14} />, shortcut: 'Cmd+1' },
    { label: 'Action',        node: 'paragraph',       icon: <Type size={14} />,     shortcut: 'Cmd+2' },
    { label: 'Character',     node: 'character',    icon: <User size={14} />,     shortcut: 'Cmd+3' },
    { label: 'Dialogue',      node: 'dialogue',     icon: <MessageSquare size={14} />, shortcut: 'Cmd+4' },
    { label: 'Parenthetical', node: 'parenthetical', icon: <Parentheses size={14} />, shortcut: 'Cmd+5' },
    { label: 'Transition',    node: 'transition',   icon: <Scissors size={14} />, shortcut: 'Cmd+6' },
  ], 
  topLevelNodes: [
    'sceneHeading', 
    'paragraph', 
    'character', 
    'dialogue', 
    'parenthetical', 
    'transition'
  ],

  flow: {
    // FIX: Changed 'action' keys/values to 'paragraph' for Tiptap's internal reference
    'sceneHeading': { enter: 'paragraph', tab: 'paragraph' }, 
    'paragraph': { enter: 'paragraph', tab: 'character' },
    'character': { enter: 'dialogue', tab: 'transition' },
    'dialogue': { enter: 'character', tab: 'parenthetical' },
    'parenthetical': { enter: 'dialogue', tab: 'dialogue' },
    'transition': { enter: 'sceneHeading', tab: 'sceneHeading' },
  }, 

  shortcuts: {
  sceneHeading: 'Ctrl+1',
    // FIX: Changed 'action' key to 'paragraph' for the keymap logic
  paragraph: 'Ctrl+2', 
  character: 'Ctrl+3',
  dialogue: 'Ctrl+4',
  parenthetical: 'Ctrl+5',
  transition: 'Ctrl+6'
  }
};