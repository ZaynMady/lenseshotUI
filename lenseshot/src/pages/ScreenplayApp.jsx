import React, { useState, useEffect } from 'react';
import Toolbar from "../components/screenplay/utilities/toolbar";
import ShortcutModal from '../components/screenplay/utilities/ShortcutModal';
import ScreenplayEditor from "../components/screenplay/screenplayEditor";
import ComponentsBar from '../components/screenplay/utilities/componentsBar';
import MenuBar from '../components/screenplay/utilities/MenuBar';
import AmericanScreenplay from '../components/screenplay/editor/AmericanScreenplay';
// --- NEW IMPORTS ---
import CreateScreenplayModal from '../components/screenplay/utilities/Menu_bar_components/createScreenplayModal';
import { api } from '../api/client';

export default function ScreenplayApp() {
  const [template, setTemplate] = useState(AmericanScreenplay)
  
  // --- STATE: TRACKING FILE STATUS ---
  // null = Initialized (New/Unsaved). String = Opened (Existing Name).
  const [currentFile, setCurrentFile] = useState(null); 

  // 1. Default Mappings for Key Combos
  const def_shortcuts = template.shortcuts;

  // 2. Default Mappings for Flow (Enter/Tab behavior)
  const def_flows = template.flow;

  const [editor, setEditor] = useState(null);
  const [shortcuts, setShortcuts] = useState(def_shortcuts);
  const [nodeFlows, setNodeFlows] = useState(def_flows);
  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // New Modal State
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [viewMode, setViewMode] = useState('document');
  const [showSceneNumbers, setShowSceneNumbers] = useState(true);

  // --- HANDLER: SAVE LOGIC ---
  const handleSaveRequest = async () => {
    if (!editor) return;

    if (currentFile === null) {
      // CASE 1: Initialized Screenplay -> Open Modal to Name & Create it
      setIsCreateModalOpen(true);
    } else {
      // CASE 2: Opened Screenplay -> Save directly to backend using existing name
      try {
        await api.saveScreenplay(currentFile, editor.getJSON());
        alert('Draft saved successfully!'); // Replace with toast if available
      } catch (error) {
        console.error("Save failed:", error);
        alert("Failed to save draft.");
      }
    }
  };

  // --- HANDLER: CREATE NEW (RESET) ---
  const handleNewScreenplay = () => {
    if (confirm("Are you sure? Unsaved changes will be lost.")) {
        setCurrentFile(null); // Reset to "Initialized" state
        editor?.commands.clearContent(); // Clear editor content
        editor?.commands.focus();
    }
  };

  // --- HANDLER: SUCCESSFUL CREATION ---
  // Called by the modal after api.createScreenplay succeeds
  const onScreenplayCreated = (newName) => {
      setCurrentFile(newName); // Switch state to "Opened"
      setIsCreateModalOpen(false);
      alert(`Screenplay "${newName}" created successfully!`);
  };

  // --- 1. GLOBAL SHORTCUTS HANDLER (Ctrl+Number + Save) ---
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
      
      // Check for Save Shortcut (Cmd+S / Ctrl+S)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveRequest();
        return;
      }

      // Check for Focus Mode (Cmd+Shift+F)
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
  }, [editor, shortcuts, isFocusMode, currentFile]); // Added currentFile dependency for save logic

  // --- 2. DYNAMIC EDITOR FLOW HANDLER (Enter/Tab/Backspace) ---
  useEffect(() => {
      if (!editor || editor.isDestroyed) return;

      const handleEditorKeyDown = (view, event) => {
          // A. BACKSPACE LOGIC
          if (event.key === 'Backspace') {
              const { selection } = view.state;
              const { $anchor, empty } = selection;
              
              if (empty && $anchor.parent.content.size === 0) {
                  const currentNodeName = $anchor.parent.type.name;

                  if (view.state.doc.childCount <= 1 && $anchor.parent.content.size === 0) {
                      return false; 
                  }

                  editor.chain()
                      .deleteNode(currentNodeName)
                      .focus()
                      .run();
                  
                  return true;
              }
          }

          // B. ENTER / TAB LOGIC
          if (event.key === 'Enter' || event.key === 'Tab') {
              const { $from } = view.state.selection;
              const currentNodeName = $from.parent.type.name;
              
              const flow = nodeFlows[currentNodeName];
              
              if (flow) {
                  const targetNode = event.key === 'Enter' ? flow.enter : flow.tab;
                  
                  if (targetNode) {
                      if (event.key === 'Tab') {
                        event.preventDefault()
                          editor.chain().focus().setNode(targetNode).run();
                          return true; 
                      }
                      
                      if (event.key === 'Enter') {
                        event.preventDefault(); 
                        editor.commands.insertContent({
                            type: targetNode,
                        });
                        return true;
                    }
                  }
              }
          }
          
          return false;
      };
      
      editor.setOptions({
          editorProps: {
              handleKeyDown: handleEditorKeyDown
          }
      });

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
            // Pass the current file name or a default placeholder
            fileName={currentFile || "Untitled Script (Unsaved)"} 
            viewMode={viewMode}
            setViewMode={setViewMode}
            showSceneNumbers={showSceneNumbers}
            toggleSceneNumbers={() => setShowSceneNumbers(!showSceneNumbers)}
            isFocusMode={isFocusMode}
            onToggleFocus={() => setIsFocusMode(!isFocusMode)}
            onTemplate={setTemplate}
            // Pass Handlers to MenuBar
            onSave={handleSaveRequest}
            onNew={handleNewScreenplay}
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

      {/* NEW: Create Screenplay Modal */}
      <CreateScreenplayModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        editorContent={editor?.getJSON()} // Pass current content
        onSuccess={onScreenplayCreated}
      />

    </div>
  );
}