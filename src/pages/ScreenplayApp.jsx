import React, { useState, useEffect } from 'react';
import Toolbar from "../components/screenplay/utilities/toolbar";
import ShortcutModal from '../components/screenplay/utilities/ShortcutModal';
import ScreenplayEditor from "../components/screenplay/screenplayEditor";
import ComponentsBar from '../components/screenplay/utilities/componentsBar';
import MenuBar from '../components/screenplay/utilities/MenuBar';
import html2pdf from 'html2pdf.js'; 

// --- TEMPLATES ---
import templates from '../components/screenplay/editor/templates';
import AmericanScreenplay from '../components/screenplay/editor/AmericanScreenplay';

// --- MODALS & API ---
import CreateScreenplayModal from '../components/screenplay/utilities/Menu_bar_components/createScreenplayModal';
import OpenScreenplayModal from '../components/screenplay/utilities/Menu_bar_components/openScreenplayModal';
import ImportScreenplayModal from '../components/screenplay/utilities/Menu_bar_components/importScreenplayModal';
import ExportScreenplayModal from '../components/screenplay/utilities/Menu_bar_components/exportScreenplayModal';
import TemplateModal from '../components/screenplay/utilities/Menu_bar_components/templateModal'; // New Import
import { api } from '../api/client';

export default function ScreenplayApp() {
  const [template, setTemplate] = useState(AmericanScreenplay);
  
  // --- STATE ---
  const [currentFile, setCurrentFile] = useState(null); 
  const [editor, setEditor] = useState(null);
  const [initialContent, setInitialContent] = useState(null);

  // Configuration
  const [shortcuts, setShortcuts] = useState(template.shortcuts);
  const [nodeFlows, setNodeFlows] = useState(template.flow);
  
  // UI State
  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false); 
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false); // New State
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [viewMode, setViewMode] = useState('document');
  const [showSceneNumbers, setShowSceneNumbers] = useState(true);

  // Pending State for Template Switch logic
  const [pendingTemplate, setPendingTemplate] = useState(null);

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
          const filePayload = {
              meta: { templateId: template.id, version: '1.0' },
              content: editor.getJSON()
          };
          downloadFile(JSON.stringify(filePayload, null, 2), `${baseName}.lss`, 'application/json');
      } 
      else if (format === 'docx') {
          const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>${baseName}</title>
            </head>
            <body>${editor.getHTML()}</body>
            </html>
          `;
          downloadFile(htmlContent, `${baseName}.doc`, 'application/msword');
      } 
      else if (format === 'pdf') {
          const originalElement = document.querySelector('.ProseMirror');
          if (!originalElement) return;

          const element = originalElement.cloneNode(true);
          element.style.width = '794px'; 
          element.style.maxWidth = '794px';
          element.style.height = 'auto'; 
          element.style.margin = '0';
          element.style.paddingTop = '0px'; 
          element.style.paddingBottom = '0px'; 
          element.style.background = 'white';
          element.style.overflow = 'visible';
          
          const container = document.createElement('div');
          container.style.position = 'absolute';
          container.style.left = '-9999px';
          container.style.top = '0';
          container.style.width = '794px'; 
          container.appendChild(element);
          document.body.appendChild(container);

          const opt = {
            margin: 0, 
            filename: `${baseName}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, letterRendering: true, scrollY: 0, windowWidth: 794 }, 
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
          };

          html2pdf().set(opt).from(element).save().finally(() => {
              document.body.removeChild(container);
          });
      }
  };

  // --- HANDLER: DELETE ---
  const handleDelete = async () => {
    if (!currentFile) return;
    if (confirm(`Are you sure you want to delete "${currentFile}"?\nThis action cannot be undone.`)) {
        try {
            await api.deleteScreenplay(currentFile);
            setCurrentFile(null);
            setInitialContent({ type: 'doc', content: [] });
            editor?.commands.clearContent();
            editor?.commands.focus();
            alert("Screenplay deleted successfully.");
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Failed to delete screenplay.");
        }
    }
  };

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

  const handleSaveAs = () => {
    if (!editor) return;
    setIsCreateModalOpen(true);
  };

  // --- HANDLER: TEMPLATE SWITCHING ---
  
  // 1. Core switch logic (Resets editor)
  const performTemplateSwitch = (newTemplate) => {
      setTemplate(newTemplate);
      setInitialContent({ type: 'doc', content: [] }); // Reset content
      setCurrentFile(null); // Reset file state (it's a new file now)
      setPendingTemplate(null);
      editor?.commands.clearContent();
      editor?.commands.focus();
      setIsTemplateModalOpen(false);
  };

  // 2. User selection handler
  const handleTemplateSelect = async (selectedTemplate) => {
      // Don't switch if it's the same template
      if (selectedTemplate.id === template.id) {
          setIsTemplateModalOpen(false);
          return;
      }

      // Ask to save
      if (confirm("Do you want to save your current script before switching templates?")) {
          
          if (currentFile) {
              // FILE EXISTS: Save immediately, then switch
              try {
                  const filePayload = {
                      meta: { templateId: template.id, version: '1.0' },
                      content: editor.getJSON()
                  };
                  await api.saveScreenplay(currentFile, filePayload);
                  alert('Saved! Switching template...');
                  performTemplateSwitch(selectedTemplate);
              } catch (e) {
                  alert("Save failed. Template switch cancelled.");
              }
          } else {
              // FILE IS NEW: Open Create Modal
              setPendingTemplate(selectedTemplate); // Queue the switch
              setIsTemplateModalOpen(false);
              setIsCreateModalOpen(true);
          }

      } else {
          // USER SAID NO: Switch immediately (Discard changes)
          performTemplateSwitch(selectedTemplate);
      }
  };

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

  const handleImportScreenplay = (content, templateId, fileName) => {
      const foundTemplate = templates.find(t => t.id === templateId) || AmericanScreenplay;
      setInitialContent(content);
      setTemplate(foundTemplate);
      setCurrentFile(null); 
      alert(`Imported "${fileName}" successfully! Please save to cloud.`);
  };

  const handleNewScreenplay = () => {
    if (confirm("Are you sure? Unsaved changes will be lost.")) {
        setCurrentFile(null);
        setInitialContent({ type: 'doc', content: [] }); 
        editor?.commands.clearContent();
        editor?.commands.focus();
    }
  };

  // Called when CreateScreenplayModal successfully saves a new file
  const onScreenplayCreated = (newName) => {
      setCurrentFile(newName);
      setIsCreateModalOpen(false);
      
      // If this save was triggered by a template switch, finish the switch now
      if (pendingTemplate) {
          alert(`Saved "${newName}". Switching template...`);
          performTemplateSwitch(pendingTemplate);
      } else {
          alert(`Screenplay "${newName}" created successfully!`);
      }
  };

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
      
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 's') { e.preventDefault(); handleSaveRequest(); }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 's') { e.preventDefault(); handleSaveAs(); }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'o') { e.preventDefault(); setIsOpenModalOpen(true); }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'i') { e.preventDefault(); setIsImportModalOpen(true); }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'e') { e.preventDefault(); setIsExportModalOpen(true); }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'f') { e.preventDefault(); setIsFocusMode(p => !p); }
      if (e.key === 'Escape' && isFocusMode) { e.preventDefault(); setIsFocusMode(false); }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [editor, shortcuts, isFocusMode, currentFile, template]); 

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
      return () => { if (!editor.isDestroyed) { editor.setOptions({ editorProps: { handleKeyDown: undefined } }); } };
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
            
            // --- UPDATED TEMPLATE PROP ---
            onOpenTemplates={() => setIsTemplateModalOpen(true)} // Opens the modal
            
            onSave={handleSaveRequest}
            onSaveAs={handleSaveAs}
            onNew={handleNewScreenplay}
            onOpen={() => setIsOpenModalOpen(true)}
            onImport={() => setIsImportModalOpen(true)} 
            onExport={() => setIsExportModalOpen(true)}
            onDelete={handleDelete}
          />
          <Toolbar editor={editor} onOpenShortcutModal={setIsShortcutModalOpen} />
          <ComponentsBar editor={editor} elements={template.elements} />
        </>
      )}

      <div className="flex-1 overflow-hidden relative flex flex-row">
          <div className="flex-1 overflow-y-auto bg-stone-100 p-4 md:p-8 flex justify-center cursor-text" onClick={() => editor?.chain().focus().run()}>
             <ScreenplayEditor setEditorRef={setEditor} template={template} initialContent={initialContent} />
          </div>
      </div>

      {/* --- MODALS --- */}
      
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        currentTemplateId={template.id}
        onSelect={handleTemplateSelect}
      />

      <ShortcutModal isOpen={isShortcutModalOpen} onClose={() => setIsShortcutModalOpen(false)} shortcuts={shortcuts} flows={nodeFlows} onSaveShortcuts={setShortcuts} onSaveFlows={setNodeFlows} nodeOptions={template.elements} />
      
      <CreateScreenplayModal 
        isOpen={isCreateModalOpen} 
        onClose={() => {
            setIsCreateModalOpen(false);
            setPendingTemplate(null); // Cancel pending switch if they close save dialog
        }}
        editorContent={editor?.getJSON()} 
        templateId={template.id} 
        onSuccess={onScreenplayCreated} 
      />
      
      <OpenScreenplayModal isOpen={isOpenModalOpen} onClose={() => setIsOpenModalOpen(false)} onFileSelect={handleOpenScreenplay} />
      <ImportScreenplayModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onImport={handleImportScreenplay} />
      <ExportScreenplayModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} onExport={handleExport} defaultName={currentFile} />
    </div>
  );
}