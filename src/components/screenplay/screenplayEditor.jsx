import { useEditor, EditorContent } from '@tiptap/react';
import { Pages } from '@tiptap-pro/extension-pages';
import { useEffect, useMemo } from 'react';
import { getCommonExtensions } from './editor/commonExtension';

export default function ScreenplayEditor({ setEditorRef, template, initialContent }) {

  // 1. Calculate Extensions dynamically
  const extensions = useMemo(() => {
    // Get the list of node names from the template (e.g., 'character', 'dialogue')
    // so we can tell TextAlign to work on them.
    const templateNodeNames = template.elements 
      ? template.elements.map(el => el.node)
      : [];

    const common = getCommonExtensions(templateNodeNames);
    
    return [
      ...common,           // Load standard formatting tools
      ...template.extension, // Load template-specific nodes (SceneHeading, etc.)
      
      // Page Layout Configuration
      Pages.configure({
        types: template.elements.map(el => el.node),
        pageFormat: 'A4', 
        pageBreakBackground: 'transparent',
        pageGap: 0.5,
      })
    ];
  }, [template]); // Re-calculate if template changes

  // 2. Initialize Editor
  const editor = useEditor({
    extensions: extensions,
    content: initialContent || "", 
    editorProps: {
      attributes: {
        class: `focus:outline-none h-full outline-none prose max-w-none tpl-${template.id}`
      },
    },
  }, [template.id]); // Re-create editor instance if template ID changes

  // 3. Sync Editor to Parent
  useEffect(() => {
     if (editor && !editor.isDestroyed) {
         setEditorRef(editor);
     }
     return () => setEditorRef(null);
  }, [editor, setEditorRef]);

  useEffect(() => {
    if (editor && initialContent && !editor.isDestroyed) {
      editor.commands.setContent(initialContent);
    }
  }, [initialContent, editor]);

  if (!editor) {
    return <div className="p-8 text-gray-400 animate-pulse">Loading Script Engine...</div>
  }

  return <EditorContent editor={editor} />;
}