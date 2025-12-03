import React from 'react';
import { Extension, Node, mergeAttributes, InputRule } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { FileText, MapPin, Type, User, MessageSquare, Parentheses, Scissors } from 'lucide-react';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import StarterKit from '@tiptap/starter-kit';
import './styles.css';

// --- 1. COMPONENT: SCENE HEADING (Number Right + Type/Time Left) ---
const SceneHeadingComponent = (props) => {
  const { sceneNumber } = props.node.attrs

  return (
    <NodeViewWrapper className="scene-heading-node" style={{ 
      direction: 'rtl', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      fontWeight: 'bold',
      marginBottom: '4px' // Small gap before location
    }}>
      {/* RIGHT SIDE: Scene Number */}
      <div className="scene-number" contentEditable={false} style={{ whiteSpace: 'nowrap' }}>
        المشهد {sceneNumber}
      </div>

      {/* LEFT SIDE: The Content (Type & Time, e.g., "داخلي / ليل") */}
      <NodeViewContent as="div" className="scene-heading-content" style={{ textAlign: 'left', position: 'end' }} />
    </NodeViewWrapper>
  )
}

const SceneHeading = Node.create({
  name: 'sceneHeading',
  group: 'block',
  content: 'text*', // This text is now ONLY the Type/Time (e.g. INT/DAY)

  addAttributes() {
    return {
      sceneNumber: {
        default: 1,
        parseHTML: element => element.getAttribute('data-scene-number'),
        renderHTML: attributes => ({
          'data-scene-number': attributes.sceneNumber,
          'dir': 'rtl'
        }),
      },
    }
  },

  parseHTML() { return [{ tag: 'scene-heading' }] },
  renderHTML({ HTMLAttributes }) { return ['scene-heading', mergeAttributes(HTMLAttributes, { dir: 'rtl' }), 0] },
  addNodeView() { return ReactNodeViewRenderer(SceneHeadingComponent) },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('scene-numbering'),
        appendTransaction: (transactions, oldState, newState) => {
          if (!transactions.some(tr => tr.docChanged)) return null
          const tr = newState.tr
          let modified = false
          let sceneCount = 1
          newState.doc.descendants((node, pos) => {
            if (node.type.name === 'sceneHeading') {
              if (node.attrs.sceneNumber !== sceneCount) {
                tr.setNodeMarkup(pos, undefined, { ...node.attrs, sceneNumber: sceneCount })
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

// --- 2. COMPONENT: SCENE LOCATION (Centered, Underneath) ---
const SceneLocation = Node.create({
  name: 'sceneLocation',
  group: 'block',
  content: 'inline*',
  
  parseHTML() { return [{ tag: 'div.scene-location' }] },
  
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 
      class: 'scene-location',
      dir: 'rtl',
      style: 'text-align: center; font-weight: bold; text-decoration: underline; margin-bottom: 12px;' 
    }), 0]
  },
});

// --- 3. OTHER COMPONENTS (Standard Arabic Formatting) ---

const Action = StarterKit.configure({
    paragraph: {
        HTMLAttributes: { class: 'action', dir: 'rtl', style: 'text-align: right;' },
    },
    heading: false 
})

const Character = Node.create({
  name: 'character',
  group: 'block',
  content: 'inline*',
  parseHTML() { return [{ tag: 'div.character' }] },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 
        class: 'character', dir: 'rtl', style: 'text-align: center; font-weight: bold; margin-top: 10px;'
    }), 0]
  },
});

const Dialogue = Node.create({
  name: 'dialogue',
  group: 'block',
  content: 'inline*',
  parseHTML() { return [{ tag: 'div.dialogue' }] },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 
        class: 'dialogue', dir: 'rtl', style: 'text-align: center;'
    }), 0]
  },
});

const Parenthetical = Node.create({
  name: 'parenthetical',
  group: 'block',
  content: 'inline*',
  parseHTML() { return [{ tag: 'div.parenthetical' }] },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 
        class: 'parenthetical', dir: 'rtl', style: 'text-align: center;'
    }), 0]
  },
});

const Transition = Node.create({
  name: 'transition',
  group: 'block',
  content: 'inline*',
  parseHTML() { return [{ tag: 'div.transition' }] },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 
        class: 'transition', dir: 'rtl', style: 'text-align: left; margin-top: 10px; margin-bottom: 10px;'
    }), 0]
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

// --- 4. EXTENSION BUNDLE ---

const ArabicScreenplayExtension = [ Action, SceneHeading, SceneLocation, Character, Dialogue, Parenthetical, Transition ]

// --- 5. EXPORT ---

export default {
 id: 'arabic_v2',
 name: 'Arabic Screenplay (Split)',
 extension: ArabicScreenplayExtension,
 elements: [
   // Note: Added Scene Location to the UI elements
   { label: 'Scene heading', node: 'sceneHeading', icon: <FileText size={14} />, shortcut: 'Cmd+1' },
   { label: 'Location',    node: 'sceneLocation',icon: <MapPin size={14} />,   shortcut: 'Cmd+Shift+1' },
   { label: 'Action',            node: 'paragraph',    icon: <Type size={14} />,         shortcut: 'Cmd+2' },
   { label: 'Character',          node: 'character',    icon: <User size={14} />,         shortcut: 'Cmd+3' },
   { label: 'Dialogue',            node: 'dialogue',     icon: <MessageSquare size={14} />,shortcut: 'Cmd+4' },
   { label: 'Parenthetical',        node: 'parenthetical',icon: <Parentheses size={14} />,  shortcut: 'Cmd+5' },
   { label: 'Transition',          node: 'transition',   icon: <Scissors size={14} />,     shortcut: 'Cmd+6' },
 ], 
 topLevelNodes: [
   'sceneHeading', 
   'sceneLocation', // Added here
   'paragraph', 
   'character', 
   'dialogue', 
   'parenthetical', 
   'transition'
 ],

 flow: {
   // LOGIC: Heading (Number/Time) -> Enter -> Location -> Enter -> Action
   'sceneHeading': { enter: 'sceneLocation', tab: 'paragraph' }, 
   'sceneLocation': { enter: 'paragraph', tab: 'paragraph' },
   'paragraph': { enter: 'paragraph', tab: 'character' },
   'character': { enter: 'dialogue', tab: 'transition' },
   'dialogue': { enter: 'character', tab: 'parenthetical' },
   'parenthetical': { enter: 'dialogue', tab: 'dialogue' },
   'transition': { enter: 'sceneHeading', tab: 'sceneHeading' },
 }, 

 shortcuts: {
   sceneHeading: 'Ctrl+1',
   sceneLocation: 'Ctrl+Shift+1', // Added shortcut for manual location insertion
   paragraph: 'Ctrl+2', 
   character: 'Ctrl+3',
   dialogue: 'Ctrl+4',
   parenthetical: 'Ctrl+5',
   transition: 'Ctrl+6'
 }
};