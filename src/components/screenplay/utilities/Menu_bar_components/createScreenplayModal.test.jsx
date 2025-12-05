import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import CreateScreenplayModal from './createScreenplayModal';
// CORRECTED: Import api from the client file, not the component
import { api } from '../../../../api/client';

// Mock the API client module
vi.mock('../../../../api/client', () => ({
    api: {
        createScreenplay: vi.fn(),
    },
}));

describe('CreateScreenplayModal', () => {
    const mockOnClose = vi.fn();
    const mockOnSuccess = vi.fn();
    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        onSuccess: mockOnSuccess,
        editorContent: { type: 'doc', content: [{ type: 'text', text: 'Fade In' }] },
        templateId: 'standard',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should not render when isOpen is false', () => {
        render(<CreateScreenplayModal {...defaultProps} isOpen={false} />);
        expect(screen.queryByText('Save Screenplay')).not.toBeInTheDocument();
    });

    it('should render correctly when isOpen is true', () => {
        render(<CreateScreenplayModal {...defaultProps} />);
        expect(screen.getByText('Save Screenplay')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('e.g. The Godfather Part IV')).toBeInTheDocument();
    });

    it('should display an error if saving with an empty name', async () => {
        render(<CreateScreenplayModal {...defaultProps} />);
        
        const saveButton = screen.getByText('Save As');
        fireEvent.click(saveButton);

        expect(await screen.findByText('Please enter a valid name.')).toBeInTheDocument();
        expect(api.createScreenplay).not.toHaveBeenCalled();
    });

    it('should call api.createScreenplay and onSuccess with correct data', async () => {
        // Setup API success
        api.createScreenplay.mockResolvedValueOnce({ id: '123' });

        render(<CreateScreenplayModal {...defaultProps} />);

        // Type script name
        const input = screen.getByPlaceholderText('e.g. The Godfather Part IV');
        fireEvent.change(input, { target: { value: 'My Awesome Movie' } });

        // Click Save
        fireEvent.click(screen.getByText('Save As'));

        // Check loading state
        expect(screen.getByText('Saving...')).toBeInTheDocument();

        // Wait for API call
        await waitFor(() => {
            expect(api.createScreenplay).toHaveBeenCalledWith('My Awesome Movie', {
                meta: { templateId: 'standard', version: '1.0' },
                content: defaultProps.editorContent,
            });
        });

        // Check callbacks
        expect(mockOnSuccess).toHaveBeenCalledWith('My Awesome Movie');
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('should use default templateId if none provided', async () => {
        api.createScreenplay.mockResolvedValueOnce({});
        render(<CreateScreenplayModal {...defaultProps} templateId={undefined} />);

        const input = screen.getByPlaceholderText('e.g. The Godfather Part IV');
        fireEvent.change(input, { target: { value: 'Test' } });
        fireEvent.click(screen.getByText('Save As'));

        await waitFor(() => {
            expect(api.createScreenplay).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    meta: expect.objectContaining({ templateId: 'american' }),
                })
            );
        });
    });

    it('should handle API errors gracefully', async () => {
        // Setup API failure
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        api.createScreenplay.mockRejectedValueOnce(new Error('Network error'));

        render(<CreateScreenplayModal {...defaultProps} />);

        const input = screen.getByPlaceholderText('e.g. The Godfather Part IV');
        fireEvent.change(input, { target: { value: 'Fail Movie' } });
        fireEvent.click(screen.getByText('Save As'));

        // Expect error message in UI
        expect(await screen.findByText('Failed to save. Please try again or check your connection.')).toBeInTheDocument();
        
        // Ensure success callback was NOT called
        expect(mockOnSuccess).not.toHaveBeenCalled();
        expect(mockOnClose).not.toHaveBeenCalled();
        
        consoleSpy.mockRestore();
    });

    it('should close when clicking the cancel button', () => {
        render(<CreateScreenplayModal {...defaultProps} />);
        fireEvent.click(screen.getByText('Cancel'));
        expect(mockOnClose).toHaveBeenCalled();
    });
});