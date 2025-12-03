import React, { useState, useEffect } from 'react';
import Toolbar from "../components/screenplay/utilities/toolbar";
import ShortcutModal from '../components/screenplay/utilities/ShortcutModal';
import ScreenplayEditor from "../components/screenplay/screenplayEditor";
import ComponentsBar from '../components/screenplay/utilities/componentsBar';
import MenuBar from '../components/screenplay/utilities/MenuBar';
import AmericanScreenplay from '../components/screenplay/editor/AmericanScreenplay';



export default function ScreenplayApp() {
  const [template, setTemplate] = useState(AmericanScreenplay)
  // 1. Default Mappings for Key Combos
  const def_shortcuts = template.shortcuts;

  // 2. Default Mappings for Flow (Enter/Tab behavior)
  const def_flows = template.flow;

  const [editor, setEditor] = useState(null);
  const [shortcuts, setShortcuts] = useState(def_shortcuts);
  const [nodeFlows, setNodeFlows] = useState(def_flows);
  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [viewMode, setViewMode] = useState('document');
  const [showSceneNumbers, setShowSceneNumbers] = useState(true);


  // --- 1. GLOBAL SHORTCUTS HANDLER (Ctrl+Number) ---
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    const handleGlobalKeyDown = (e) => {
      // Ignore inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;

      // Construct key combo
      const modifiers = [];
      if (e.ctrlKey) modifiers.push('Ctrl');
      if (e.metaKey) modifiers.push('Cmd');
      if (e.altKey) modifiers.push('Alt');
      if (e.shiftKey) modifiers.push('Shift');
      const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
      const combo = [...modifiers, key].join('+');

      // Check specific mappings
      for (const [action, shortcut] of Object.entries(shortcuts)) {
        if (shortcut === combo) {
          e.preventDefault();
          // Map abstract 'action' to concrete 'paragraph'
          const nodeType = action === 'action' ? 'paragraph' : action;
          editor.chain().focus().setNode(nodeType).run();
          return;
        }
      }
      // Check for Cmd+Shift+F (Mac) or Ctrl+Shift+F (Windows)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsFocusMode((prev) => !prev);
      }
      
      // Optional: Allow ESC to exit Focus Mode
      if (e.key === 'Escape' && isFocusMode) {
         e.preventDefault();
         setIsFocusMode(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [editor, shortcuts, isFocusMode]);

  // --- 2. DYNAMIC EDITOR FLOW HANDLER (Enter/Tab/Backspace) ---
  useEffect(() => {
      if (!editor || editor.isDestroyed) return;

      // We attach a handler directly to the editor's DOM element for precise interception
      // Alternatively, we could use a Tiptap extension, but this is easier for React state access
      const handleEditorKeyDown = (view, event) => {
          
          // A. BACKSPACE LOGIC
          if (event.key === 'Backspace') {
              const { selection } = view.state;
              const { $anchor, empty } = selection;
              
              // Only trigger if selection is empty (caret) AND the node itself has no content
              if (empty && $anchor.parent.content.size === 0) {
                  const currentNodeName = $anchor.parent.type.name;

                  // Prevent deleting the first node if it's the only one, or handle gracefully
                  if (view.state.doc.childCount <= 1 && $anchor.parent.content.size === 0) {
                      // Optional: Reset to Scene Heading if it's the only node and empty? 
                      // For now, let default behavior handle the very first node.
                      return false; 
                  }

                  // Stop default join behavior (which sometimes merges weirdly)
                  // We want to delete the node entirely and focus the previous one
                  editor.chain()
                      .deleteNode(currentNodeName)
                      .focus() // Focuses the previous available position
                      .run();
                  
                  return true; // Return true means "event handled", prevent default
              }
          }

          // B. ENTER / TAB LOGIC
          if (event.key === 'Enter' || event.key === 'Tab') {
              const { $from } = view.state.selection;
              const currentNodeName = $from.parent.type.name;
              
              // Get configured behavior
              const flow = nodeFlows[currentNodeName];
              
              if (flow) {
                  const targetNode = event.key === 'Enter' ? flow.enter : flow.tab;
                  
                  if (targetNode) {
                      // TAB: Switch current node type (don't create new line)
                      if (event.key === 'Tab') {
                        event.preventDefault()
                          editor.chain().focus().setNode(targetNode).run();
                          return true; 
                      }
                      
                      // ENTER: Create new node below (Split Block)
                      // ... inside your handleEditorKeyDown function ...

// ENTER: Create new node below
// ENTER: Create new node below
if (event.key === 'Enter') {
    // 1. CRITICAL: Stop the browser from inserting a default paragraph
    event.preventDefault(); 

    // 2. Insert the specific screenplay element
    editor.commands.insertContent({
        type: targetNode,
        // (Optional) content: [] leaves it empty, which is fine
    });

    return true;
}
                  }
              }
          }
          
          return false; // Let Tiptap handle other keys
      };

      // Tiptap allows injecting a `handleKeyDown` prop via `setOptions` or `editor.options`
      // But purely reacting to events via the view prop is cleaner for dynamic updates.
      // However, to preventDefault effectively, we need to register this prop.
      // Since we can't easily inject props into an already running editor instance reactively 
      // without remounting, we'll use the Low-Level ProseMirror `handleKeyDown` prop via `editor.setOptions`.
      
      editor.setOptions({
          editorProps: {
              handleKeyDown: handleEditorKeyDown
          }
      });

      // Cleanup not strictly necessary as setOptions overwrites, but good practice
      return () => {
          if (!editor.isDestroyed) {
              editor.setOptions({ editorProps: { handleKeyDown: undefined } });
          }
      };
  }, [editor, nodeFlows]); 


  return (
    <div className="flex flex-col h-full bg-red-50/30 overflow-hidden font-sans">


{/* 2. Conditionally Render UI based on Focus Mode */}
      {!isFocusMode && (
        <>
          <MenuBar 
            editor={editor} 
            viewMode={viewMode}
            setViewMode={setViewMode}
            showSceneNumbers={showSceneNumbers}
            toggleSceneNumbers={() => setShowSceneNumbers(!showSceneNumbers)}
            // Pass the toggle function to the menu too if you want it in "Tools"
            isFocusMode={isFocusMode}
            onToggleFocus={() => setIsFocusMode(!isFocusMode)}
            onTemplate={setTemplate}
          />
          <Toolbar editor={editor} onOpenShortcutModal={setIsShortcutModalOpen} />
          <ComponentsBar editor={editor} elements={template.elements} />
        </>
      )}

      {/* 3. EDITABLE AREA */}
      <div className="flex-1 overflow-hidden relative flex flex-row">
          


          {/* Editor Canvas */}
          <div 
            className="flex-1 overflow-y-auto bg-stone-100 p-4 md:p-8 flex justify-center cursor-text" 
            onClick={() => editor?.chain().focus().run()}
          >
                  <ScreenplayEditor setEditorRef={setEditor} template={template} />
          </div>

      </div>

      {/* Shortcut Modal */}
      <ShortcutModal 
        isOpen={isShortcutModalOpen}
        onClose={() => setIsShortcutModalOpen(false)}
        shortcuts={shortcuts}
        flows={nodeFlows}
        onSaveShortcuts={setShortcuts}
        onSaveFlows={setNodeFlows}
        nodeOptions={template.elements}
      />

    </div>
  );
}