import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Document from '@tiptap/extension-document';
import { Pages } from '@tiptap-pro/extension-pages'; // Assuming you have pro
import { useEffect } from 'react';

export default function ScreenplayEditor({ setEditorRef, template }) {

  // 1. Initialize Editor with Template Logic
  const editor = useEditor({


    extensions: [
      
      ...template.extension,

      // D. Page Layout (Pro)
      Pages.configure({
        types: template.elements.map(el => el.node), // Dynamically get valid nodes
        pageFormat: 'A4', 
      })
    ],
    content: "", 
    editorProps: {
      attributes: {
        // Add the Template ID as a class for CSS scoping (e.g., .tpl-american)
        class: 'focus:outline-none h-full outline-none prose max-w-none' 
      },
    },
  }, [template.id]); // <--- CRITICAL: Re-create editor when template ID changes

  // 2. Sync Editor to Parent
  useEffect(() => {
     if (editor && !editor.isDestroyed) {
         setEditorRef(editor);
     }
     return () => setEditorRef(null);
  }, [editor, setEditorRef]);

  if (!editor) {
    return <div className="p-8 text-gray-400 animate-pulse">Loading Script Engine...</div>
  }

  return <EditorContent editor={editor} />;
}