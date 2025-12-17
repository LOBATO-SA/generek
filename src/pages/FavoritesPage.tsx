import './Page.css'
import Sidebar from '../components/Sidebar'
import MusicPlayer from '../components/MusicPlayer'
import { useState, useRef, useEffect } from 'react'
import { Heart, Play } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Song {
  title: string
  artist: string
  duration: string
  cover: string
  source: string
}

function FavoritesPage() {
  const [activeNav, setActiveNav] = useState('favorites')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSongIndex, setCurrentSongIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [songs, setSongs] = useState<Song[]>([])
  const audioRef = useRef<HTMLAudioElement>(null)

  // Persisted favorites
  const STORAGE_KEY = 'likedSongs'

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed: Song[] = JSON.parse(saved)
        setSongs(parsed)
      } catch {}
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0)
    }

    audio.addEventListener('timeupdate', updateProgress)
    return () => audio.removeEventListener('timeupdate', updateProgress)
  }, [currentSongIndex])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleNext = () => {
    if (songs.length === 0) return
    setCurrentSongIndex((prev) => (prev + 1) % songs.length)
    setIsPlaying(true)
    setTimeout(() => audioRef.current?.play(), 100)
  }

  const handlePrevious = () => {
    if (songs.length === 0) return
    setCurrentSongIndex((prev) => (prev - 1 + songs.length) % songs.length)
    setIsPlaying(true)
    setTimeout(() => audioRef.current?.play(), 100)
  }

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return
    const newTime = (parseFloat(e.target.value) / 100) * audio.duration
    audio.currentTime = newTime
    setProgress(parseFloat(e.target.value))
  }

  const handleShuffle = () => {
    if (songs.length === 0) return
    const randomIndex = Math.floor(Math.random() * songs.length)
    setCurrentSongIndex(randomIndex)
    setIsPlaying(true)
    setTimeout(() => audioRef.current?.play(), 100)
  }

  // Keep current index in range when list changes
  useEffect(() => {
    if (currentSongIndex >= songs.length) {
      setCurrentSongIndex(Math.max(0, songs.length - 1))
      setIsPlaying(false)
    }
  }, [songs.length])

  const saveFavorites = (list: Song[]) => {
    setSongs(list)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  }

  const isLiked = (song: Song) => {
    return songs.some(s => s.source === song.source)
  }

  const toggleLike = (song: Song) => {
    if (isLiked(song)) {
      const updated = songs.filter(s => s.source !== song.source)
      saveFavorites(updated)
    } else {
      const updated = [...songs, song]
      saveFavorites(updated)
    }
  }

  const playSong = (index: number) => {
    setCurrentSongIndex(index)
    setIsPlaying(true)
    setTimeout(() => audioRef.current?.play(), 100)
  }

  return (
    <div className="page-container">
      {songs.length > 0 && (
        <audio ref={audioRef} src={songs[currentSongIndex]?.source} />
      )}
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />
      
      <main className="page-content">
        <div className="page-header">
          <h1>Favorites</h1>
          <p>Your most loved tracks</p>
        </div>

        <div className="content-section">
          <h2>Liked Songs</h2>
          <p>All your favorite music in one place.</p>

          {songs.length === 0 ? (
            <div className="empty-state">
              <Heart size={64} />
              <h3>Nenhuma música curtida</h3>
              <p>Descubra e curta músicas nas páginas de Descobrir e Perfis para vê-las aqui.</p>
              <div style={{ marginTop: 16 }}>
                <Link to="/search" className="filter-btn active">Ir Pesquisar</Link>
              </div>
            </div>
          ) : (
            <div className="bookings-grid">
              {songs.map((song, idx) => (
                <div key={song.source} className="booking-card">
                  <div style={{ display: 'flex', gap: 16 }}>
                    <img src={song.cover} alt={song.title} style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <h3 style={{ margin: 0, color: '#fff' }}>{song.title}</h3>
                      <p style={{ margin: '6px 0 0 0', color: 'rgba(255,255,255,0.7)' }}>{song.artist}</p>
                      <p style={{ margin: '6px 0 0 0', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{song.duration}</p>
                    </div>
                  </div>

                  <div className="booking-footer" style={{ marginTop: 12 }}>
                    <div />
                    <div className="booking-actions">
                      <button
                        className="action-btn confirm"
                        title="Reproduzir"
                        onClick={() => playSong(idx)}
                      >
                        <Play size={18} />
                      </button>
                      <button
                        className="action-btn cancel"
                        title={isLiked(song) ? 'Remover dos Curtidos' : 'Curtir'}
                        onClick={() => toggleLike(song)}
                      >
                        <Heart size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {songs.length > 0 && (
        <MusicPlayer
          currentSongIndex={currentSongIndex}
          songs={songs}
          isPlaying={isPlaying}
          progress={progress}
          onTogglePlay={togglePlay}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onProgressChange={handleProgressChange}
          onShuffle={handleShuffle}
          isLikedCurrent={isLiked(songs[currentSongIndex])}
          onToggleLike={() => toggleLike(songs[currentSongIndex])}
        />
      )}
    </div>
  )
}

export default FavoritesPage
