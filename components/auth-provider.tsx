
'use client'

import { createContext, useContext } from 'react'
import { SessionProvider, signOut as nextSignOut, useSession } from 'next-auth/react'

interface UserSummary {
  email: string | null
}

interface AuthContextType {
  user: UserSummary | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {}
})

function InnerAuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()

  const value: AuthContextType = {
    user: session?.user ? { email: session.user.email ?? null } : null,
    loading: status === 'loading',
    signOut: async () => {
      await nextSignOut({ redirect: false })
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <InnerAuthProvider>{children}</InnerAuthProvider>
    </SessionProvider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
