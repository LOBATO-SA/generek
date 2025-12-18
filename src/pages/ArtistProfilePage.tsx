import './ArtistProfilePage.css'
import Sidebar from '../components/Sidebar'
import GlobalMusicPlayer from '../components/GlobalMusicPlayer'
import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, DollarSign, Star, CheckCircle, Play, Calendar, Briefcase, Instagram, Facebook, Heart } from 'lucide-react'
import { useMusicPlayer } from '../contexts/MusicPlayerContext'
import type { Song } from '../contexts/MusicPlayerContext'

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
  about: string
  available_events: string[]
  experience: string
  instagram?: string
  facebook?: string
}

interface ArtistSong extends Song {
  id: string
  plays: number
}

const mockArtists: Record<string, Artist> = {
  '1': {
    id: '1',
    name: 'Ana Silva',
    avatar_url: 'https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/398875d0-9b9e-494a-8906-210aa3f777e0',
    verified: true,
    hourly_rate: 2500,
    genre: 'Jazz',
    location: 'São Paulo, SP',
    rating: 4.9,
    total_bookings: 127,
    bio: 'Cantora profissional com mais de 10 anos de experiência',
    about: 'Ana Silva é uma cantora renomada de jazz com mais de 10 anos de carreira. Especializada em eventos corporativos, casamentos e festas exclusivas. Seu repertório inclui clássicos do jazz, bossa nova e MPB.',
    available_events: ['Festas', 'Casamentos', 'Corporativos'],
    experience: '10+ anos de carreira',
    instagram: '@anasilvamusic',
    facebook: 'AnaSilvaOficial'
  },
  '2': {
    id: '2',
    name: 'DJ Thunder',
    avatar_url: 'https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/810d1ddc-1168-4990-8d43-a0ffee21fb8c',
    verified: true,
    hourly_rate: 3500,
    genre: 'Eletrônica',
    location: 'Rio de Janeiro, RJ',
    rating: 4.8,
    total_bookings: 89,
    bio: 'DJ especializado em festas e eventos corporativos',
    about: 'DJ Thunder traz energia e profissionalismo para qualquer evento. Com experiência em grandes festas e eventos corporativos, garante uma noite inesquecível com o melhor da música eletrônica.',
    available_events: ['Festas', 'Baladas', 'Eventos'],
    experience: '8+ anos de carreira',
    instagram: '@djthunder',
    facebook: 'DJThunderOficial'
  },
  '3': {
    id: '3',
    name: 'Carlos Mendes',
    avatar_url: 'https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/7bd23b84-d9b0-4604-a7e3-872157a37b61',
    verified: false,
    hourly_rate: 1800,
    genre: 'MPB',
    location: 'Belo Horizonte, MG',
    rating: 4.7,
    total_bookings: 45,
    bio: 'Violonista e cantor de MPB',
    about: 'Carlos Mendes é um talentoso violonista e cantor de MPB. Seu repertório inclui grandes clássicos da música brasileira, ideal para eventos intimistas e sofisticados.',
    available_events: ['Casamentos', 'Eventos intimistas'],
    experience: '5+ anos de carreira',
    instagram: '@carlosmendesmpb'
  }
} 

const artistSongs: Record<string, ArtistSong[]> = {
  '1': [
    {
      id: '1',
      title: 'Fly Me to the Moon',
      artist: 'Ana Silva',
      duration: '3:45',
      cover: 'https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/398875d0-9b9e-494a-8906-210aa3f777e0',
      source: 'https://github.com/ecemgo/mini-samples-great-tricks/raw/main/song-list/Besomorph-Coopex-Redemption.mp3',
      plays: 15420
    },
    {
      id: '2',
      title: 'Garota de Ipanema',
      artist: 'Ana Silva',
      duration: '4:12',
      cover: 'https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/398875d0-9b9e-494a-8906-210aa3f777e0',
      source: 'https://github.com/ecemgo/mini-samples-great-tricks/raw/main/song-list/OSKI-Whats-The-Problem.mp3',
      plays: 12340
    },
    {
      id: '3',
      title: 'Summertime',
      artist: 'Ana Silva',
      duration: '3:58',
      cover: 'https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/398875d0-9b9e-494a-8906-210aa3f777e0',
      source: 'https://github.com/ecemgo/mini-samples-great-tricks/raw/main/song-list/Unknown-BrainxRival-Control.mp3',
      plays: 9870
    }
  ],
  '2': [
    {
      id: '1',
      title: 'Electric Dreams',
      artist: 'DJ Thunder',
      duration: '5:23',
      cover: 'https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/810d1ddc-1168-4990-8d43-a0ffee21fb8c',
      source: 'https://github.com/ecemgo/mini-samples-great-tricks/raw/main/song-list/Besomorph-Coopex-Redemption.mp3',
      plays: 28500
    },
    {
      id: '2',
      title: 'Midnight Pulse',
      artist: 'DJ Thunder',
      duration: '6:15',
      cover: 'https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/810d1ddc-1168-4990-8d43-a0ffee21fb8c',
      source: 'https://github.com/ecemgo/mini-samples-great-tricks/raw/main/song-list/OSKI-Whats-The-Problem.mp3',
      plays: 21300
    }
  ],
  '3': [
    {
      id: '1',
      title: 'Chega de Saudade',
      artist: 'Carlos Mendes',
      duration: '4:05',
      cover: 'https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/7bd23b84-d9b0-4604-a7e3-872157a37b61',
      source: 'https://github.com/ecemgo/mini-samples-great-tricks/raw/main/song-list/Besomorph-Coopex-Redemption.mp3',
      plays: 8900
    }
  ]
}

