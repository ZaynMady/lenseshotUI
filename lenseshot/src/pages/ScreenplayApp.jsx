import React, { useState, useEffect } from 'react';
import Toolbar from "../components/screenplay/utilities/toolbar";
import ShortcutModal from '../components/screenplay/utilities/ShortcutModal';
import ScreenplayEditor from "../components/screenplay/screenplayEditor";
import ComponentsBar from '../components/screenplay/utilities/componentsBar';
import MenuBar from '../components/screenplay/utilities/MenuBar';

// --- TEMPLATES ---
import templates from '../components/screenplay/editor/templates';
import AmericanScreenplay from '../components/screenplay/editor/AmericanScreenplay';

// --- MODALS & API ---
import CreateScreenplayModal from '../components/screenplay/utilities/Menu_bar_components/createScreenplayModal';
import OpenScreenplayModal from '../components/screenplay/utilities/Menu_bar_components/openScreenplayModal';
import ImportScreenplayModal from '../components/screenplay/utilities/Menu_bar_components/importScreenplayModal';
import ExportScreenplayModal from '../components/screenplay/utilities/Menu_bar_components/exportScreenplayModal'; // New Import
import { api } from '../api/client';

export default function ScreenplayApp() {
  const [template, setTemplate] = useState(AmericanScreenplay);
  
  // --- STATE ---
  const [currentFile, setCurrentFile] = useState(null); 
  const [editor, setEditor] = useState(null);
  
  // Stores content to load when the editor (re)mounts
  const [initialContent, setInitialContent] = useState(null);

  // Configuration
  const [shortcuts, setShortcuts] = useState(template.shortcuts);
  const [nodeFlows, setNodeFlows] = useState(template.flow);
  
  // UI State
  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false); 
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false); // New State
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [viewMode, setViewMode] = useState('document');
  const [showSceneNumbers, setShowSceneNumbers] = useState(true);

  // Update shortcuts/flows when template changes
  useEffect(() => {
      setShortcuts(template.shortcuts);
      setNodeFlows(template.flow);
  }, [template]);

  // --- HELPER: DOWNLOAD ---
  const downloadFile = (content, fileName, contentType) => {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // --- HANDLER: EXPORT ---
  const handleExport = (format, name) => {
      if (!editor) return;

      const baseName = name || 'screenplay';

      if (format === 'lss') {
          // Export as LSS (JSON with wrapper)
          const filePayload = {
              meta: { templateId: template.id, version: '1.0' },
              content: editor.getJSON()
          };
          downloadFile(JSON.stringify(filePayload, null, 2), `${baseName}.lss`, 'application/json');
      } 
      else if (format === 'docx') {
          // Export as HTML (saved as .doc for basic Word compatibility)
          // We wrap it in a minimal HTML envelope
          const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>${baseName}</title>
                <style>
                    body { font-family: 'Courier New', Courier, monospace; white-space: pre-wrap; }
                    .sceneHeading { font-weight: bold; text-transform: uppercase; margin-top: 2em; margin-bottom: 1em; }
                    .character { margin-top: 1em; text-align: center; font-weight: bold; text-transform: uppercase; }
                    .dialogue { text-align: center; margin-bottom: 1em; width: 70%; margin-left: auto; margin-right: auto; }
                    .parenthetical { text-align: center; font-style: italic; }
                    .transition { text-align: right; text-transform: uppercase; margin-top: 1em; margin-bottom: 1em; }
                </style>
            </head>
            <body>
                ${editor.getHTML()}
            </body>
            </html>
          `;
          downloadFile(htmlContent, `${baseName}.doc`, 'application/msword');
      } 
      else if (format === 'pdf') {
          // Use Browser Print for PDF
          window.print();
      }
  };

  // --- HANDLER: SAVE ---
  const handleSaveRequest = async () => {
    if (!editor) return;

    if (currentFile === null) {
      setIsCreateModalOpen(true);
    } else {
      try {
        const filePayload = {
            meta: { templateId: template.id, version: '1.0' },
            content: editor.getJSON()
        };
        await api.saveScreenplay(currentFile, filePayload);
        alert('Draft saved successfully!'); 
      } catch (error) {
        console.error("Save failed:", error);
        alert("Failed to save draft.");
      }
    }
  };

  // --- HANDLER: SAVE AS ---
  const handleSaveAs = () => {
    if (!editor) return;
    setIsCreateModalOpen(true);
  };

  // --- HANDLER: OPEN ---
  const handleOpenScreenplay = async (fileName) => {
      setIsOpenModalOpen(false);

      try {
          const response = await api.openScreenplay(fileName);
          const data = response.data;

          let contentToLoad = data;
          let templateToLoad = AmericanScreenplay; 

          if (data.meta && data.meta.templateId) {
              contentToLoad = data.content;
              const foundTemplate = templates.find(t => t.id === data.meta.templateId);
              if (foundTemplate) templateToLoad = foundTemplate;
          }

          setInitialContent(contentToLoad); 
          setTemplate(templateToLoad);
          setCurrentFile(fileName);
          
      } catch (error) {
          console.error("Failed to open screenplay", error);
          alert("Failed to open the file.");
      }
  };

  // --- HANDLER: IMPORT ---
  const handleImportScreenplay = (content, templateId, fileName) => {
      const foundTemplate = templates.find(t => t.id === templateId) || AmericanScreenplay;
      setInitialContent(content);
      setTemplate(foundTemplate);
      setCurrentFile(null); 
      alert(`Imported "${fileName}" successfully! Please save to cloud.`);
  };

  // --- HANDLER: NEW ---
  const handleNewScreenplay = () => {
    if (confirm("Are you sure? Unsaved changes will be lost.")) {
        setCurrentFile(null);
        setInitialContent({ type: 'doc', content: [] }); 
        editor?.commands.clearContent();
        editor?.commands.focus();
    }
  };

  const onScreenplayCreated = (newName) => {
      setCurrentFile(newName);
      setIsCreateModalOpen(false);
      alert(`Screenplay "${newName}" created successfully!`);
  };

  // --- SHORTCUTS ---
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    const handleGlobalKeyDown = (e) => {
      if (e.target.tagName.match(/INPUT|SELECT|TEXTAREA/)) return;

      const modifiers = [];
      if (e.ctrlKey) modifiers.push('Ctrl');
      if (e.metaKey) modifiers.push('Cmd');
      if (e.altKey) modifiers.push('Alt');
      if (e.shiftKey) modifiers.push('Shift');
      const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
      const combo = [...modifiers, key].join('+');

      for (const [action, shortcut] of Object.entries(shortcuts)) {
        if (shortcut === combo) {
          e.preventDefault();
          const nodeType = action === 'action' ? 'paragraph' : action;
          editor.chain().focus().setNode(nodeType).run();
          return;
        }
      }
      
      // Save & Save As
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault(); handleSaveRequest();
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault(); handleSaveAs();
      }
      // Open
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault(); setIsOpenModalOpen(true);
      }
      // Import
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'i') {
        e.preventDefault(); setIsImportModalOpen(true);
      }
      // Export (Cmd+E)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault(); setIsExportModalOpen(true);
      }
      // Focus Mode
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault(); setIsFocusMode(p => !p);
      }
      if (e.key === 'Escape' && isFocusMode) {
         e.preventDefault(); setIsFocusMode(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [editor, shortcuts, isFocusMode, currentFile, template]); 

  // --- EDITOR FLOW ---
  useEffect(() => {
      if (!editor || editor.isDestroyed) return;

      const handleEditorKeyDown = (view, event) => {
          if (event.key === 'Backspace') {
              const { $anchor, empty } = view.state.selection;
              if (empty && $anchor.parent.content.size === 0) {
                  const currentNodeName = $anchor.parent.type.name;
                  if (view.state.doc.childCount <= 1 && $anchor.parent.content.size === 0) return false; 
                  editor.chain().deleteNode(currentNodeName).focus().run();
                  return true;
              }
          }

          if (event.key === 'Enter' || event.key === 'Tab') {
              const { $from } = view.state.selection;
              const currentNodeName = $from.parent.type.name;
              const flow = nodeFlows[currentNodeName];
              
              if (flow) {
                  const targetNode = event.key === 'Enter' ? flow.enter : flow.tab;
                  if (targetNode) {
                      if (event.key === 'Tab') {
                        event.preventDefault();
                        editor.chain().focus().setNode(targetNode).run();
                        return true; 
                      }
                      if (event.key === 'Enter') {
                        event.preventDefault(); 
                        editor.commands.insertContent({ type: targetNode });
                        return true;
                    }
                  }
              }
          }
          return false;
      };
      
      editor.setOptions({ editorProps: { handleKeyDown: handleEditorKeyDown } });
      return () => {
          if (!editor.isDestroyed) {
              editor.setOptions({ editorProps: { handleKeyDown: undefined } });
          }
      };
  }, [editor, nodeFlows]); 


  return (
    <div className="flex flex-col h-full bg-red-50/30 overflow-hidden font-sans">

      {!isFocusMode && (
        <>
          <MenuBar 
            editor={editor} 
            fileName={currentFile || "Untitled Script (Unsaved)"} 
            viewMode={viewMode}
            setViewMode={setViewMode}
            showSceneNumbers={showSceneNumbers}
            toggleSceneNumbers={() => setShowSceneNumbers(!showSceneNumbers)}
            isFocusMode={isFocusMode}
            onToggleFocus={() => setIsFocusMode(!isFocusMode)}
            onTemplate={setTemplate}
            
            onSave={handleSaveRequest}
            onSaveAs={handleSaveAs}
            onNew={handleNewScreenplay}
            onOpen={() => setIsOpenModalOpen(true)}
            onImport={() => setIsImportModalOpen(true)} 
            onExport={() => setIsExportModalOpen(true)} // Wired up
          />
          <Toolbar editor={editor} onOpenShortcutModal={setIsShortcutModalOpen} />
          <ComponentsBar editor={editor} elements={template.elements} />
        </>
      )}

      <div className="flex-1 overflow-hidden relative flex flex-row">
          <div 
            className="flex-1 overflow-y-auto bg-stone-100 p-4 md:p-8 flex justify-center cursor-text" 
            onClick={() => editor?.chain().focus().run()}
          >
             <ScreenplayEditor 
                setEditorRef={setEditor} 
                template={template} 
                initialContent={initialContent} 
             />
          </div>
      </div>

      <ShortcutModal 
        isOpen={isShortcutModalOpen}
        onClose={() => setIsShortcutModalOpen(false)}
        shortcuts={shortcuts}
        flows={nodeFlows}
        onSaveShortcuts={setShortcuts}
        onSaveFlows={setNodeFlows}
        nodeOptions={template.elements}
      />

      <CreateScreenplayModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        editorContent={editor?.getJSON()} 
        templateId={template.id} 
        onSuccess={onScreenplayCreated}
      />

      <OpenScreenplayModal 
        isOpen={isOpenModalOpen}
        onClose={() => setIsOpenModalOpen(false)}
        onFileSelect={handleOpenScreenplay}
      />

      <ImportScreenplayModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportScreenplay}
      />

      {/* Export Modal */}
      <ExportScreenplayModal 
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        defaultName={currentFile}
      />

    </div>
  );
}