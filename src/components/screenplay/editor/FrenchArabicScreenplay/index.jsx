import React from 'react';
import { Extension, Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { FileText, MapPin, Type, User, MessageSquare, Parentheses, Scissors, Music } from 'lucide-react';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import StarterKit from '@tiptap/starter-kit';
// ✅ CORRECT NAMED IMPORTS for Tiptap Extensions
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
// Note: If you were using TableKit, the import would be similar: 
// import { TableKit } from '@tiptap/extension-table';
import './styles.css';

// ==========================================================
// 1. HELPER: Table Automation Logic
// ==========================================================
const insertAutoNode = (editor, nodeType) => {
  const { state } = editor;
  const { selection } = state;
  const { $from } = selection;

  const isVisual = nodeType === 'paragraph'; 
  const targetColIndex = isVisual ? 0 : 1; 

  let table = null;
  let row = null;
  let rowPos = -1;
  
  for (let d = $from.depth; d > 0; d--) {
    const node = $from.node(d);
    if (node.type.name === 'table') { table = node; }
    if (node.type.name === 'tableRow') { row = node; rowPos = $from.before(d); }
  }

  // 3. LOGIC: Insert into current row or create new?
  if (row) {
    const targetCell = row.child(targetColIndex);
    let pos = rowPos + 1; 
    for(let i=0; i<targetColIndex; i++) {
        pos += row.child(i).nodeSize;
    }
    pos += 1; // Enter the cell

    const isTaken = targetCell.content.size > 0 && targetCell.textContent.trim().length > 0;

    if (!isTaken) {
      editor.chain().focus().setPosition(pos).setNode(nodeType).run();
      return true;
    }
  }

  // CREATE NEW TABLE OR ROW
  if (!table) {
    editor.chain().insertTable({ rows: 1, cols: 2, withHeaderRow: false }).run();
    if (!isVisual) {
       editor.chain().goToNextCell().setNode(nodeType).run();
    } else {
       editor.chain().setNode(nodeType).run();
    }
    return true;
  }

  editor.chain().addRowAfter().run();
  
  if (isVisual) {
      editor.chain().focus().setNode(nodeType).run();
  } else {
      editor.chain().focus().goToNextCell().setNode(nodeType).run(); 
  }

  return true;
};

// ==========================================================
// 2. CONTENT NODES
// ==========================================================

const SceneHeadingComponent = (props) => {
  const { sceneNumber } = props.node.attrs
  return (
    <NodeViewWrapper className="scene-heading-node">
      <div className="scene-number" contentEditable={false}>المشهد {sceneNumber}</div>
      <NodeViewContent as="div" className="scene-heading-content" />
    </NodeViewWrapper>
  )
}

const SceneHeading = Node.create({
  name: 'sceneHeading',
  group: 'block',
  content: 'text*',
  addAttributes() {
    return {
      sceneNumber: {
        default: 1,
        parseHTML: el => el.getAttribute('data-scene-number'),
        renderHTML: attrs => ({ 'data-scene-number': attrs.sceneNumber, 'dir': 'rtl' }),
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

// Standard Content Nodes
const Action = StarterKit.configure({
    paragraph: { HTMLAttributes: { class: 'action', dir: 'rtl' } },
    heading: false 
})

const Character = Node.create({
  name: 'character',
  group: 'block',
  content: 'inline*',
  parseHTML() { return [{ tag: 'div.character' }] },
  renderHTML({ HTMLAttributes }) { return ['div', mergeAttributes(HTMLAttributes, { class: 'character', dir: 'rtl' }), 0] },
});

const Dialogue = Node.create({
  name: 'dialogue',
  group: 'block',
  content: 'inline*',
  parseHTML() { return [{ tag: 'div.dialogue' }] },
  renderHTML({ HTMLAttributes }) { return ['div', mergeAttributes(HTMLAttributes, { class: 'dialogue', dir: 'rtl' }), 0] },
});

const Parenthetical = Node.create({
  name: 'parenthetical',
  group: 'block',
  content: 'inline*',
  parseHTML() { return [{ tag: 'div.parenthetical' }] },
  renderHTML({ HTMLAttributes }) { return ['div', mergeAttributes(HTMLAttributes, { class: 'parenthetical', dir: 'rtl' }), 0] },
});

const Sound = Node.create({
  name: 'sound',
  group: 'block',
  content: 'inline*',
  parseHTML() { return [{ tag: 'div.sound' }] },
  renderHTML({ HTMLAttributes }) { return ['div', mergeAttributes(HTMLAttributes, { class: 'sound', dir: 'rtl' }), 0] },
});

const SceneLocation = Node.create({
  name: 'sceneLocation',
  group: 'block',
  content: 'inline*',
  parseHTML() { return [{ tag: 'div.scene-location' }] },
  renderHTML({ HTMLAttributes }) { return ['div', mergeAttributes(HTMLAttributes, { class: 'scene-location', dir: 'rtl' }), 0] },
});

const Transition = Node.create({
  name: 'transition',
  group: 'block',
  content: 'inline*',
  parseHTML() { return [{ tag: 'div.transition' }] },
  renderHTML({ HTMLAttributes }) { return ['div', mergeAttributes(HTMLAttributes, { class: 'transition', dir: 'rtl' }), 0] },
});

// ==========================================================
// 3. EXPORT
// ==========================================================

export default {
 id: 'arabic_av_table',
 name: 'Arabic AV Table',
 extension: [ 
    Action, SceneHeading, SceneLocation, Transition, 
    
    // --- FIX: USE INDIVIDUAL EXTENSIONS INSTEAD OF TABLEKIT ---
    // Using individual extensions avoids the "missing node" error 
    // when you try to disable header in TableKit.
    Table.configure({ 
      resizable: true,
      HTMLAttributes: { class: 'av-script-table', dir: 'rtl' }
    }),
    TableRow,
    TableHeader, // MUST BE INCLUDED even if you don't use it
    TableCell.configure({
      HTMLAttributes: { class: 'av-script-cell' }
    }),

    Character, Dialogue, Parenthetical, Sound 
 ],
 elements: [
   { label: 'Scene Heading', node: 'sceneHeading', icon: <FileText size={14} />, shortcut: 'Cmd+1' },
   { label: 'Location',      node: 'sceneLocation',icon: <MapPin size={14} />,   shortcut: 'Cmd+Shift+1' },
   { label: 'Action',        node: 'paragraph',    icon: <Type size={14} />,     shortcut: 'Cmd+2' },
   { label: 'Character',     node: 'character',    icon: <User size={14} />,     shortcut: 'Cmd+3' },
   { label: 'Dialogue',      node: 'dialogue',     icon: <MessageSquare size={14} />,shortcut: 'Cmd+4' },
   { label: 'Parenthetical', node: 'parenthetical',icon: <Parentheses size={14} />,  shortcut: 'Cmd+5' },
   { label: 'Sound',         node: 'sound',        icon: <Music size={14} />,        shortcut: 'Cmd+7' },
   { label: 'Transition',    node: 'transition',   icon: <Scissors size={14} />,     shortcut: 'Cmd+6' },
 ], 
 topLevelNodes: [
   'sceneHeading', 
   'sceneLocation', 
   'table', 
   'transition'
 ],
 
 flow: {
   'sceneHeading': { enter: 'sceneLocation' }, 
   'sceneLocation': { enter: 'paragraph' }, 
 }, 
 
 shortcuts: {
   sceneHeading: 'Ctrl+1',
   sceneLocation: 'Ctrl+Shift+1', 
   transition: 'Ctrl+6',
   paragraph: (editor) => insertAutoNode(editor, 'paragraph'),
   character: (editor) => insertAutoNode(editor, 'character'),
   dialogue: (editor) => insertAutoNode(editor, 'dialogue'),
   parenthetical: (editor) => insertAutoNode(editor, 'parenthetical'),
   sound: (editor) => insertAutoNode(editor, 'sound'),
 }
};