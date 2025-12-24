import './ArtistsPage.css'
import Sidebar from '../components/Sidebar'
import GlobalMusicPlayer from '../components/GlobalMusicPlayer'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  MapPin,
  Star,
  CheckCircle,
  Users,
  Filter,
  Music,
  Calendar,
  ArrowRight,
  Loader
} from 'lucide-react'
import type { Artist } from '../types'
import { artistService } from '../services/artistService'

const genres = ['Todos', 'Jazz', 'Electrónica', 'Pop', 'Acústico', 'Hip Hop', 'Funk & Soul']

function ArtistsPage() {
  const [activeNav, setActiveNav] = useState('artists')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('Todos')
  const [showFilters, setShowFilters] = useState(false)

  // Api State
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const fetchArtists = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await artistService.getArtists({
          search: searchTerm,
          genre: selectedGenre !== 'Todos' ? selectedGenre : undefined
        })
        setArtists(response.artists)
        setTotal(response.total)
      } catch (err) {
        console.error('Failed to fetch artists:', err)
        setError('Não foi possível carregar os artistas. Tente novamente mais tarde.')
      } finally {
        setLoading(false)
      }
    }

    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchArtists()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedGenre])

  return (
    <div className="page-container">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />

      <main className="page-content">
        {/* Header */}
        <div className="artists-page-header">
          <div className="header-text">
            <h1>Artistas</h1>
            <p>Encontre o artista perfeito para o seu evento</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="search-filters-section">
          <div className="search-bar-wrapper">
            <Search className="search-icon" size={22} />
            <input
              type="text"
              placeholder="Pesquisar artistas por nome, género ou localização..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button className="search-submit-btn">
              <Search size={18} />
              <span>Pesquisar</span>
            </button>
            <button
              className={`filter-toggle ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={20} />
            </button>
          </div>

          {/* Genre Filters */}
          <div className={`genre-filters ${showFilters ? 'show' : ''}`}>
            {genres.map(genre => (
              <button
                key={genre}
                className={`genre-btn ${selectedGenre === genre ? 'active' : ''}`}
                onClick={() => setSelectedGenre(genre)}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="stats-bar">
          <div className="stat-item">
            <Users size={18} />
            <span>{total > 100 ? `${total}+` : total} Artistas</span>
          </div>
          <div className="stat-item">
            <Calendar size={18} />
            <span>500+ Eventos</span>
          </div>
          <div className="stat-item">
            <Star size={18} />
            <span>4.8 Avaliação Média</span>
          </div>
        </div>

        {/* Results Count */}
        <div className="results-info">
          <Music size={20} />
          <span>
            {artists.length} artista{artists.length !== 1 ? 's' : ''} encontrado{artists.length !== 1 ? 's' : ''}
            {selectedGenre !== 'Todos' && ` em ${selectedGenre}`}
          </span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <Loader size={32} className="animate-spin" />
            <p>Carregando artistas...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-message-block">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="retry-btn"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {/* Artists Grid */}
        {!loading && !error && (
          <div className="artists-grid">
            {artists.length === 0 ? (
              <div className="no-results">
                <Search size={64} />
                <h3>Nenhum artista encontrado</h3>
                <p>Tente pesquisar com outros termos ou limpe os filtros</p>
                <button className="clear-btn" onClick={() => { setSearchTerm(''); setSelectedGenre('Todos'); }}>
                  Limpar Filtros
                </button>
              </div>
            ) : (
              artists.map((artist) => (
                <Link key={artist.id} to={`/artists/${artist.id}`} className="artist-card">
                  <div className="artist-image">
                    <img src={artist.avatar_url || '/default-avatar.png'} alt={artist.name} />
                    {artist.verified && (
                      <div className="verified-badge">
                        <CheckCircle size={18} />
                      </div>
                    )}
                    {artist.available && (
                      <div className="available-badge">Disponível</div>
                    )}
                    <div className="artist-overlay">
                      <span className="view-profile">
                        Ver Perfil
                        <ArrowRight size={16} />
                      </span>
                    </div>
                  </div>

                  <div className="artist-info">
                    <div className="artist-top">
                      <div>
                        <h3>{artist.name}</h3>
                        <span className="genre-tag">{artist.genre}</span>
                      </div>
                      <div className="rating">
                        <Star size={16} fill="currentColor" />
                        <span>{artist.rating}</span>
                      </div>
                    </div>

                    <p className="bio">{artist.bio}</p>

                    <div className="artist-meta">
                      <div className="meta-item">
                        <MapPin size={14} />
                        <span>{artist.location}</span>
                      </div>
                      <div className="meta-item">
                        <Users size={14} />
                        <span>{(artist.followers || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="artist-footer">
                      <div className="price">
                        <span className="currency">Kz</span>
                        <span>{(artist.hourly_rate || 0).toLocaleString('pt-AO')}</span>
                        <span className="per-hour">/h</span>
                      </div>
                      <div className="bookings">
                        {artist.total_bookings} contratações
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </main>

      <GlobalMusicPlayer />
    </div>
  )
}

export default ArtistsPage
