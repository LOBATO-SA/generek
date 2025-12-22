import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.tsx'
import type { UserType } from '../types'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  allowedUserTypes?: UserType[]
}

export function ProtectedRoute({ children, allowedUserTypes }: ProtectedRouteProps) {
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

  // Verificar tipo de usuário se especificado
  if (allowedUserTypes && profile && !allowedUserTypes.includes(profile.user_type)) {
    // Redirecionar para home se não tiver permissão
    return <Navigate to="/home" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
