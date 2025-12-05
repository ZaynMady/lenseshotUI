import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import TemplateModal from './templateModal';

// Mock the external templates data
vi.mock('../../editor/templates', () => ({
    default: [
        { id: 'american', name: 'American Standard', elements: [1, 2, 3] },
        { id: 'bbc', name: 'BBC Drama', elements: [1, 2] },
        { id: 'stage', name: 'Stage Play', elements: [] }
    ]
}));

describe('TemplateModal', () => {
    const mockOnClose = vi.fn();
    const mockOnSelect = vi.fn();
    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        onSelect: mockOnSelect,
        currentTemplateId: 'american',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should not render when isOpen is false', () => {
        render(<TemplateModal {...defaultProps} isOpen={false} />);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render correct number of templates', () => {
        render(<TemplateModal {...defaultProps} />);
        const buttons = screen.getAllByRole('button');
        // 3 template buttons + 1 close button + 1 cancel button = 5
        // Filter for just the template buttons (they have "Elements" text in them or based on grid structure)
        const templateButtons = screen.getAllByText(/Elements/i);
        expect(templateButtons).toHaveLength(3);
    });

    it('should highlight the currently active template', () => {
        render(<TemplateModal {...defaultProps} />);
        
        // Find the button for 'American Standard'
        const americanTemplate = screen.getByText('American Standard').closest('button');
        
        // Check for active styles/classes or aria-pressed
        expect(americanTemplate).toHaveAttribute('aria-pressed', 'true');
        expect(americanTemplate).toHaveClass('border-red-500');
    });

    it('should not highlight inactive templates', () => {
        render(<TemplateModal {...defaultProps} />);
        
        const bbcTemplate = screen.getByText('BBC Drama').closest('button');
        
        expect(bbcTemplate).toHaveAttribute('aria-pressed', 'false');
        expect(bbcTemplate).not.toHaveClass('border-red-500');
    });

    it('should call onSelect with the template object when clicked', () => {
        render(<TemplateModal {...defaultProps} />);
        
        const bbcTemplateButton = screen.getByText('BBC Drama').closest('button');
        fireEvent.click(bbcTemplateButton);

        expect(mockOnSelect).toHaveBeenCalledTimes(1);
        expect(mockOnSelect).toHaveBeenCalledWith(expect.objectContaining({
            id: 'bbc',
            name: 'BBC Drama'
        }));
    });

    it('should call onClose when clicking the close icon', () => {
        render(<TemplateModal {...defaultProps} />);
        
        const closeButton = screen.getByLabelText('Close template modal');
        fireEvent.click(closeButton);

        expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when clicking the Cancel button', () => {
        render(<TemplateModal {...defaultProps} />);
        
        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        expect(mockOnClose).toHaveBeenCalled();
    });
});