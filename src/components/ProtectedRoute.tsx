import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.tsx'
import type { UserType } from '../types'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  allowedUserTypes?: UserType[]
  requiredUserType?: UserType
}

export function ProtectedRoute({ children, allowedUserTypes, requiredUserType }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#0a0a0a',
        color: 'white'
      }}>
        <div className="loading-spinner">Carregando...</div>
      </div>
    )
  }

  // Redirecionar para login se não estiver autenticado
  if (!user) {
    return <Navigate to="/auth" replace />
  }

  // Verificar tipo de usuário se especificado (allowedUserTypes - array)
  if (allowedUserTypes && profile && !allowedUserTypes.includes(profile.user_type)) {
    return <Navigate to="/home" replace />
  }

  // Verificar tipo de usuário se especificado (requiredUserType - único)
  if (requiredUserType && profile && profile.user_type !== requiredUserType) {
    return <Navigate to="/home" replace />
  }

  return <>{children}</>
}
