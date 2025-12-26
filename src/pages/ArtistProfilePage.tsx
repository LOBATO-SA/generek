import './ArtistProfilePage.css'
import Sidebar from '../components/Sidebar'
import GlobalMusicPlayer from '../components/GlobalMusicPlayer'
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, DollarSign, Star, CheckCircle, Play, Calendar, Briefcase, Instagram, Facebook, Heart, Loader } from 'lucide-react'
import { useMusicPlayer } from '../contexts/MusicPlayerContext'
import type { Song } from '../contexts/MusicPlayerContext'
import type { Artist } from '../types'
import { artistService } from '../services/artistService'

// Extended interface for frontend display if needed, or straight from types
// Assuming API returns songs inside the artist object or we fetch them separately.
// The previous mock had 'artistSongs' separate. Ideally, the backend Artist DTO has 'top_songs'.
// Let's assume the backend provides 'top_songs' or 'songs' based on the plan.
// If strictly following the provided implementation plan, we just use getArtistById.
// I'll add a 'songs' field to the Artist type locally if it's missing in the global type validation or assume we get it.

interface ArtistWithSongs extends Artist {
  songs?: any[] // Todo: Define strict song type from backend
}

function ArtistProfilePage() {
  const { id } = useParams<{ id: string }>()
  const [activeNav, setActiveNav] = useState('artists')
  const { playSong, isLiked, toggleLike } = useMusicPlayer()

  const [artist, setArtist] = useState<ArtistWithSongs | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArtist = async () => {
      if (!id) return
      setLoading(true)
      try {
        const data = await artistService.getArtistById(id)
        setArtist(data)
      } catch (err) {
        console.error('Error fetching artist:', err)
        setError('Erro ao carregar perfil do artista.')
      } finally {
        setLoading(false)
      }
    }
    fetchArtist()
  }, [id])

  // Helper to map backend song to player song
  // Assuming backend returns songs in a property, e.g., 'songs' or we mock it if missing for now purely to avoid crash
  // The guide said: "top_songs (últimas 5 músicas)"
  const songs = (artist as any)?.top_songs || []

  const handlePlaySong = (index: number) => {
    const song = songs[index]
    if (song) {
      const songForPlayer: Song = {
        title: song.title,
        artist: artist?.name || 'Unknown',
        duration: song.duration, // format "MM:SS" ??
        cover: song.cover_url || artist?.avatar_url || '',
        source: song.file_url
      }

      const playlistForPlayer: Song[] = songs.map((s: any) => ({
        title: s.title,
        artist: artist?.name || 'Unknown',
        duration: s.duration,
        cover: s.cover_url || artist?.avatar_url || '',
        source: s.file_url
      }))

      playSong(songForPlayer, playlistForPlayer)
    }
  }

  const handleToggleLike = (song: any) => {
    const songForContext: Song = {
      title: song.title,
      artist: artist?.name || 'Unknown',
      duration: song.duration,
      cover: song.cover_url || artist?.avatar_url || '',
      source: song.file_url
    }
    toggleLike(songForContext)
  }

  const checkIsLiked = (song: any) => {
    const songForContext: Song = {
      title: song.title,
      artist: artist?.name || 'Unknown',
      duration: song.duration,
      cover: song.cover_url || artist?.avatar_url || '',
      source: song.file_url
    }
    return isLiked(songForContext)
  }

  if (loading) {
    return (
      <div className="page-container">
        <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />
        <main className="page-content center-content">
          <Loader size={48} className="animate-spin" />
        </main>
      </div>
    )
  }

  if (error || !artist) {
    return (
      <div className="page-container">
        <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />
        <main className="page-content">
          <div className="error-message">
            <h2>{error || 'Artista não encontrado'}</h2>
            <Link to="/artists" className="back-button">
              <ArrowLeft size={20} />
              Voltar para Artistas
            </Link>
          </div>
        </main>
      </div>
    )
  }


  // Check if profile is complete enough for hiring
  const isProfileComplete = artist &&
    (artist.hourly_rate !== null && artist.hourly_rate !== undefined && artist.hourly_rate > 0) &&
    (artist.bio || artist.about);

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '0';
    return value.toLocaleString('pt-BR');
  };

  const getInfoFallback = (value: string | null | undefined) => {
    return value && value.trim() ? value : 'Sem informação';
  };

  return (
    <div className="page-container">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />

      <main className="page-content artist-profile-layout">
        <div className="artist-content-main">
          {/* Back Button */}
          <Link to="/artists" className="back-link">
            <ArrowLeft size={20} />
            Voltar
          </Link>

          {/* Artist Header */}
          <div className="artist-profile-header">
            <div className="artist-avatar-large">
              <img src={artist.avatar_url || "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/37e5ccfa-f9ee-458b-afa2-dcd85b495e4e"} alt={artist.name} />
              {artist.verified && (
                <div className="verified-badge-large">
                  <CheckCircle size={32} />
                </div>
              )}
            </div>

            <div className="artist-main-info">
              <h1>{artist.name}</h1>
              <p className="artist-genre">{getInfoFallback(artist.genre)}</p>

              <div className="artist-stats">
                <div className="stat">
                  <Star size={18} fill="currentColor" />
                  <span>{artist.rating || 0} ({artist.total_bookings || 0} avaliações)</span>
                </div>
                <div className="stat">
                  <MapPin size={18} />
                  <span>{getInfoFallback(artist.location)}</span>
                </div>
                <div className="stat">
                  <DollarSign size={18} />
                  <span>KZ {formatCurrency(artist.hourly_rate)}/hora</span>
                </div>
              </div>

              {isProfileComplete ? (
                <Link to={`/booking?artist=${artist.id}`} className="hire-button">
                  <Calendar size={20} />
                  Contratar Artista
                </Link>
              ) : (
                <button className="hire-button disabled" title="Perfil incompleto para contratação" disabled>
                  <Calendar size={20} />
                  Contratar Artista (Perfil Incompleto)
                </button>
              )}
            </div>
          </div>

          {/* About Section */}
          <div className="section-card">
            <h2>Sobre</h2>
            <p>{artist.about || artist.bio || 'Sem informação disponível sobre o artista.'}</p>
          </div>

          {/* Popular Songs */}
          <div className="section-card">
            <h2>Músicas Populares</h2>
            <div className="songs-list">
              {songs.length === 0 && <p>Nenhuma música disponível.</p>}
              {songs.map((song: any, index: number) => (
                <div
                  key={song.id || index}
                  className="song-item"
                  onClick={() => handlePlaySong(index)}
                >
                  <div className="song-play-btn">
                    <Play size={16} fill="currentColor" />
                  </div>
                  <div className="song-cover-small">
                    <img src={song.cover_url || artist.avatar_url} alt={song.title} />
                    <button
                      className="like-btn-overlay"
                      onClick={(e) => { e.stopPropagation(); handleToggleLike(song) }}
                      title={checkIsLiked(song) ? 'Remover dos Favoritos' : 'Curtir'}
                    >
                      <Heart size={16} color={checkIsLiked(song) ? '#ef4444' : 'currentColor'} fill={checkIsLiked(song) ? '#ef4444' : 'none'} />
                    </button>
                  </div>
                  <div className="song-details">
                    <h4>{song.title}</h4>
                    <p>{artist.name}</p>
                  </div>
                  <div className="song-plays">
                    {song.plays ? song.plays.toLocaleString('pt-BR') + ' plays' : ''}
                  </div>
                  <div className="song-duration">
                    {song.duration}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Info */}
          <div className="section-card pricing-card">
            <h2>Informações de Contratação</h2>
            <div className="pricing-info">
              <div className="pricing-item">
                <span className="pricing-label">Valor por hora:</span>
                <span className="pricing-value">KZ {formatCurrency(artist.hourly_rate)}</span>
              </div>
              <div className="pricing-item">
                <span className="pricing-label">Duração mínima:</span>
                <span className="pricing-value">3 horas</span>
              </div>
              <div className="pricing-item">
                <span className="pricing-label">Tempo de resposta:</span>
                <span className="pricing-value">24-48 horas</span>
              </div>
            </div>
            {isProfileComplete ? (
              <Link to={`/booking?artist=${artist.id}`} className="hire-button-secondary">
                Solicitar Contratação
              </Link>
            ) : (
              <button className="hire-button-secondary disabled" disabled>
                Perfil Incompleto
              </button>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="artist-sidebar">
          <div className="sidebar-card">
            <h3>Contrate este Artista</h3>

            <div className="sidebar-price">
              <span className="price-label">A partir de</span>
              <div className="price-value">
                <span className="price-currency">KZ</span>
                <span className="price-amount">{formatCurrency(artist.hourly_rate)}</span>
              </div>
              <span className="price-unit">por hora</span>
            </div>

            <div className="sidebar-divider"></div>

            {artist.available_events && artist.available_events.length > 0 && (
              <div className="sidebar-section">
                <h4>Eventos Disponíveis</h4>
                <div className="tags-list">
                  {artist.available_events.map((event, index) => (
                    <span key={index} className="tag">{event}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="sidebar-section">
              <h4><MapPin size={18} /> Localização</h4>
              <p>{getInfoFallback(artist.location)}</p>
            </div>

            {artist.experience && (
              <div className="sidebar-section">
                <h4><Briefcase size={18} /> Experiência</h4>
                <p>{artist.experience}</p>
              </div>
            )}

            {isProfileComplete ? (
              <Link to={`/booking?artist=${artist.id}`} className="sidebar-hire-button">
                <Calendar size={20} />
                Solicitar Contratação
              </Link>
            ) : (
              <button className="sidebar-hire-button disabled" disabled>
                <Calendar size={20} />
                Solicitar Contratação
              </button>
            )}

            {(artist.social_media?.instagram || artist.social_media?.facebook) && (
              <>
                <div className="sidebar-divider"></div>
                <div className="sidebar-section">
                  <h4>Redes Sociais</h4>
                  <div className="social-links">
                    {artist.social_media.instagram && (
                      <a href={`https://instagram.com/${artist.social_media.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="social-link">
                        <Instagram size={18} />
                        {artist.social_media.instagram}
                      </a>
                    )}
                    {artist.social_media.facebook && (
                      <a href={`https://facebook.com/${artist.social_media.facebook}`} target="_blank" rel="noopener noreferrer" className="social-link">
                        <Facebook size={18} />
                        {artist.social_media.facebook}
                      </a>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </aside>
      </main>

      <GlobalMusicPlayer />
    </div>
  )
}

export default ArtistProfilePage
