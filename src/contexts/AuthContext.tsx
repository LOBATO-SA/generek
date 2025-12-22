import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { UserProfile, UserType } from '../types'

// Interfaces locais para substituir as do Supabase
export interface User {
  id: string
  email?: string
  user_metadata: {
    [key: string]: any
  }
}

export interface Session {
  user: User
  access_token: string
}

export interface AuthError {
  message: string
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string, userType: UserType) => Promise<{ error: AuthError | Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>
  uploadAvatar: (imageFile: File) => Promise<{ avatarUrl: string | null; error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          setProfile(data.profile)
          setSession(data.session)
          // Atualizar token se vier um novo
          if (data.session?.access_token) {
            localStorage.setItem('token', data.session.access_token)
          }
        } else {
          // Token inválido ou expirado
          localStorage.removeItem('token')
          setUser(null)
          setProfile(null)
          setSession(null)
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error)
        localStorage.removeItem('token')
      } finally {
        setLoading(false)
      }
    }
    checkSession()
  }, [])

  // Cadastro de usuário
  const signUp = async (
    email: string, 
    password: string, 
    fullName: string, 
    userType: UserType
  ): Promise<{ error: AuthError | Error | null }> => {
    try {
      console.log('Enviando para o backend:', { email, password: '***', fullName, userType })
      
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, fullName, userType })
      })

      const data = await response.json()
      console.log('Resposta do backend:', response.status, data)

      if (!response.ok) {
        return { error: { message: data.message || data.error || 'Erro ao cadastrar' } }
      }

      // Sucesso
      localStorage.setItem('token', data.session.access_token)
      setUser(data.user)
      setProfile(data.profile)
      setSession(data.session)

      return { error: null }
    } catch (error) {
      console.error('Erro no cadastro:', error)
      return { error: error as Error }
    }
  }

  // Login
  const signIn = async (email: string, password: string): Promise<{ error: AuthError | null }> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: { message: data.message || 'Erro ao fazer login' } }
      }

      // Sucesso
      localStorage.setItem('token', data.session.access_token)
      setUser(data.user)
      setProfile(data.profile)
      setSession(data.session)

      return { error: null }
    } catch (error) {
      console.error('Erro no login:', error)
      return { error: { message: 'Erro de conexão com o servidor' } }
    }
  }

  // Logout
  const signOut = async () => {
    localStorage.removeItem('token')
    setUser(null)
    setProfile(null)
    setSession(null)
  }

  // Atualizar perfil
  const updateProfile = async (updates: Partial<UserProfile>): Promise<{ error: Error | null }> => {
    const token = localStorage.getItem('token')
    if (!token) return { error: new Error('Usuário não autenticado') }

    try {
      const response = await fetch(`${API_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: new Error(data.message || 'Erro ao atualizar perfil') }
      }

      // Atualizar estado local
      if (data.profile) {
        setProfile(data.profile)
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Upload de avatar
  const uploadAvatar = async (imageFile: File): Promise<{ avatarUrl: string | null; error: Error | null }> => {
    const token = localStorage.getItem('token')
    if (!token) return { avatarUrl: null, error: new Error('Usuário não autenticado') }

    try {
      const formData = new FormData()
      formData.append('avatar', imageFile)

      const response = await fetch(`${API_URL}/api/profile/upload-avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // NÃO adicionar Content-Type - o browser define automaticamente para FormData
        },
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        return { avatarUrl: null, error: new Error(data.message || 'Erro ao fazer upload') }
      }

      // Atualizar estado local com o novo perfil
      if (data.profile) {
        setProfile(data.profile)
      }

      return { avatarUrl: data.profile?.avatar_url || null, error: null }
    } catch (error) {
      return { avatarUrl: null, error: error as Error }
    }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    uploadAvatar
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
