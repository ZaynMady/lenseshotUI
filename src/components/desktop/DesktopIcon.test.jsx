import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DesktopIcon from './DesktopIcon';
import { describe, it, expect, vi } from 'vitest';

// ✅ FIX: Return an object with a 'default' key
vi.mock('react-draggable', () => ({
  default: ({ children, onStop }) => {
    // We wrap the children in a div so we can attach the event listener easily.
    // This is safer than React.cloneElement which can fail if children are fragments.
    return (
      <div data-testid="draggable-mock" onMouseUp={onStop}>
        {children}
      </div>
    );
  },
}));

describe('DesktopIcon', () => {
  const mockIcon = <svg data-testid="icon-svg" />;
  const mockLabel = 'My Application';

  it('renders the icon and label correctly', () => {
    render(<DesktopIcon icon={mockIcon} label={mockLabel} />);

    // Check if the icon is in the document
    expect(screen.getByTestId('icon-svg')).toBeInTheDocument();

    // Check if the label text is rendered
    expect(screen.getByText(mockLabel)).toBeInTheDocument();

    // Check for accessibility
    expect(screen.getByRole('button', { name: mockLabel })).toBeInTheDocument();
  });

  it('calls onDoubleClick when the icon is double-clicked', async () => {
    const user = userEvent.setup();
    const handleDoubleClick = vi.fn();
    render(
      <DesktopIcon
        icon={mockIcon}
        label={mockLabel}
        onDoubleClick={handleDoubleClick}
      />
    );

    const iconButton = screen.getByRole('button', { name: mockLabel });
    await user.dblClick(iconButton);

    expect(handleDoubleClick).toHaveBeenCalledTimes(1);
  });

  it('calls onDragEnd when a drag operation is finished', () => {
    const handleDragEnd = vi.fn();
    render(
      <DesktopIcon icon={mockIcon} label={mockLabel} onDragEnd={handleDragEnd} />
    );

    // We target our wrapper div or the button inside it
    // Since we put onMouseUp on the wrapper in the mock above:
    const draggableWrapper = screen.getByTestId('draggable-mock');
    
    // Fire mouseUp to simulate the drag stopping
    fireEvent.mouseUp(draggableWrapper);

    expect(handleDragEnd).toHaveBeenCalledTimes(1);
  });
});