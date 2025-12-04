import { useEditor, EditorContent } from '@tiptap/react';
import { Pages } from '@tiptap-pro/extension-pages';
import { useEffect } from 'react';

export default function ScreenplayEditor({ setEditorRef, template, initialContent }) {

  // 1. Initialize Editor with Template Logic
  const editor = useEditor({
    extensions: [
      ...template.extension,
      // Page Layout Configuration
      Pages.configure({
        types: template.elements.map(el => el.node),
        pageFormat: 'A4', 
      })
    ],
    // 2. Load the content passed from parent (or default to empty)
    content: initialContent || "", 
    editorProps: {
      attributes: {
        // Scoped class for CSS (e.g., .tpl-american)
        class: `focus:outline-none h-full outline-none prose max-w-none tpl-${template.id}`
      },
    },
  }, [template.id]); // Re-create when template ID changes

  // 3. Sync Editor to Parent
  useEffect(() => {
     if (editor && !editor.isDestroyed) {
         setEditorRef(editor);
     }
     return () => setEditorRef(null);
  }, [editor, setEditorRef]);

  useEffect(() => {
    if (editor && initialContent && !editor.isDestroyed) {
      // When initialContent changes (e.g., opening a new file), 
      // we force the editor to swap its content.
      editor.commands.setContent(initialContent);
    }
  }, [initialContent, editor]);

  if (!editor) {
    return <div className="p-8 text-gray-400 animate-pulse">Loading Script Engine...</div>
  }

  return <EditorContent editor={editor} />;
}