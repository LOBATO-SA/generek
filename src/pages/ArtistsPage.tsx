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
  ArrowRight
} from 'lucide-react'

interface Artist {
  id: string
  name: string
  avatar_url: string
  verified: boolean
  hourly_rate: number
  genre: string
  location: string
  rating: number
  total_bookings: number
  bio: string
  followers?: number
  available?: boolean
}

const mockArtists: Artist[] = [
  {
    id: '1',
    name: 'Ana Silva',
    avatar_url: 'https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/398875d0-9b9e-494a-8906-210aa3f777e0',
    verified: true,
    hourly_rate: 25000,
    genre: 'Jazz',
    location: 'Luanda',
    rating: 4.9,
    total_bookings: 127,
    bio: 'Cantora profissional com mais de 10 anos de experiência em jazz e soul',
    followers: 15420,
    available: true
  },
  {
    id: '2',
    name: 'DJ Thunder',
    avatar_url: 'https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/810d1ddc-1168-4990-8d43-a0ffee21fb8c',
    verified: true,
    hourly_rate: 35000,
    genre: 'Electrónica',
    location: 'Benguela',
    rating: 4.8,
    total_bookings: 89,
    bio: 'DJ especializado em festas e eventos corporativos com experiência internacional',
    followers: 28300,
    available: true
  },
  {
    id: '3',
    name: 'Carlos Mendes',
    avatar_url: 'https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/7bd23b84-d9b0-4604-a7e3-872157a37b61',
    verified: false,
    hourly_rate: 18000,
    genre: 'Acústico',
    location: 'Huambo',
    rating: 4.7,
    total_bookings: 45,
    bio: 'Guitarrista e cantor especializado em performances acústicas',
    followers: 8750,
    available: false
  },
  {
    id: '4',
    name: 'Luna Star',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    verified: true,
    hourly_rate: 40000,
    genre: 'Pop',
    location: 'Lubango',
    rating: 5.0,
    total_bookings: 203,
    bio: 'Estrela pop em ascensão conhecida por performances ao vivo energéticas',
    followers: 52100,
    available: true
  },
  {
    id: '5',
    name: 'Banda Groove',
    avatar_url: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400',
    verified: true,
    hourly_rate: 55000,
    genre: 'Funk & Soul',
    location: 'Luanda',
    rating: 4.9,
    total_bookings: 156,
    bio: 'Banda de 5 membros trazendo o melhor do funk e soul para os seus eventos',
    followers: 34200,
    available: true
  },
  {
    id: '6',
    name: 'MC Flow',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    verified: false,
    hourly_rate: 22000,
    genre: 'Hip Hop',
    location: 'Cabinda',
    rating: 4.6,
    total_bookings: 67,
    bio: 'Artista de hip hop e MC para festas e eventos especiais',
    followers: 12800,
    available: true
  }
]

const genres = ['Todos', 'Jazz', 'Electrónica', 'Pop', 'Acústico', 'Hip Hop', 'Funk & Soul']

function ArtistsPage() {
  const [activeNav, setActiveNav] = useState('artists')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('Todos')
  const [filteredArtists, setFilteredArtists] = useState(mockArtists)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    let filtered = mockArtists.filter(artist =>
      artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    if (selectedGenre !== 'Todos') {
      filtered = filtered.filter(artist => artist.genre === selectedGenre)
    }
    
    setFilteredArtists(filtered)
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
            <span>{mockArtists.length}+ Artistas</span>
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
            {filteredArtists.length} artista{filteredArtists.length !== 1 ? 's' : ''} encontrado{filteredArtists.length !== 1 ? 's' : ''}
            {selectedGenre !== 'Todos' && ` em ${selectedGenre}`}
          </span>
        </div>

        {/* Artists Grid */}
        <div className="artists-grid">
          {filteredArtists.length === 0 ? (
            <div className="no-results">
              <Search size={64} />
              <h3>Nenhum artista encontrado</h3>
              <p>Tente pesquisar com outros termos ou limpe os filtros</p>
              <button className="clear-btn" onClick={() => { setSearchTerm(''); setSelectedGenre('Todos'); }}>
                Limpar Filtros
              </button>
            </div>
          ) : (
            filteredArtists.map((artist) => (
              <Link key={artist.id} to={`/artists/${artist.id}`} className="artist-card">
                <div className="artist-image">
                  <img src={artist.avatar_url} alt={artist.name} />
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
                      <span>{artist.hourly_rate.toLocaleString('pt-AO')}</span>
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
      </main>

      <GlobalMusicPlayer />
    </div>
  )
}

export default ArtistsPage
