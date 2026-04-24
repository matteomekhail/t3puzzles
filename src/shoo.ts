import {
  createShooConvexAuth,
  useShooAuth as useShooAuthBase,
} from '@shoojs/react'

const shooOptions = {
  callbackPath: '/shoo/callback',
  requestPii: true,
}

export const { useAuth, signIn, signOut } = createShooConvexAuth(shooOptions)

export function useShooAuth() {
  return useShooAuthBase(shooOptions)
}
