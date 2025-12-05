import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import ScreenplayEditor from './screenplayEditor';
import { useEditor } from '@tiptap/react';
import { Pages } from '@tiptap-pro/extension-pages';

// 1. Mock Tiptap React Hooks and Components
vi.mock('@tiptap/react', () => ({
  useEditor: vi.fn(),
  EditorContent: () => <div data-testid="editor-content">Editor Content Rendered</div>,
}));

// 2. Mock Tiptap Pro Extension
// This ensures we don't need the actual pro package installed to run tests
vi.mock('@tiptap-pro/extension-pages', () => ({
  Pages: {
    configure: vi.fn().mockReturnValue('configured-pages-extension'),
  },
}));

describe('ScreenplayEditor', () => {
  const mockSetEditorRef = vi.fn();
  
  const mockTemplate = {
    id: 'american',
    extension: ['mock-extension-base'],
    elements: [
      { node: 'heading' },
      { node: 'action' },
      { node: 'dialogue' }
    ]
  };

  const mockCommands = {
    setContent: vi.fn(),
  };

  const mockEditor = {
    isDestroyed: false,
    commands: mockCommands,
    // Add other properties if accessed by the component
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state when useEditor returns null', () => {
    // Simulate Tiptap initializing (returning null initially)
    useEditor.mockReturnValue(null);
    
    render(
      <ScreenplayEditor 
        setEditorRef={mockSetEditorRef} 
        template={mockTemplate} 
        initialContent="" 
      />
    );

    expect(screen.getByText('Loading Script Engine...')).toBeInTheDocument();
    expect(screen.queryByTestId('editor-content')).not.toBeInTheDocument();
  });

  it('should render EditorContent when editor is ready', () => {
    useEditor.mockReturnValue(mockEditor);
    
    render(
      <ScreenplayEditor 
        setEditorRef={mockSetEditorRef} 
        template={mockTemplate} 
        initialContent="" 
      />
    );

    expect(screen.queryByText('Loading Script Engine...')).not.toBeInTheDocument();
    expect(screen.getByTestId('editor-content')).toBeInTheDocument();
  });

  it('should configure extensions correctly based on template', () => {
    useEditor.mockReturnValue(mockEditor);
    
    render(
      <ScreenplayEditor 
        setEditorRef={mockSetEditorRef} 
        template={mockTemplate} 
        initialContent="" 
      />
    );

    // Verify Pages extension was configured with template elements
    expect(Pages.configure).toHaveBeenCalledWith({
      types: ['heading', 'action', 'dialogue'],
      pageFormat: 'A4',
      pageBreakBackground: 'transparent',
      pageGap: 0.5,
    });
  });

  it('should initialize editor with correct class names', () => {
    useEditor.mockReturnValue(mockEditor);
    
    render(
      <ScreenplayEditor 
        setEditorRef={mockSetEditorRef} 
        template={mockTemplate} 
        initialContent="" 
      />
    );

    // Check arguments passed to useEditor hook
    const useEditorCalls = useEditor.mock.calls[0];
    const config = useEditorCalls[0];

    // Check specific class for template ID
    expect(config.editorProps.attributes.class).toContain('tpl-american');
    // Check extensions array contains the mocked extension
    expect(config.extensions).toContain('configured-pages-extension');
    expect(config.extensions).toContain('mock-extension-base');
  });

  it('should sync editor reference to parent via setEditorRef', () => {
    useEditor.mockReturnValue(mockEditor);
    
    render(
      <ScreenplayEditor 
        setEditorRef={mockSetEditorRef} 
        template={mockTemplate} 
        initialContent="" 
      />
    );

    expect(mockSetEditorRef).toHaveBeenCalledWith(mockEditor);
  });

  it('should clear editor reference on unmount', () => {
    useEditor.mockReturnValue(mockEditor);
    
    const { unmount } = render(
      <ScreenplayEditor 
        setEditorRef={mockSetEditorRef} 
        template={mockTemplate} 
        initialContent="" 
      />
    );

    // Sync on mount
    expect(mockSetEditorRef).toHaveBeenCalledWith(mockEditor);
    
    // Unmount
    unmount();
    
    // Sync null on unmount
    expect(mockSetEditorRef).toHaveBeenCalledWith(null);
  });

  it('should not sync reference if editor is destroyed', () => {
    const destroyedEditor = { ...mockEditor, isDestroyed: true };
    useEditor.mockReturnValue(destroyedEditor);
    
    render(
      <ScreenplayEditor 
        setEditorRef={mockSetEditorRef} 
        template={mockTemplate} 
        initialContent="" 
      />
    );

    expect(mockSetEditorRef).not.toHaveBeenCalledWith(destroyedEditor);
  });

  it('should update editor content when initialContent prop changes', () => {
    useEditor.mockReturnValue(mockEditor);
    
    const { rerender } = render(
      <ScreenplayEditor 
        setEditorRef={mockSetEditorRef} 
        template={mockTemplate} 
        initialContent="Draft 1" 
      />
    );

    // Reset mock to ignore initial calls
    mockCommands.setContent.mockClear();

    // Rerender with new content (simulating opening a different file)
    rerender(
      <ScreenplayEditor 
        setEditorRef={mockSetEditorRef} 
        template={mockTemplate} 
        initialContent="Draft 2" 
      />
    );

    expect(mockCommands.setContent).toHaveBeenCalledWith('Draft 2');
  });
});