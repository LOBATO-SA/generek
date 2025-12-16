import './AuthPage.css'
import Form from './components/Form'
import PlantAnimation from './components/PlantAnimation'
import MusicToggleButton from './components/MusicToggleButton'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function AuthPage() {
  const navigate = useNavigate()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [showContent, setShowContent] = useState(false)
  const [showPlants, setShowPlants] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLogin, setIsLogin] = useState(true)

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

  const handleFormSubmit = (data: { email: string; password: string; name?: string }) => {
    // Lógica de autenticação aqui
    console.log(isLogin ? 'Login:' : 'Sign Up:', data)
    // Simular autenticação bem-sucedida e redirecionar para home
    setTimeout(() => {
      navigate('/home')
    }, 500)
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
              onToggleMode={() => setIsLogin(!isLogin)}
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
