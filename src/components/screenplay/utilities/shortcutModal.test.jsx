import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import ShortcutModal from './ShortcutModal';

describe('ShortcutModal', () => {
    const mockOnClose = vi.fn();
    const mockOnSaveShortcuts = vi.fn();
    const mockOnSaveFlows = vi.fn();

    const mockShortcuts = {
        heading: 'Cmd+1',
        action: 'Cmd+2',
        dialogue: 'Cmd+3'
    };

    const mockFlows = {
        heading: { enter: 'action', tab: 'action' },
        action: { enter: 'action', tab: 'dialogue' },
        dialogue: { enter: 'parenthetical', tab: 'parenthetical' }
    };

    const mockNodeOptions = [
        { node: 'heading', value: 'heading', label: 'Scene Heading' },
        { node: 'action', value: 'action', label: 'Action' },
        { node: 'dialogue', value: 'dialogue', label: 'Dialogue' },
        { node: 'parenthetical', value: 'parenthetical', label: 'Parenthetical' }
    ];

    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        shortcuts: mockShortcuts,
        flows: mockFlows,
        onSaveShortcuts: mockOnSaveShortcuts,
        onSaveFlows: mockOnSaveFlows,
        nodeOptions: mockNodeOptions
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should not render when isOpen is false', () => {
        render(<ShortcutModal {...defaultProps} isOpen={false} />);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render correct tabs and header', () => {
        render(<ShortcutModal {...defaultProps} />);
        expect(screen.getByText('Editor Configuration')).toBeInTheDocument();
        expect(screen.getByText('Key Bindings')).toBeInTheDocument();
        expect(screen.getByText('Flow Control (Enter/Tab)')).toBeInTheDocument();
    });

    describe('Shortcuts Tab', () => {
        it('should display initial shortcuts with correct labels', () => {
            render(<ShortcutModal {...defaultProps} />);
            
            // "Scene Heading" might appear multiple times (hidden in other tabs/selects if rendered)
            // We verify at least one visible instance
            expect(screen.getAllByText('Scene Heading')[0]).toBeInTheDocument();
            expect(screen.getByText('Cmd+1')).toBeInTheDocument();
            expect(screen.getAllByText('Action')[0]).toBeInTheDocument();
            expect(screen.getByText('Cmd+2')).toBeInTheDocument();
        });

        it('should enter listening mode when clicking a shortcut button', () => {
            render(<ShortcutModal {...defaultProps} />);
            
            const btn = screen.getByText('Cmd+1').closest('button');
            fireEvent.click(btn);
            
            expect(screen.getByText('Press keys...')).toBeInTheDocument();
            expect(btn).toHaveClass('animate-pulse');
        });

        it('should record a new shortcut and exit listening mode', () => {
            render(<ShortcutModal {...defaultProps} />);
            
            fireEvent.click(screen.getByText('Cmd+1').closest('button'));
            
            fireEvent.keyDown(window, { key: 'Control', ctrlKey: true });
            fireEvent.keyDown(window, { key: 'Alt', altKey: true });
            fireEvent.keyDown(window, { key: 'h', ctrlKey: true, altKey: true });

            expect(screen.getByText('Ctrl+Alt+H')).toBeInTheDocument();
            expect(screen.queryByText('Press keys...')).not.toBeInTheDocument();
        });

        it('should handle Mac Meta key (Cmd)', () => {
            render(<ShortcutModal {...defaultProps} />);
            
            fireEvent.click(screen.getByText('Cmd+1').closest('button'));
            fireEvent.keyDown(window, { key: 'k', metaKey: true });
            
            expect(screen.getByText('Cmd+K')).toBeInTheDocument();
        });
    });

    describe('Flows Tab', () => {
        it('should switch to Flows tab and display options', () => {
            render(<ShortcutModal {...defaultProps} />);
            
            fireEvent.click(screen.getByText('Flow Control (Enter/Tab)'));
            
            expect(screen.getByText('Enter Creates')).toBeInTheDocument();
            expect(screen.getByText('Tab Switches To')).toBeInTheDocument();
            
            // Use getAllByText because "Scene Heading" is in the row label AND the selects
            const elements = screen.getAllByText('Scene Heading');
            expect(elements.length).toBeGreaterThan(0);
        });

        it('should update Enter flow behavior', () => {
            render(<ShortcutModal {...defaultProps} />);
            fireEvent.click(screen.getByText('Flow Control (Enter/Tab)'));

            const selects = screen.getAllByRole('combobox'); 
            const enterSelect = selects[0];
            
            expect(enterSelect).toHaveValue('action');
            
            fireEvent.change(enterSelect, { target: { value: 'dialogue' } });
            expect(enterSelect).toHaveValue('dialogue');
        });

        it('should update Tab flow behavior', () => {
            render(<ShortcutModal {...defaultProps} />);
            fireEvent.click(screen.getByText('Flow Control (Enter/Tab)'));

            const selects = screen.getAllByRole('combobox');
            const tabSelect = selects[1];
            
            expect(tabSelect).toHaveValue('action');
            
            fireEvent.change(tabSelect, { target: { value: 'parenthetical' } });
            expect(tabSelect).toHaveValue('parenthetical');
        });
    });

    describe('Persistence', () => {
        it('should save changes when Save Configuration is clicked', () => {
            render(<ShortcutModal {...defaultProps} />);
            
            // 1. Change Shortcut
            fireEvent.click(screen.getByText('Cmd+1').closest('button'));
            fireEvent.keyDown(window, { key: 'J', ctrlKey: true });

            // 2. Change Flow
            fireEvent.click(screen.getByText('Flow Control (Enter/Tab)'));
            const selects = screen.getAllByRole('combobox');
            fireEvent.change(selects[0], { target: { value: 'dialogue' } });

            // 3. Save
            fireEvent.click(screen.getByText('Save Configuration'));

            expect(mockOnSaveShortcuts).toHaveBeenCalledWith(expect.objectContaining({
                heading: 'Ctrl+J',
                action: 'Cmd+2'
            }));

            expect(mockOnSaveFlows).toHaveBeenCalledWith(expect.objectContaining({
                heading: expect.objectContaining({ enter: 'dialogue' })
            }));

            expect(mockOnClose).toHaveBeenCalled();
        });

        it('should discard changes when Cancel is clicked', () => {
            render(<ShortcutModal {...defaultProps} />);
            
            fireEvent.click(screen.getByText('Cmd+1').closest('button'));
            fireEvent.keyDown(window, { key: 'J', ctrlKey: true });
            
            fireEvent.click(screen.getByText('Cancel'));
            
            expect(mockOnSaveShortcuts).not.toHaveBeenCalled();
            expect(mockOnSaveFlows).not.toHaveBeenCalled();
            expect(mockOnClose).toHaveBeenCalled();
        });
    });
});