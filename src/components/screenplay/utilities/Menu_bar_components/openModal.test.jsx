import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import OpenScreenplayModal from './openScreenplayModal';
// CORRECTED: Import api from the client file, not the component
import { api } from '../../../../api/client';

// Mock the external API module
vi.mock('../../../../api/client', () => ({
    api: {
        listScreenplays: vi.fn()
    }
}));

describe('OpenScreenplayModal', () => {
    const mockOnClose = vi.fn();
    const mockOnFileSelect = vi.fn();
    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        onFileSelect: mockOnFileSelect,
    };

    const mockScripts = {
        data: {
            screenplays: ['Batman Begins', 'Superman', 'Wonder Woman']
        }
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should not render when isOpen is false', () => {
        render(<OpenScreenplayModal {...defaultProps} isOpen={false} />);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render and fetch scripts on open', async () => {
        api.listScreenplays.mockResolvedValueOnce(mockScripts);
        
        render(<OpenScreenplayModal {...defaultProps} />);
        
        // Initial Loading State
        expect(screen.getByText('Loading library...')).toBeInTheDocument();

        // Wait for data
        await waitFor(() => {
            expect(screen.getByText('Batman Begins')).toBeInTheDocument();
            expect(screen.getByText('Superman')).toBeInTheDocument();
        });
    });

    it('should handle API errors gracefully', async () => {
        // Suppress console error for this test
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        api.listScreenplays.mockRejectedValueOnce(new Error('Fetch failed'));

        render(<OpenScreenplayModal {...defaultProps} />);

        await waitFor(() => {
            expect(screen.getByText('Could not load your screenplays. Please try again.')).toBeInTheDocument();
        });

        // Test Retry button
        api.listScreenplays.mockResolvedValueOnce(mockScripts);
        fireEvent.click(screen.getByText('Try Again'));

        expect(screen.getByText('Loading library...')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByText('Batman Begins')).toBeInTheDocument();
        });

        consoleSpy.mockRestore();
    });

    it('should filter scripts based on search input', async () => {
        api.listScreenplays.mockResolvedValueOnce(mockScripts);
        render(<OpenScreenplayModal {...defaultProps} />);

        await waitFor(() => {
            expect(screen.getByText('Batman Begins')).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText('Search your scripts...');
        fireEvent.change(searchInput, { target: { value: 'Wonder' } });

        expect(screen.getByText('Wonder Woman')).toBeInTheDocument();
        expect(screen.queryByText('Batman Begins')).not.toBeInTheDocument();
        expect(screen.queryByText('Superman')).not.toBeInTheDocument();
    });

    it('should show empty state when search matches nothing', async () => {
        api.listScreenplays.mockResolvedValueOnce(mockScripts);
        render(<OpenScreenplayModal {...defaultProps} />);

        await waitFor(() => {
            expect(screen.getByText('Batman Begins')).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText('Search your scripts...');
        fireEvent.change(searchInput, { target: { value: 'Marvel Movie' } });

        expect(screen.getByText('No matches found for "Marvel Movie"')).toBeInTheDocument();
    });

    it('should select a file and close modal on click', async () => {
        api.listScreenplays.mockResolvedValueOnce(mockScripts);
        render(<OpenScreenplayModal {...defaultProps} />);

        await waitFor(() => {
            expect(screen.getByText('Batman Begins')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Batman Begins'));

        expect(mockOnFileSelect).toHaveBeenCalledWith('Batman Begins');
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('should close on escape key', () => {
        render(<OpenScreenplayModal {...defaultProps} />);
        fireEvent.keyDown(window, { key: 'Escape' });
        expect(mockOnClose).toHaveBeenCalled();
    });
});