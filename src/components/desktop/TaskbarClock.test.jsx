import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import TaskbarClock from './TaskbarClock'; // Make sure this path is correct

describe('TaskbarClock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the initial time correctly', () => {
    // 1. Set the System Time to a specific fixed point
    // We use a local string format to avoid UTC conversion headaches
    const date = new Date('October 27, 2023 10:30:00'); 
    vi.setSystemTime(date);

    render(<TaskbarClock />);

    // 2. THE EXPECT FUNCTION
    // We use a Regex (/.../i) to find "10:30" regardless of case (AM/PM/am/pm)
    // This allows it to pass whether your clock says "10:30 AM" or just "10:30"
    expect(screen.getByText(/10:30/i)).toBeInTheDocument();
  });

  it('updates the time when the interval fires', () => {
    // 1. Start at 10:30
    const date = new Date('October 27, 2023 10:30:00');
    vi.setSystemTime(date);
    
    render(<TaskbarClock />);
    
    // Verify start time
    expect(screen.getByText(/10:30/i)).toBeInTheDocument();

    // 2. Fast-forward time by 1 minute (60,000ms)
    // We wrap this in 'act' because it triggers a React State update
    act(() => {
      vi.advanceTimersByTime(60000); 
    });

    // 3. THE EXPECT FUNCTION (After Update)
    // Should now be 10:31
    expect(screen.getByText(/10:31/i)).toBeInTheDocument();
  });
});