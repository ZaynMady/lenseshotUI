import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StartButton from './StartButton';
import { describe, it, expect, vi } from 'vitest';

describe('StartButton', () => {
  it('renders the button with the correct accessible name', () => {
    render(<StartButton />);

    // The button should be findable by its accessible name (aria-label)
    const button = screen.getByRole('button', { name: /start menu/i });
    expect(button).toBeInTheDocument();

    // Check if the SVG icon is rendered inside the button
    const svgIcon = button.querySelector('svg');
    expect(svgIcon).toBeInTheDocument();
  });

  it('calls the onClick handler when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<StartButton onClick={handleClick} />);

    const button = screen.getByRole('button', { name: /start menu/i });
    await user.click(button);

    // The mock function should have been called exactly once
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
