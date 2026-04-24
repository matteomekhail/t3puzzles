import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'

const { mockUseShooAuth, mockSignIn, mockSignOut } = vi.hoisted(() => ({
  mockUseShooAuth: vi.fn(),
  mockSignIn: vi.fn(),
  mockSignOut: vi.fn(),
}))

vi.mock('@shoojs/react', () => ({
  useShooAuth: mockUseShooAuth,
}))

vi.mock('../src/shoo', () => ({
  signIn: mockSignIn,
  signOut: mockSignOut,
}))

import { Home } from '../src/routes/index'

describe('Home', () => {
  beforeEach(() => {
    mockUseShooAuth.mockReset()
    mockSignIn.mockReset()
    mockSignOut.mockReset()
    cleanup()
  })

  it('renders the tagline', () => {
    mockUseShooAuth.mockReturnValue({
      identity: { userId: null },
      loading: false,
    })
    render(<Home />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain(
      'T3 Puzzles',
    )
  })

  it('shows a disabled Loading… button while auth resolves', () => {
    mockUseShooAuth.mockReturnValue({
      identity: { userId: null },
      loading: true,
    })
    render(<Home />)
    const btn = screen.getByRole('button', { name: /loading/i })
    expect(btn.hasAttribute('disabled')).toBe(true)
  })

  it('not signed in: clicking Start solving calls signIn only', () => {
    mockUseShooAuth.mockReturnValue({
      identity: { userId: null },
      loading: false,
    })
    render(<Home />)
    fireEvent.click(screen.getByRole('button', { name: /start solving/i }))
    expect(mockSignIn).toHaveBeenCalledTimes(1)
    expect(mockSignOut).not.toHaveBeenCalled()
  })

  it('signed in: clicking the CTA calls signOut and never signIn', () => {
    mockUseShooAuth.mockReturnValue({
      identity: { userId: 'user_abc' },
      loading: false,
    })
    render(<Home />)
    fireEvent.click(screen.getByRole('button', { name: /sign out/i }))
    expect(mockSignOut).toHaveBeenCalledTimes(1)
    expect(mockSignIn).not.toHaveBeenCalled()
  })
})
