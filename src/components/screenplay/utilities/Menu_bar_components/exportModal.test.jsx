import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import ExportScreenplayModal from './exportScreenplayModal';

describe('ExportScreenplayModal', () => {
    const mockOnClose = vi.fn();
    const mockOnExport = vi.fn();
    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        onExport: mockOnExport,
        defaultName: 'My Awesome Movie.lss',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should not render when isOpen is false', () => {
        render(<ExportScreenplayModal {...defaultProps} isOpen={false} />);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render correctly with default filename stripped of extension', () => {
        render(<ExportScreenplayModal {...defaultProps} />);
        
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Export Screenplay')).toBeInTheDocument();
        
        // Check input value (extension should be removed)
        const input = screen.getByLabelText('Filename');
        expect(input).toHaveValue('My Awesome Movie');
    });

    it('should update filename when input changes', () => {
        render(<ExportScreenplayModal {...defaultProps} />);
        
        const input = screen.getByLabelText('Filename');
        fireEvent.change(input, { target: { value: 'New Draft v2' } });
        
        expect(input).toHaveValue('New Draft v2');
    });

    it('should call onExport with "lss" format and close when LSS button is clicked', () => {
        render(<ExportScreenplayModal {...defaultProps} />);
        
        // Find button by specific text content or label
        const lssButton = screen.getByText('Lenseshot Script (.lss)').closest('button');
        fireEvent.click(lssButton);

        expect(mockOnExport).toHaveBeenCalledWith('lss', 'My Awesome Movie');
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onExport with "pdf" format and close when PDF button is clicked', () => {
        render(<ExportScreenplayModal {...defaultProps} />);
        
        const pdfButton = screen.getByText('Print / PDF').closest('button');
        fireEvent.click(pdfButton);

        expect(mockOnExport).toHaveBeenCalledWith('pdf', 'My Awesome Movie');
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onExport with "docx" format and close when Word button is clicked', () => {
        render(<ExportScreenplayModal {...defaultProps} />);
        
        const docButton = screen.getByText('Word Document (.doc)').closest('button');
        fireEvent.click(docButton);

        expect(mockOnExport).toHaveBeenCalledWith('docx', 'My Awesome Movie');
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('should close when the close icon button is clicked', () => {
        render(<ExportScreenplayModal {...defaultProps} />);
        
        const closeButton = screen.getByLabelText('Close export modal');
        fireEvent.click(closeButton);

        expect(mockOnClose).toHaveBeenCalled();
    });

    it('should close when clicking the backdrop', () => {
        render(<ExportScreenplayModal {...defaultProps} />);
        
        // The backdrop is the first div with onClick
        // We can find it by looking for the presentation div or by generic role query if structured differently,
        // but here we know the structure.
        // A robust way without data-testid is to click the parent of the dialog content if it's the backdrop, 
        // but in this code, the backdrop is a sibling covering the screen.
        
        // We will assume the backdrop is the element with aria-hidden="true" acting as overlay
        // or simply query the container.
        
        // Let's add a click to the container that has the click handler
        // Note: In the component, the backdrop is: <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
        
        const backdrop = screen.getByRole('dialog').querySelector('div[aria-hidden="true"]');
        fireEvent.click(backdrop);

        expect(mockOnClose).toHaveBeenCalled();
    });

    it('should use "Untitled Script" if no defaultName is provided', () => {
        render(<ExportScreenplayModal {...defaultProps} defaultName={null} />);
        
        const input = screen.getByLabelText('Filename');
        expect(input).toHaveValue('Untitled Script');
    });
});