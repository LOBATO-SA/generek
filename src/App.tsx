import './App.css'
import Button from './components/Button'
import PlantAnimation from './components/PlantAnimation'
import MusicToggleButton from './components/MusicToggleButton'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function App() {
  const navigate = useNavigate()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [started, setStarted] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [showHeader, setShowHeader] = useState(false)
  const [showPlants, setShowPlants] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const handleStart = async () => {
    if (audioRef.current) {
      try {
        await audioRef.current.play()
        setStarted(true)
        setIsPlaying(true)
        startAnimationSequence()
      } catch (error) {
        console.log('Erro ao reproduzir áudio:', error)
        // Iniciar animações mesmo se o áudio falhar
        setStarted(true)
        startAnimationSequence()
      }
    }
  }

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

  const startAnimationSequence = () => {
    // 1. Mostrar conteúdo central após 500ms
    setTimeout(() => {
      setShowContent(true)
    }, 500)

    // 2. Mostrar header após 1.5s
    setTimeout(() => {
      setShowHeader(true)
    }, 1500)

    // 3. Mostrar plantas após 2s
    setTimeout(() => {
      setShowPlants(true)
    }, 2000)
  }

  return (
    <div className="landing-page">
      {/* Background Music */}
      <audio ref={audioRef} loop>
        <source src="/music/house.mp3" type="audio/mpeg" />
      </audio>

      {/* Disco Image Background */}
      <div className="disco-background">
        <img src="/images/pexels.png" alt="Disco" className="disco-image" />
      </div>

      {/* Start Screen */}
      {!started && (
        <div className="start-screen">
          <div className="start-content">
            <h1 className="start-logo">Generek</h1>
            <p className="start-subtitle">Conecte-se aos melhores artistas</p>
            <div className="start-button-wrapper">
              <Button onClick={handleStart}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  Iniciar Experiência
                </span>
              </Button>
            </div>
            
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`header ${showHeader ? 'header-visible' : ''}`}>
        <div className="header-content">
          <h1 className="logo">Generek</h1>
          <nav className="nav">
            <a onClick={() => navigate('/auth')} className="nav-link">Entrar</a>
            <a onClick={() => navigate('/auth')} className="nav-link">Cadastrar</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className={`hero-content ${showContent ? 'content-visible' : ''}`}>
          <h2 className="hero-title">Os Artistas Mais Talentosos ao Alcance de Um Clique</h2>
          <p className="hero-description">
            A plataforma de streaming que conecta você aos melhores artistas.
            Simplifique a contratação e transforme seus eventos em experiências inesquecíveis.
          </p>
          <div className="hero-buttons">
            <Button onClick={() => navigate('/auth')}>Começar Agora</Button>
          </div>
          {/* Music Control Button */}
            {started && (
              <div className="music-control-start">
                <MusicToggleButton isPlaying={isPlaying} onToggle={toggleMusic} size={30} />
              </div>
            )}
        </div>
        
        {/* Plant Animations */}
        <div className={`plant-left ${showPlants ? 'plant-visible' : ''}`}>
          <PlantAnimation />
        </div>
        <div className={`plant-right ${showPlants ? 'plant-visible' : ''}`}>
          <PlantAnimation />
        </div>
      </section>
    </div>
  )
}

export default App
