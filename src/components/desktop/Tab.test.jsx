import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tab } from './Tab';
import { describe, it, expect, vi } from 'vitest';

// Mock framer-motion. We only care that the children are rendered.
vi.mock('framer-motion', () => ({
  ...vi.importActual('framer-motion'), // Keep other exports like 'motion'
  motion: {
    ...vi.importActual('framer-motion').motion,
    div: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  },
}));

const mockItems = [
  {
    id: 'profile',
    label: 'Profile',
    icon: <span data-testid="icon-profile">P</span>,
    content: <div>Profile Content</div>,
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    content: <div>Dashboard Content</div>,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <span data-testid="icon-settings">S</span>,
    content: <div>Settings Content</div>,
  },
];

describe('Tab Component', () => {
  it('renders tabs and defaults to the first item as active', () => {
    render(<Tab items={mockItems} />);

    // Check that all tab buttons are rendered
    expect(screen.getByRole('tab', { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /settings/i })).toBeInTheDocument();

    // The first tab should be active by default
    expect(screen.getByRole('tab', { name: /profile/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /dashboard/i })).toHaveAttribute('aria-selected', 'false');

    // The first tab's content should be visible
    expect(screen.getByText('Profile Content')).toBeVisible();
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
  });

  it('renders with a specific default active tab', () => {
    render(<Tab items={mockItems} defaultActiveId="dashboard" />);

    // The 'Dashboard' tab should be active
    expect(screen.getByRole('tab', { name: /dashboard/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /profile/i })).toHaveAttribute('aria-selected', 'false');

    // The 'Dashboard' content should be visible
    expect(screen.getByText('Dashboard Content')).toBeVisible();
    expect(screen.queryByText('Profile Content')).not.toBeInTheDocument();
  });

  it('switches to the correct tab and content when a tab is clicked', async () => {
    const user = userEvent.setup();
    render(<Tab items={mockItems} />);

    // Initially, Profile is active
    expect(screen.getByText('Profile Content')).toBeVisible();
    expect(screen.queryByText('Settings Content')).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /settings/i })).toHaveAttribute('aria-selected', 'false');

    // Click the 'Settings' tab
    const settingsTab = screen.getByRole('tab', { name: /settings/i });
    await user.click(settingsTab);

    // Now, Settings should be active
    expect(settingsTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /profile/i })).toHaveAttribute('aria-selected', 'false');

    // The 'Settings' content should be visible, and the old content gone
    expect(screen.getByText('Settings Content')).toBeVisible();
    expect(screen.queryByText('Profile Content')).not.toBeInTheDocument();
  });

  it('renders icons when they are provided', () => {
    render(<Tab items={mockItems} />);

    // Check for the icons within their respective tabs
    const profileTab = screen.getByRole('tab', { name: /profile/i });
    const settingsTab = screen.getByRole('tab', { name: /settings/i });
    const dashboardTab = screen.getByRole('tab', { name: /dashboard/i });

    expect(profileTab.querySelector('[data-testid="icon-profile"]')).toBeInTheDocument();
    expect(settingsTab.querySelector('[data-testid="icon-settings"]')).toBeInTheDocument();
    
    // The dashboard item has no icon
    expect(dashboardTab.querySelector('span:not([class])')).toBeNull();
  });

  it('applies a custom className to the wrapper', () => {
    const customClass = 'my-custom-tabs';
    const { container } = render(<Tab items={mockItems} className={customClass} />);

    // The first child of the container is the main wrapper div
    expect(container.firstChild).toHaveClass(customClass);
  });
});