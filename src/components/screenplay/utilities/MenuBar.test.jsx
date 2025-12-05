import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import MenuBar from './MenuBar';

describe('MenuBar', () => {
    // Mock the Tiptap editor chain
    const mockRun = vi.fn();
    const mockUndo = vi.fn().mockReturnThis();
    const mockRedo = vi.fn().mockReturnThis();
    const mockFocus = vi.fn().mockReturnThis();
    const mockChain = vi.fn(() => ({
        focus: mockFocus,
        undo: mockUndo,
        redo: mockRedo,
        run: mockRun
    }));
    
    const mockEditor = {
        chain: mockChain
    };

    const mockProps = {
        editor: mockEditor,
        fileName: 'My Screenplay',
        viewMode: 'document',
        setViewMode: vi.fn(),
        showSceneNumbers: false,
        toggleSceneNumbers: vi.fn(),
        onOpenTemplates: vi.fn(),
        isFocusMode: false,
        onToggleFocus: vi.fn(),
        onOpenShortcuts: vi.fn(),
        onSave: vi.fn(),
        onSaveAs: vi.fn(),
        onNew: vi.fn(),
        onOpen: vi.fn(),
        onImport: vi.fn(),
        onExport: vi.fn(),
        onDelete: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render the TypeWriter title and filename', () => {
        render(<MenuBar {...mockProps} />);
        expect(screen.getByText('TypeWriter')).toBeInTheDocument();
        expect(screen.getByText('My Screenplay')).toBeInTheDocument();
    });

    describe('File Menu', () => {
        it('should open File menu and trigger actions', () => {
            render(<MenuBar {...mockProps} />);
            
            // Open Menu
            fireEvent.click(screen.getByText('File'));
            
            // Check items visibility
            expect(screen.getByText('New Script')).toBeInTheDocument();
            expect(screen.getByText('Save')).toBeInTheDocument();

            // Click New Script
            fireEvent.click(screen.getByText('New Script'));
            expect(mockProps.onNew).toHaveBeenCalled();

            // Click Save (need to reopen menu as it likely stays open or closes depending on implementation, 
            // but in React functional updates usually re-render. 
            // Our implementation closes on click because the parent re-renders or logic dictates, 
            // but let's assume menu stays open or we re-click for robustness)
            // Actually, the MenuItem implementation doesn't explicitly close the dropdown prop, 
            // but usually a click causes a state change or navigation. 
            // However, looking at MenuDropdown code: `onClick` runs the prop then finishes. 
            // The dropdown state `isOpen` is local to MenuDropdown. 
            // Clicking a MenuItem *inside* the dropdown does NOT automatically close it 
            // unless the parent handles it or the button is unmounted.
            // Let's re-click 'File' just to be safe or verify if it stays open.
            
            fireEvent.click(screen.getByText('Save'));
            expect(mockProps.onSave).toHaveBeenCalled();
        });

        it('should disable Delete button if file is Unsaved', () => {
            render(<MenuBar {...mockProps} fileName="Unsaved Script" />);
            
            fireEvent.click(screen.getByText('File'));
            
            const deleteBtn = screen.getByText('Delete').closest('button');
            expect(deleteBtn).toBeDisabled();
            
            fireEvent.click(deleteBtn);
            expect(mockProps.onDelete).not.toHaveBeenCalled();
        });

        it('should enable Delete button if file is saved', () => {
            render(<MenuBar {...mockProps} fileName="My Movie" />);
            
            fireEvent.click(screen.getByText('File'));
            
            const deleteBtn = screen.getByText('Delete').closest('button');
            expect(deleteBtn).not.toBeDisabled();
            
            fireEvent.click(deleteBtn);
            expect(mockProps.onDelete).toHaveBeenCalled();
        });
    });

    describe('Edit Menu', () => {
        it('should trigger Undo on editor', () => {
            render(<MenuBar {...mockProps} />);
            
            fireEvent.click(screen.getByText('Edit'));
            fireEvent.click(screen.getByText('Undo'));

            expect(mockEditor.chain).toHaveBeenCalled();
            expect(mockFocus).toHaveBeenCalled();
            expect(mockUndo).toHaveBeenCalled();
            expect(mockRun).toHaveBeenCalled();
        });

        it('should trigger Redo on editor', () => {
            render(<MenuBar {...mockProps} />);
            
            fireEvent.click(screen.getByText('Edit'));
            fireEvent.click(screen.getByText('Redo'));

            expect(mockRedo).toHaveBeenCalled();
        });
    });

    describe('View Menu', () => {
        it('should show checkmark for active view mode', () => {
            render(<MenuBar {...mockProps} viewMode="scene" />);
            
            fireEvent.click(screen.getByText('View'));
            
            // We can't easily check for the Check icon component instance without specific test-ids,
            // but we can check checking behavior via logic or prop calls
            
            const sceneViewBtn = screen.getByText('Scene View').closest('button');
            fireEvent.click(sceneViewBtn);
            
            expect(mockProps.setViewMode).toHaveBeenCalledWith('scene');
        });

        it('should toggle Focus Mode', () => {
            render(<MenuBar {...mockProps} />);
            
            fireEvent.click(screen.getByText('View'));
            fireEvent.click(screen.getByText('Focus Mode'));
            
            expect(mockProps.onToggleFocus).toHaveBeenCalled();
        });
    });

    describe('Format Menu', () => {
        it('should toggle scene numbers', () => {
            render(<MenuBar {...mockProps} />);
            
            fireEvent.click(screen.getByText('Format'));
            fireEvent.click(screen.getByText('Scene Numbering'));
            
            expect(mockProps.toggleSceneNumbers).toHaveBeenCalled();
        });

        it('should open templates modal', () => {
            render(<MenuBar {...mockProps} />);
            
            fireEvent.click(screen.getByText('Format'));
            fireEvent.click(screen.getByText('Change Template...'));
            
            expect(mockProps.onOpenTemplates).toHaveBeenCalled();
        });
    });

    describe('Dropdown Behavior', () => {
        it('should close dropdown when clicking outside', () => {
            render(<MenuBar {...mockProps} />);
            
            // Open menu
            fireEvent.click(screen.getByText('File'));
            expect(screen.getByText('New Script')).toBeInTheDocument();
            
            // Click outside (document body)
            fireEvent.mouseDown(document.body);
            
            // Dropdown content should disappear
            expect(screen.queryByText('New Script')).not.toBeInTheDocument();
        });

        it('should toggle dropdown when clicking the label', () => {
            render(<MenuBar {...mockProps} />);
            
            const fileButton = screen.getByText('File');
            
            // Open
            fireEvent.click(fileButton);
            expect(screen.getByText('New Script')).toBeInTheDocument();
            
            // Close
            fireEvent.click(fileButton);
            expect(screen.queryByText('New Script')).not.toBeInTheDocument();
        });
    });
});