import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskbarIcon from './TaskbarIcon';
import { describe, it, expect, vi } from 'vitest';

describe('TaskbarIcon', () => {
  const mockIcon = <svg data-testid="icon-svg" />;

  it('renders the button and the provided icon', () => {
    render(<TaskbarIcon icon={mockIcon} />);

    // Check that the button exists
    expect(screen.getByRole('button')).toBeInTheDocument();

    // Check that the icon passed as a prop is rendered
    expect(screen.getByTestId('icon-svg')).toBeInTheDocument();
  });

  it('calls the onClick handler when the button is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<TaskbarIcon icon={mockIcon} onClick={handleClick} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not render the active indicator when isActive is false', () => {
    render(<TaskbarIcon icon={mockIcon} isActive={false} />);

    // The active indicator should not be in the document
    const activeIndicator = screen.queryByTestId('active-indicator');
    expect(activeIndicator).not.toBeInTheDocument();
  });

  it('renders the active indicator when isActive is true', () => {
    render(<TaskbarIcon icon={mockIcon} isActive={true} />);

    // The active indicator should be present
    const activeIndicator = screen.getByTestId('active-indicator');
    expect(activeIndicator).toBeInTheDocument();

    // The button should also have the active background class
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-white/10');
  });
});