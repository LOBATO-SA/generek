import './AuthPage.css'
import Form from './components/Form'
import PlantAnimation from './components/PlantAnimation'
import MusicToggleButton from './components/MusicToggleButton'
import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext.tsx'
import type { UserType } from './types'

function AuthPage() {
  const navigate = useNavigate()
  const { signIn, signUp, user, loading: authLoading } = useAuth()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/home')
    }
  }, [user, authLoading, navigate])

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const handleFormSubmit = async (data: { email: string; password: string; name?: string; userType?: UserType }) => {
    if (loading) return // Evitar múltiplos cliques
    
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    // Timeout de segurança para garantir que o loading não fique preso
    const safetyTimeout = setTimeout(() => {
      if (loading) {
        console.warn('Timeout de segurança atingido. Forçando parada do loading.')
        setLoading(false)
        setError('A operação demorou muito. Verifique sua conexão e tente novamente.')
      }
    }, 15000) // 15 segundos

    try {
      if (isLogin) {
        // Login
        console.log('AuthPage: Tentando login...')
        const { error } = await signIn(data.email, data.password)
        console.log('AuthPage: Resultado login:', { error })
        
        if (error) {
          console.error('AuthPage: Erro no login:', error)
          setError(getErrorMessage(error.message))
        } else {
          console.log('AuthPage: Login sucesso, redirecionando...')
          navigate('/home')
        }
      } else {
        // Cadastro
        if (!data.name || !data.userType) {
          setError('Por favor, preencha todos os campos')
          clearTimeout(safetyTimeout)
          setLoading(false)
          return
        }

        console.log('AuthPage: Tentando cadastro...')
        const result = await signUp(data.email, data.password, data.name, data.userType)
        console.log('AuthPage: Resultado cadastro:', result)
        
        if (result.error) {
          console.error('AuthPage: Erro no cadastro:', result.error)
          setError(getErrorMessage(result.error.message))
        } else {
          // Sucesso no cadastro
          console.log('AuthPage: Cadastro bem-sucedido!')
          setSuccessMessage('Conta criada com sucesso! Verifique seu email para confirmar o cadastro (pode estar no spam).')
          setIsLogin(true) // Voltar para tela de login
        }
      }
    } catch (err: any) {
      console.error('AuthPage: Exceção não tratada:', err)
      setError(getErrorMessage(err.message || 'Ocorreu um erro inesperado.'))
    } finally {
      clearTimeout(safetyTimeout)
      // Só desativa o loading se não navegou (se navegou, o componente vai desmontar de qualquer jeito)
      // Mas por segurança, desativamos.
      setLoading(false)
      console.log('AuthPage: Loading desativado')
    }
  }

  // Traduzir mensagens de erro
  const getErrorMessage = (message: string): string => {
    return message || 'Ocorreu um erro desconhecido.'
  }

  return (
    <div className="auth-page">
      {/* Background Music */}
      <audio ref={audioRef} loop>
        <source src="/music/house.mp3" type="audio/mpeg" />
      </audio>

      {/* Disco Image Background */}
      <div className="disco-background">
        <img src="/images/pexels.png" alt="Disco" className="disco-image" />
      </div>

      {/* Music Control Button */}
      <div className="music-control-auth">
        <MusicToggleButton isPlaying={isPlaying} onToggle={toggleMusic} size={35} />
      </div>

      {/* Auth Content */}
      <div className="auth-content">
        <div className="auth-container">
          <h1 className="auth-logo">Generek</h1>
          <p className="auth-subtitle">
            {isLogin ? 'Entre na sua conta' : 'Crie sua conta'}
          </p>
          
          <div className="form-wrapper">
            <Form 
              isLogin={isLogin} 
              onSubmit={handleFormSubmit}
              onToggleMode={() => {
                setIsLogin(!isLogin)
                setError(null)
                setSuccessMessage(null)
              }}
              loading={loading}
              error={error}
              successMessage={successMessage}
            />
          </div>
        </div>
      </div>

      {/* Plant Animations */}
      <div className="plant-left plant-visible">
        <PlantAnimation />
      </div>
      <div className="plant-right plant-visible">
        <PlantAnimation />
      </div>
    </div>
  )
}

export default AuthPage
