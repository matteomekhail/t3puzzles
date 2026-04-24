import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'

const { mockUseShooAuth, mockSignIn, mockSignOut } = vi.hoisted(() => ({
  mockUseShooAuth: vi.fn(),
  mockSignIn: vi.fn(),
  mockSignOut: vi.fn(),
}))

vi.mock('../src/shoo', () => ({
  signIn: mockSignIn,
  signOut: mockSignOut,
  useShooAuth: mockUseShooAuth,
}))

vi.mock('@tanstack/react-router', async () => {
  const actual =
    await vi.importActual<typeof import('@tanstack/react-router')>('@tanstack/react-router')
  return {
    ...actual,
    Link: ({
      to,
      children,
      className,
    }: {
      to: string
      children: ReactNode
      className?: string
    }) => createElement('a', { href: to, className }, children),
  }
})

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

  it('not signed in: clicking Start solving calls signIn with returnTo=/dashboard', () => {
    mockUseShooAuth.mockReturnValue({
      identity: { userId: null },
      loading: false,
    })
    render(<Home />)
    fireEvent.click(screen.getByRole('button', { name: /start solving/i }))
    expect(mockSignIn).toHaveBeenCalledTimes(1)
    expect(mockSignIn).toHaveBeenCalledWith({ returnTo: '/dashboard' })
    expect(mockSignOut).not.toHaveBeenCalled()
  })

  it('signed in: renders a link to /dashboard and triggers no auth action', () => {
    mockUseShooAuth.mockReturnValue({
      identity: { userId: 'user_abc' },
      loading: false,
    })
    render(<Home />)
    const link = screen.getByRole('link', { name: /go to dashboard/i })
    expect(link.getAttribute('href')).toBe('/dashboard')
    expect(mockSignIn).not.toHaveBeenCalled()
    expect(mockSignOut).not.toHaveBeenCalled()
  })
})
