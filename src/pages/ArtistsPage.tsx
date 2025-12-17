import './ArtistsPage.css'
import Sidebar from '../components/Sidebar'
import MusicPlayer from '../components/MusicPlayer'
import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, DollarSign, Star, CheckCircle } from 'lucide-react'

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
}

const mockArtists: Artist[] = [
  {
    id: '1',
    name: 'Ana Silva',
    avatar_url: 'https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/398875d0-9b9e-494a-8906-210aa3f777e0',
    verified: true,
    hourly_rate: 2500,
    genre: 'Jazz',
    location: 'São Paulo, SP',
    rating: 4.9,
    total_bookings: 127,
    bio: 'Cantora profissional com mais de 10 anos de experiência'
  },
  {
    id: '2',
    name: 'DJ Thunder',
    avatar_url: 'https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/810d1ddc-1168-4990-8d43-a0ffee21fb8c',
    verified: true,
    hourly_rate: 3500,
    genre: 'Eletrônica',
    location: 'Rio de Janeiro, RJ',
    rating: 4.8,
    total_bookings: 89,
    bio: 'DJ especializado em festas e eventos corporativos'
  },
  {
    id: '3',
    name: 'Carlos Mendes',
    avatar_url: 'https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/7bd23b84-d9b0-4604-a7e3-872157a37b61',
    verified: false,
    hourly_rate: 1800,
    genre: 'MPB',
    location: 'Belo Horizonte, MG',
    rating: 4.7,
    total_bookings: 45,
    bio: 'Violonista e cantor de MPB'
  }
]

function ArtistsPage() {
  const [activeNav, setActiveNav] = useState('artists')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSongIndex, setCurrentSongIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredArtists, setFilteredArtists] = useState(mockArtists)
  const audioRef = useRef<HTMLAudioElement>(null)

  const songs = [
    {
      title: "Redemption",
      artist: "Besomorph & Coopex",
      duration: "3:45",
      cover: "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/398875d0-9b9e-494a-8906-210aa3f777e0",
      source: "https://github.com/ecemgo/mini-samples-great-tricks/raw/main/song-list/Besomorph-Coopex-Redemption.mp3"
    }
  ]

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0)
    }

    audio.addEventListener('timeupdate', updateProgress)
    return () => audio.removeEventListener('timeupdate', updateProgress)
  }, [currentSongIndex])

  useEffect(() => {
    const filtered = mockArtists.filter(artist =>
      artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredArtists(filtered)
  }, [searchTerm])

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
    setCurrentSongIndex((prev) => (prev + 1) % songs.length)
    setIsPlaying(true)
    setTimeout(() => audioRef.current?.play(), 100)
  }

  const handlePrevious = () => {
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
    const randomIndex = Math.floor(Math.random() * songs.length)
    setCurrentSongIndex(randomIndex)
    setIsPlaying(true)
    setTimeout(() => audioRef.current?.play(), 100)
  }

  return (
    <div className="page-container">
      <audio ref={audioRef} src={songs[currentSongIndex].source} />
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />
      
      <main className="page-content">
        {/* Header */}
        <div className="artists-header">
          <div className="header-content">
            <div>
              <h1>Contrate Artistas</h1>
              <p>Encontre o artista perfeito para o seu evento</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-section">
          <div className="search-bar-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome, gênero ou localização..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Artists Grid */}
        <div className="artists-grid">
          {filteredArtists.length === 0 ? (
            <div className="no-results">
              <Search size={48} />
              <h3>Nenhum artista encontrado</h3>
              <p>Tente buscar com outros termos</p>
            </div>
          ) : (
            filteredArtists.map((artist) => (
              <Link key={artist.id} to={`/artists/${artist.id}`} className="artist-card">
                <div className="artist-image">
                  <img src={artist.avatar_url} alt={artist.name} />
                  {artist.verified && (
                    <div className="verified-badge">
                      <CheckCircle size={20} />
                    </div>
                  )}
                </div>
                
                <div className="artist-info">
                  <div className="artist-header">
                    <h3>{artist.name}</h3>
                    <div className="rating">
                      <Star size={16} fill="currentColor" />
                      <span>{artist.rating}</span>
                    </div>
                  </div>
                  
                  <p className="genre">{artist.genre}</p>
                  
                  <div className="artist-details">
                    <div className="detail">
                      <MapPin size={14} />
                      <span>{artist.location}</span>
                    </div>
                    <div className="detail">
                      <DollarSign size={14} />
                      <span>R$ {artist.hourly_rate.toLocaleString('pt-BR')}/h</span>
                    </div>
                  </div>
                  
                  <p className="bio">{artist.bio}</p>
                  
                  <div className="bookings-count">
                    {artist.total_bookings} contratações
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>

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
      />
    </div>
  )
}

export default ArtistsPage
