import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Window from './Window';
import { describe, it, expect, vi } from 'vitest';

// Mock external libraries to isolate the Window component for testing.

// Mock framer-motion: We don't need to test the animations, just that the component renders.
vi.mock('framer-motion', () => ({
  ...vi.importActual('framer-motion'),
  motion: {
    ...vi.importActual('framer-motion').motion,
    div: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  },
}));

// Mock react-draggable: We render the children and provide a way to test the onStart callback.
vi.mock('react-draggable', () => ({
  default: ({ children }) => <div>{children}</div>
}));

// Mock re-resizable: We just render the children inside a div.
vi.mock('re-resizable', () => ({
  Resizable: vi.fn(({ children, className }) => <div className={className}>{children}</div>),
}));

describe('Window Component', () => {
  const defaultProps = {
    title: 'My Test App',
    onClose: vi.fn(),
    onMinimize: vi.fn(),
    onFocus: vi.fn(),
    zIndex: 10,
    isMinimized: false,
  };

  // Clear mock function calls before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the title and children correctly', () => {
    render(
      <Window {...defaultProps}>
        <div>Window Content</div>
      </Window>
    );

    expect(screen.getByText('My Test App')).toBeInTheDocument();
    expect(screen.getByText('Window Content')).toBeInTheDocument();
  });

  it('calls onFocus on initial mount', () => {
    render(<Window {...defaultProps} />);
    expect(defaultProps.onFocus).toHaveBeenCalledTimes(1);
  });

  it('calls onFocus when the window is clicked', async () => {
    const user = userEvent.setup();
    render(<Window {...defaultProps} />);
    
    // Reset mock from initial mount call
    defaultProps.onFocus.mockClear();

    // The root element of the window has the onMouseDownCapture handler
    const windowRoot = screen.getByText('My Test App').closest('.absolute.flex');
    await user.click(windowRoot);

    expect(defaultProps.onFocus).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup();
    render(<Window {...defaultProps} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onMinimize when the minimize button is clicked', async () => {
    const user = userEvent.setup();
    render(<Window {...defaultProps} />);

    const minimizeButton = screen.getByRole('button', { name: /minimize/i });
    await user.click(minimizeButton);

    expect(defaultProps.onMinimize).toHaveBeenCalledTimes(1);
  });

  it('toggles maximize state when the maximize button is clicked', async () => {
    const user = userEvent.setup();
    render(<Window {...defaultProps} />);

    const maximizeButton = screen.getByRole('button', { name: /maximize/i });
    const windowRoot = screen.getByText('My Test App').closest('.absolute.flex');

    // Initially not maximized
    expect(windowRoot).not.toHaveClass('inset-0');

    // Click to maximize
    await user.click(maximizeButton);
    expect(windowRoot).toHaveClass('inset-0 w-full h-full !transform-none');

    // Click again to restore
    await user.click(maximizeButton);
    expect(windowRoot).not.toHaveClass('inset-0');
  });

  it('toggles maximize state when the title bar is double-clicked', async () => {
    const user = userEvent.setup();
    render(<Window {...defaultProps} />);

    const titleBar = screen.getByText('My Test App').closest('.window-handle');
    const windowRoot = titleBar.closest('.absolute.flex');

    // Initially not maximized
    expect(windowRoot).not.toHaveClass('inset-0');

    // Double-click to maximize
    await user.dblClick(titleBar);
    expect(windowRoot).toHaveClass('inset-0 w-full h-full !transform-none');
  });

  it('is hidden when isMinimized is true', () => {
    render(<Window {...defaultProps} isMinimized={true} />);

    const windowRoot = screen.getByText('My Test App').closest('.absolute.flex');
    expect(windowRoot).toHaveStyle('display: none');
  });

  it('applies the correct zIndex', () => {
    render(<Window {...defaultProps} zIndex={99} />);

    const windowRoot = screen.getByText('My Test App').closest('.absolute.flex');
    expect(windowRoot).toHaveStyle('z-index: 99');
  });

  it('stops propagation on control button clicks to prevent focus/drag', async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    render(<Window {...defaultProps} onFocus={onFocus} />);

    // Clear the initial onFocus call from mount
    onFocus.mockClear();

    const closeButton = screen.getByRole('button', { name: /close/i });
    
    // Using fireEvent for pointerDown to test stopPropagation
    fireEvent.pointerDown(closeButton);
    await user.click(closeButton);

    // onFocus should NOT have been called because the event was stopped
    expect(onFocus).not.toHaveBeenCalled();
  });
});