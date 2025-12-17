import './MusicPlayer.css'
import { Heart } from 'lucide-react'

interface MusicPlayerProps {
  currentSongIndex: number
  songs: Array<{
    title: string
    artist: string
    duration: string
    cover: string
    source: string
  }>
  isPlaying: boolean
  progress: number
  onTogglePlay: () => void
  onNext: () => void
  onPrevious: () => void
  onProgressChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onShuffle: () => void
  isLikedCurrent?: boolean
  onToggleLike?: () => void
}

function MusicPlayer({ 
  currentSongIndex, 
  songs, 
  isPlaying, 
  progress, 
  onTogglePlay, 
  onNext, 
  onPrevious, 
  isLikedCurrent = false,
  onToggleLike
}: MusicPlayerProps) {
  const currentSong = songs[currentSongIndex]
  
  // Calculate current time and total duration from progress
  const calculateTime = (progressPercent: number, duration: string) => {
    const [minutes, seconds] = duration.split(':').map(Number)
    const totalSeconds = minutes * 60 + seconds
    const currentSeconds = Math.floor((progressPercent / 100) * totalSeconds)
    const currentMinutes = Math.floor(currentSeconds / 60)
    const remainingSeconds = currentSeconds % 60
    return `${currentMinutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

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
              <button className="control-btn" onClick={onPrevious} aria-label="Previous track">
                <div className="btn-shadow" />
                <div className="btn-glass" />
                <div className="btn-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="size-5">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </div>
              </button>
              
              <button className="control-btn" onClick={onTogglePlay} aria-label={isPlaying ? "Pause" : "Play"}>
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

              <button className="control-btn" onClick={onToggleLike} aria-label={isLikedCurrent ? "Remover dos favoritos" : "Curtir"}>
                <div className="btn-shadow" />
                <div className="btn-glass" />
                <div className="btn-icon">
                  <Heart size={20} color={isLikedCurrent ? '#ef4444' : 'currentColor'} fill={isLikedCurrent ? '#ef4444' : 'none'} />
                </div>
              </button>
              
              <button className="control-btn" onClick={onNext} aria-label="Next track">
                <div className="btn-shadow" />
                <div className="btn-glass" />
                <div className="btn-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="size-5">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
        <div className="hover-gradient" />
      </div>
    </div>
  )
}

export default MusicPlayer
