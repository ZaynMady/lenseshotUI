import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import ImportScreenplayModal from './importScreenplayModal';

describe('ImportScreenplayModal', () => {
    const mockOnClose = vi.fn();
    const mockOnImport = vi.fn();
    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        onImport: mockOnImport,
    };

    // Helper to mock FileReader
    const createMockFile = (name, content, type = 'application/json') => {
        const file = new File([content], name, { type });
        return file;
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should not render when isOpen is false', () => {
        render(<ImportScreenplayModal {...defaultProps} isOpen={false} />);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render correctly when open', () => {
        render(<ImportScreenplayModal {...defaultProps} />);
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Import Screenplay')).toBeInTheDocument();
        expect(screen.getByText('Click to upload or drag and drop')).toBeInTheDocument();
    });

    it('should close when the close button is clicked', () => {
        render(<ImportScreenplayModal {...defaultProps} />);
        const closeButton = screen.getByLabelText('Close import modal');
        fireEvent.click(closeButton);
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('should show error for invalid file extension', async () => {
        render(<ImportScreenplayModal {...defaultProps} />);
        
        const file = createMockFile('script.pdf', 'dummy content', 'application/pdf');
        const input = screen.getByLabelText('Upload file area').querySelector('input');

        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText('Only .lss files are supported currently.')).toBeInTheDocument();
        });
        expect(mockOnImport).not.toHaveBeenCalled();
    });

    it('should successfully import a valid .lss file via input change', async () => {
        render(<ImportScreenplayModal {...defaultProps} />);
        
        const validData = {
            meta: { templateId: 'standard', version: '1.0' },
            content: { type: 'doc', content: [] }
        };
        const file = createMockFile('movie.lss', JSON.stringify(validData));
        const input = screen.getByLabelText('Upload file area').querySelector('input');

        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(mockOnImport).toHaveBeenCalledWith(
                validData.content,
                'standard',
                'movie.lss'
            );
            expect(mockOnClose).toHaveBeenCalled();
        });
    });

    it('should successfully import a legacy format .lss file (no meta wrapper)', async () => {
        render(<ImportScreenplayModal {...defaultProps} />);
        
        const legacyData = { type: 'doc', content: [] };
        const file = createMockFile('legacy.lss', JSON.stringify(legacyData));
        const input = screen.getByLabelText('Upload file area').querySelector('input');

        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(mockOnImport).toHaveBeenCalledWith(
                legacyData,
                'american', // Default fallback
                'legacy.lss'
            );
        });
    });

    it('should handle corrupted/invalid JSON files', async () => {
        // Suppress console.error for this test since we expect an error
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        render(<ImportScreenplayModal {...defaultProps} />);
        
        const file = createMockFile('corrupt.lss', '{ incomplete json ');
        const input = screen.getByLabelText('Upload file area').querySelector('input');

        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText('Failed to parse file. It might be corrupted.')).toBeInTheDocument();
        });
        
        consoleSpy.mockRestore();
    });

    it('should handle drag and drop interaction', async () => {
        render(<ImportScreenplayModal {...defaultProps} />);
        
        const dropZone = screen.getByLabelText('Upload file area');
        const validData = { meta: { templateId: 'test' }, content: {} };
        const file = createMockFile('dragged.lss', JSON.stringify(validData));

        // Test visual cues
        fireEvent.dragEnter(dropZone);
        expect(dropZone).toHaveClass('border-red-500'); // Check for active class

        fireEvent.dragLeave(dropZone);
        expect(dropZone).not.toHaveClass('border-red-500'); // Check for inactive class

        // Test drop
        fireEvent.drop(dropZone, {
            dataTransfer: {
                files: [file],
            },
        });

        await waitFor(() => {
            expect(mockOnImport).toHaveBeenCalledWith(
                {},
                'test',
                'dragged.lss'
            );
        });
    });

    it('should close on Escape key press', () => {
        render(<ImportScreenplayModal {...defaultProps} />);
        fireEvent.keyDown(window, { key: 'Escape' });
        expect(mockOnClose).toHaveBeenCalled();
    });
});