function ArtistProfilePage() {
  const { id } = useParams<{ id: string }>()
  const [activeNav, setActiveNav] = useState('artists')
  const { playSong, isLiked, toggleLike } = useMusicPlayer()

  const artist = id ? mockArtists[id] : null
  const songs = id ? artistSongs[id] || [] : []

  const handlePlaySong = (index: number) => {
    const song = songs[index]
    if (song) {
      // Converter ArtistSong para Song (removendo campos extras)
      const songForPlayer: Song = {
        title: song.title,
        artist: song.artist,
        duration: song.duration,
        cover: song.cover,
        source: song.source
      }
      const playlistForPlayer: Song[] = songs.map(s => ({
        title: s.title,
        artist: s.artist,
        duration: s.duration,
        cover: s.cover,
        source: s.source
      }))
      playSong(songForPlayer, playlistForPlayer)
    }
  }

  const handleToggleLike = (song: ArtistSong) => {
    const songForContext: Song = {
      title: song.title,
      artist: song.artist,
      duration: song.duration,
      cover: song.cover,
      source: song.source
    }
    toggleLike(songForContext)
  }

  const checkIsLiked = (song: ArtistSong) => {
    const songForContext: Song = {
      title: song.title,
      artist: song.artist,
      duration: song.duration,
      cover: song.cover,
      source: song.source
    }
    return isLiked(songForContext)
  }

  if (!artist) {
    return (
      <div className="page-container">
        <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />
        <main className="page-content">
          <div className="error-message">
            <h2>Artista não encontrado</h2>
            <Link to="/artists" className="back-button">
              <ArrowLeft size={20} />
              Voltar para Artistas
            </Link>
          </div>
        </main>
      </div>
    )
  }

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
              <img src={artist.avatar_url} alt={artist.name} />
              {artist.verified && (
                <div className="verified-badge-large">
                  <CheckCircle size={32} />
                </div>
              )}
            </div>

            <div className="artist-main-info">
              <h1>{artist.name}</h1>
              <p className="artist-genre">{artist.genre}</p>
              
              <div className="artist-stats">
                <div className="stat">
                  <Star size={18} fill="currentColor" />
                  <span>{artist.rating} ({artist.total_bookings} avaliações)</span>
                </div>
                <div className="stat">
                  <MapPin size={18} />
                  <span>{artist.location}</span>
                </div>
                <div className="stat">
                  <DollarSign size={18} />
                  <span>KZ {artist.hourly_rate.toLocaleString('pt-BR')}/hora</span>
                </div>
              </div>

              <Link to={`/booking?artist=${artist.id}`} className="hire-button">
                <Calendar size={20} />
                Contratar Artista
              </Link>
            </div>
          </div>

          {/* About Section */}
          <div className="section-card">
            <h2>Sobre</h2>
            <p>{artist.about}</p>
          </div>

          {/* Popular Songs */}
          <div className="section-card">
            <h2>Músicas Populares</h2>
            <div className="songs-list">
              {songs.map((song, index) => (
                <div 
                  key={song.id} 
                  className="song-item"
                  onClick={() => handlePlaySong(index)}
                >
                  <div className="song-play-btn">
                    <Play size={16} fill="currentColor" />
                  </div>
                  <div className="song-cover-small">
                    <img src={song.cover} alt={song.title} />
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
                    <p>{song.artist}</p>
                  </div>
                  <div className="song-plays">
                    {song.plays.toLocaleString('pt-BR')} plays
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
                <span className="pricing-value">KZ {artist.hourly_rate.toLocaleString('pt-BR')}</span>
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
            <Link to={`/booking?artist=${artist.id}`} className="hire-button-secondary">
              Solicitar Contratação
            </Link>
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
                <span className="price-amount">{artist.hourly_rate.toLocaleString('pt-BR')}</span>
              </div>
              <span className="price-unit">por hora</span>
            </div>

            <div className="sidebar-divider"></div>

            <div className="sidebar-section">
              <h4>Eventos Disponíveis</h4>
              <div className="tags-list">
                {artist.available_events.map((event, index) => (
                  <span key={index} className="tag">{event}</span>
                ))}
              </div>
            </div>

            <div className="sidebar-section">
              <h4><MapPin size={18} /> Localização</h4>
              <p>{artist.location}</p>
            </div>

            <div className="sidebar-section">
              <h4><Briefcase size={18} /> Experiência</h4>
              <p>{artist.experience}</p>
            </div>

            <Link to={`/booking?artist=${artist.id}`} className="sidebar-hire-button">
              <Calendar size={20} />
              Solicitar Contratação
            </Link>

            {(artist.instagram || artist.facebook) && (
              <>
                <div className="sidebar-divider"></div>
                <div className="sidebar-section">
                  <h4>Redes Sociais</h4>
                  <div className="social-links">
                    {artist.instagram && (
                      <a href={`https://instagram.com/${artist.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="social-link">
                        <Instagram size={18} />
                        {artist.instagram}
                      </a>
                    )}
                    {artist.facebook && (
                      <a href={`https://facebook.com/${artist.facebook}`} target="_blank" rel="noopener noreferrer" className="social-link">
                        <Facebook size={18} />
                        {artist.facebook}
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
