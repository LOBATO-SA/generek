import './MusicPlayer.css'
import { Heart, ListPlus } from 'lucide-react'
import { useMusicPlayer } from '../contexts/MusicPlayerContext'

interface GlobalMusicPlayerProps {
  onAddToPlaylist?: () => void
}

function GlobalMusicPlayer({ onAddToPlaylist }: GlobalMusicPlayerProps) {
  const {
    songs,
    currentSongIndex,
    isPlaying,
    progress,
    togglePlay,
    next,
    previous,
    isLiked,
    toggleLike
  } = useMusicPlayer()

  const currentSong = songs[currentSongIndex] || songs[0]
  
  // Se não há nenhuma música, não renderizar o player
  if (!currentSong || songs.length === 0) return null

  // Calculate current time and total duration from progress
  const calculateTime = (progressPercent: number, duration: string) => {
    const [minutes, seconds] = duration.split(':').map(Number)
    const totalSeconds = minutes * 60 + seconds
    const currentSeconds = Math.floor((progressPercent / 100) * totalSeconds)
    const currentMinutes = Math.floor(currentSeconds / 60)
    const remainingSeconds = currentSeconds % 60
    return `${currentMinutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const isCurrentLiked = isLiked(currentSong)

  return (
    <div className="music-player-card">
      <div className="player-container">
        <div className="card-shadow" />
        <div className="glass-effect" />
        <div className="player-content">
          <div className="player-header">
            <div className="album-art">
              <img src={currentSong.cover} alt={currentSong.title} />
              <div className="album-art-ring" />
            </div>
            <div className="song-info">
              <div className="info-content">
                <p className="now-playing">Now Playing</p>
                <p className="song-title">{currentSong.title}</p>
                <p className="song-artist">{currentSong.artist}</p>
              </div>
            </div>
          </div>
          
          <div className="player-controls-section">
            <div className="progress-container">
              <div className="progress-bar-wrapper">
                <div className="progress-bar-bg" />
                <div className="progress-bar-fill" style={{ width: `${progress}%` }}>
                  <div className="progress-gradient" />
                </div>
              </div>
              <div className="time-display">
                <span className="time-current">{calculateTime(progress, currentSong.duration)}</span>
                <span className="time-total">{currentSong.duration}</span>
              </div>
            </div>
            
            <div className="controls-buttons">
              <button className="control-btn" onClick={previous} aria-label="Previous track">
                <div className="btn-shadow" />
                <div className="btn-glass" />
                <div className="btn-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="size-5">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </div>
              </button>
              
              <button className="control-btn" onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"}>
                <div className="btn-shadow" />
                <div className="btn-glass" />
                <div className="btn-icon">
                  {isPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="size-5">
                      <rect width={4} height={16} x={6} y={4} />
                      <rect width={4} height={16} x={14} y={4} />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="size-5">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  )}
                </div>
              </button>
              
              <button className="control-btn" onClick={next} aria-label="Next track">
                <div className="btn-shadow" />
                <div className="btn-glass" />
                <div className="btn-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="size-5">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              </button>

              {/* Botão de Like */}
              <button 
                className="control-btn" 
                onClick={() => toggleLike(currentSong)}
                aria-label={isCurrentLiked ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              >
                <div className="btn-shadow" />
                <div className="btn-glass" />
                <div className="btn-icon">
                  <Heart 
                    size={20} 
                    color={isCurrentLiked ? '#ef4444' : 'currentColor'} 
                    fill={isCurrentLiked ? '#ef4444' : 'none'}
                  />
                </div>
              </button>

              {/* Botão de Adicionar à Playlist */}
              {onAddToPlaylist && (
                <button 
                  className="control-btn" 
                  onClick={onAddToPlaylist}
                  aria-label="Adicionar à playlist"
                >
                  <div className="btn-shadow" />
                  <div className="btn-glass" />
                  <div className="btn-icon">
                    <ListPlus size={20} />
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GlobalMusicPlayer
