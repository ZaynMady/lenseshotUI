import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Navbar from './navbar';

// We need to mock the useNavigate hook from react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate, // Force our spy function
  };
});
// A helper function to render the component within a router context
const renderNavbar = () => {
  return render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  );
};

describe('Navbar Component', () => {
  // Clear the mock's history before each test
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders the main branding title', () => {
    renderNavbar();
    // Check for the main title text. We use a text matcher to avoid issues with the nested <span>.
    expect(screen.getByText((content, element) => content.startsWith('Lenseshot'))).toBeInTheDocument();
  });

  it('renders the main navigation links', () => {
    renderNavbar();
    // Check for the links in the NavLinks component
    expect(screen.getByRole('link', { name: /pricing/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /contact us/i })).toBeInTheDocument();
  });

  it('renders the authentication buttons', () => {
    renderNavbar();
    // Check for the links/buttons in the AuthButtons component
    // These are `<a>` tags without an `href`, so they don't have a default 'link' role.
    // We can find them by their text content.
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
  });

  it('calls navigate with "/signIn" when the "Sign In" button is clicked', async () => {
    const user = userEvent.setup();
    renderNavbar();

    const signInButton = screen.getByText(/sign in/i);
    await user.click(signInButton);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/signIn');
  });

  it('calls navigate with "/signUp" when the "Sign Up" button is clicked', async () => {
    const user = userEvent.setup();
    renderNavbar();

    const signUpButton = screen.getByText(/sign up/i);
    await user.click(signUpButton);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/signUp');
  });
});