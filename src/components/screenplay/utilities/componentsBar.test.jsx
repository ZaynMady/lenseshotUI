import React from 'react';
import { render, screen, fireEvent, createEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import ComponentsBar from './componentsBar';

describe('ComponentsBar', () => {
    const mockChain = {
        focus: vi.fn().mockReturnThis(),
        clearNodes: vi.fn().mockReturnThis(),
        setNode: vi.fn().mockReturnThis(),
        run: vi.fn(),
    };

    const mockEditor = {
        on: vi.fn(),
        off: vi.fn(),
        isDestroyed: false,
        view: { focus: vi.fn() },
        isActive: vi.fn(),
        chain: vi.fn(() => mockChain),
    };

    const mockElements = [
        { node: 'heading', label: 'Scene Heading', icon: <span>H</span>, shortcut: 'Cmd+1' },
        { node: 'action', label: 'Action', icon: <span>A</span>, shortcut: 'Cmd+2' },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        mockEditor.isDestroyed = false;
        mockEditor.isActive.mockReturnValue(false);
    });

    it('should return null if editor is undefined', () => {
        const { container } = render(<ComponentsBar editor={undefined} elements={mockElements} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('should return null if editor is destroyed', () => {
        const destroyedEditor = { ...mockEditor, isDestroyed: true };
        const { container } = render(<ComponentsBar editor={destroyedEditor} elements={mockElements} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('should return null if editor.view is missing', () => {
        const noViewEditor = { ...mockEditor, view: null };
        const { container } = render(<ComponentsBar editor={noViewEditor} elements={mockElements} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('should render the list of elements when editor is valid', () => {
        render(<ComponentsBar editor={mockEditor} elements={mockElements} />);
        
        expect(screen.getByText('Elements')).toBeInTheDocument();
        expect(screen.getByText('Scene Heading')).toBeInTheDocument();
        expect(screen.getByText('Action')).toBeInTheDocument();
    });

    it('should apply active styling when a node is active', () => {
        mockEditor.isActive.mockImplementation((name) => name === 'action');

        render(<ComponentsBar editor={mockEditor} elements={mockElements} />);

        const actionButton = screen.getByText('Action').closest('button');
        const headingButton = screen.getByText('Scene Heading').closest('button');

        expect(actionButton).toHaveClass('text-blue-600');
        expect(actionButton).toHaveClass('bg-white');
        
        expect(headingButton).toHaveClass('text-gray-600');
        expect(headingButton).toHaveClass('bg-transparent');
    });

    it('should trigger the correct editor chain on click', () => {
        render(<ComponentsBar editor={mockEditor} elements={mockElements} />);

        const headingButton = screen.getByText('Scene Heading').closest('button');
        fireEvent.click(headingButton);

        expect(mockEditor.chain).toHaveBeenCalled();
        expect(mockChain.focus).toHaveBeenCalled();
        expect(mockChain.clearNodes).toHaveBeenCalled();
        expect(mockChain.setNode).toHaveBeenCalledWith('heading');
        expect(mockChain.run).toHaveBeenCalled();
    });

    it('should attach event listeners on mount', () => {
        render(<ComponentsBar editor={mockEditor} elements={mockElements} />);
        
        expect(mockEditor.on).toHaveBeenCalledWith('selectionUpdate', expect.any(Function));
        expect(mockEditor.on).toHaveBeenCalledWith('transaction', expect.any(Function));
    });

    it('should detach event listeners on unmount', () => {
        const { unmount } = render(<ComponentsBar editor={mockEditor} elements={mockElements} />);
        
        unmount();
        
        expect(mockEditor.off).toHaveBeenCalledWith('selectionUpdate', expect.any(Function));
        expect(mockEditor.off).toHaveBeenCalledWith('transaction', expect.any(Function));
    });

    it('should prevent default on mouse down to avoid stealing focus', () => {
        render(<ComponentsBar editor={mockEditor} elements={mockElements} />);
        
        const button = screen.getByText('Scene Heading').closest('button');
        
        // Correct way to spy on preventDefault in React Testing Library
        const mouseDownEvent = createEvent.mouseDown(button);
        const preventDefaultSpy = vi.spyOn(mouseDownEvent, 'preventDefault');
        
        fireEvent(button, mouseDownEvent);
        
        expect(preventDefaultSpy).toHaveBeenCalled();
    });
    
    it('should show shortcuts in title attribute', () => {
        render(<ComponentsBar editor={mockEditor} elements={mockElements} />);
        
        const button = screen.getByText('Scene Heading').closest('button');
        expect(button).toHaveAttribute('title', 'Scene Heading (Cmd+1)');
    });
});