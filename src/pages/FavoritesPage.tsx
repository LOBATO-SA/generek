import './FavoritesPage.css'
import Sidebar from '../components/Sidebar'
import GlobalMusicPlayer from '../components/GlobalMusicPlayer'
import { useState } from 'react'
import { Heart, Play, Pause, LayoutGrid, List, Music, Clock, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMusicPlayer } from '../contexts/MusicPlayerContext'

type ViewMode = 'cards' | 'list'

function FavoritesPage() {
  const [activeNav, setActiveNav] = useState('favorites')
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const { likedSongs, toggleLike, playSong, songs, currentSongIndex, isPlaying, togglePlay } = useMusicPlayer()

  const currentSong = songs[currentSongIndex]

  const handlePlaySong = (index: number) => {
    const song = likedSongs[index]
    if (song) {
      if (currentSong?.title === song.title && currentSong?.artist === song.artist) {
        togglePlay()
      } else {
        playSong(song, likedSongs)
      }
    }
  }

  const isCurrentlyPlaying = (song: typeof likedSongs[0]) => {
    return currentSong?.title === song.title && currentSong?.artist === song.artist && isPlaying
  }

  return (
    <div className="page-container">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />
      
      <main className="page-content">
        <div className="favorites-header">
          <div className="header-info">
            <div className="favorites-icon">
              <Heart size={32} fill="#ff4d6d" />
            </div>
            <div>
              <h1>Músicas Curtidas</h1>
              <p>{likedSongs.length} {likedSongs.length === 1 ? 'música' : 'músicas'}</p>
            </div>
          </div>
          
          {likedSongs.length > 0 && (
            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
                onClick={() => setViewMode('cards')}
                title="Visualização em Cards"
              >
                <LayoutGrid size={20} />
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="Visualização em Lista"
              >
                <List size={20} />
              </button>
            </div>
          )}
        </div>

        {likedSongs.length === 0 ? (
          <div className="empty-favorites">
            <div className="empty-icon">
              <Heart size={80} />
            </div>
            <h3>Nenhuma música curtida</h3>
            <p>Descubra e curta músicas para vê-las aqui</p>
            <Link to="/search" className="discover-btn">
              <Music size={20} />
              Descobrir Músicas
            </Link>
          </div>
        ) : viewMode === 'cards' ? (
          /* Cards View */
          <div className="favorites-cards-grid">
            {likedSongs.map((song, idx) => (
              <div 
                key={song.source} 
                className={`favorite-card ${isCurrentlyPlaying(song) ? 'playing' : ''}`}
              >
                <div className="card-cover" onClick={() => handlePlaySong(idx)}>
                  <img src={song.cover} alt={song.title} />
                  <div className="card-play-overlay">
                    {isCurrentlyPlaying(song) ? (
                      <Pause size={32} />
                    ) : (
                      <Play size={32} />
                    )}
                  </div>
                  {isCurrentlyPlaying(song) && (
                    <div className="playing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  )}
                </div>
                <div className="card-info">
                  <h3>{song.title}</h3>
                  <p>{song.artist}</p>
                </div>
                <div className="card-actions">
                  <span className="duration">{song.duration}</span>
                  <button
                    className="remove-btn"
                    title="Remover dos Curtidos"
                    onClick={() => toggleLike(song)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="favorites-list">
            <div className="list-header">
              <span className="col-num">#</span>
              <span className="col-title">Título</span>
              <span className="col-duration"><Clock size={16} /></span>
              <span className="col-actions"></span>
            </div>
            {likedSongs.map((song, idx) => (
              <div 
                key={song.source} 
                className={`list-item ${isCurrentlyPlaying(song) ? 'playing' : ''}`}
              >
                <span className="col-num">
                  {isCurrentlyPlaying(song) ? (
                    <div className="playing-bars">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  ) : (
                    <span className="track-num">{idx + 1}</span>
                  )}
                  <button className="play-btn" onClick={() => handlePlaySong(idx)}>
                    {isCurrentlyPlaying(song) ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                </span>
                <div className="col-title">
                  <img src={song.cover} alt={song.title} className="list-cover" />
                  <div className="track-info">
                    <h4>{song.title}</h4>
                    <p>{song.artist}</p>
                  </div>
                </div>
                <span className="col-duration">{song.duration}</span>
                <div className="col-actions">
                  <button
                    className={`like-btn liked`}
                    onClick={() => toggleLike(song)}
                    title="Remover dos Curtidos"
                  >
                    <Heart size={18} fill="currentColor" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <GlobalMusicPlayer />
    </div>
  )
}

export default FavoritesPage
