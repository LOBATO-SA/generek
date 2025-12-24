import './SearchPage.css'
import Sidebar from '../components/Sidebar'
import GlobalMusicPlayer from '../components/GlobalMusicPlayer'
import { useState, useEffect } from 'react'
import { useMusicPlayer, defaultSongs } from '../contexts/MusicPlayerContext'
import type { Song } from '../contexts/MusicPlayerContext'
import { songService } from '../services/songService'
import { Search, Play, Pause, Music, User, Disc, TrendingUp, Clock, Heart, Mic2, Loader } from 'lucide-react'
import { Link } from 'react-router-dom'

// Categorias de busca
const categories = [
  { id: 'all', name: 'Tudo', icon: Search },
  { id: 'songs', name: 'Músicas', icon: Music },
  { id: 'artists', name: 'Artistas', icon: User },
  { id: 'albums', name: 'Álbuns', icon: Disc },
]

// Gêneros populares
const genres = [
  { name: 'Pop', color: '#E91E63', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300' },
  { name: 'Rock', color: '#9C27B0', image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300' },
  { name: 'Hip Hop', color: '#FF5722', image: 'https://images.unsplash.com/photo-1571609860754-01a3e5e2c880?w=300' },
  { name: 'Jazz', color: '#3F51B5', image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=300' },
  { name: 'Eletrônica', color: '#00BCD4', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300' },
  { name: 'MPB', color: '#4CAF50', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300' },
  { name: 'Sertanejo', color: '#FF9800', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300' },
  { name: 'Funk', color: '#F44336', image: 'https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?w=300' },
]

// Artistas em alta (mock for now)
const trendingArtists = [
  { id: '1', name: 'Ana Silva', genre: 'Jazz', image: 'https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/398875d0-9b9e-494a-8906-210aa3f777e0' },
  { id: '2', name: 'DJ Thunder', genre: 'Eletrônica', image: 'https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/810d1ddc-1168-4990-8d43-a0ffee21fb8c' },
  { id: '3', name: 'Carlos Mendes', genre: 'MPB', image: 'https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/7bd23b84-d9b0-4604-a7e3-872157a37b61' },
]

function SearchPage() {
  const [activeNav, setActiveNav] = useState('search')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [hasSearched, setHasSearched] = useState(false)

  const { playSong, isPlaying, currentSongIndex, togglePlay, isLiked, toggleLike, songs: playerSongs } = useMusicPlayer()

  // API Songs State
  const [songs, setSongs] = useState<Song[]>(defaultSongs)
  const [loadingSongs, setLoadingSongs] = useState(true)
  const [searchResults, setSearchResults] = useState<Song[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  // Fetch all songs on mount
  useEffect(() => {
    const fetchSongs = async () => {
      setLoadingSongs(true)
      try {
        const apiSongs = await songService.getSongs()
        setSongs([...defaultSongs, ...apiSongs])
      } catch (error) {
        console.error('Error fetching songs:', error)
        setSongs(defaultSongs)
      } finally {
        setLoadingSongs(false)
      }
    }
    fetchSongs()
  }, [])

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      setHasSearched(true)
      setSearchLoading(true)
      try {
        // Fetch from API
        const apiResults = await songService.getSongs({ search: searchTerm })

        // Also search in defaultSongs locally
        const mockResults = defaultSongs.filter(song =>
          song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchTerm.toLowerCase())
        )

        // Merge results
        setSearchResults([...mockResults, ...apiResults])
      } catch (error) {
        console.error('Error searching songs:', error)
        // Fallback to local filter of already loaded songs
        setSearchResults(songs.filter(song =>
          song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      } finally {
        setSearchLoading(false)
      }
    }
  }

  const handleGenreClick = async (genreName: string) => {
    setSearchTerm(genreName)
    setHasSearched(true)
    setSearchLoading(true)
    try {
      const results = await songService.getSongs({ genre: genreName })
      setSearchResults(results)
    } catch (error) {
      console.error('Error fetching genre:', error)
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // Filter artists locally (API doesn't have artist search yet)
  const filteredArtists = hasSearched
    ? trendingArtists.filter(artist =>
      artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.genre.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : trendingArtists

  const currentSong = playerSongs[currentSongIndex]
  const displaySongs = hasSearched ? searchResults : songs

  return (
    <div className="page-container">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />

      <main className="page-content">
        {/* Header */}
        <div className="search-page-header">
          <h1>Pesquisar</h1>
          <p>Encontre músicas, artistas e muito mais</p>
        </div>

        {/* Search Bar with Button */}
        <div className="search-input-container">
          <div className="search-input-wrapper">
            <Search className="search-input-icon" size={22} />
            <input
              type="text"
              placeholder="O que você quer ouvir?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="search-main-input"
            />
          </div>
          <button className="search-button" onClick={handleSearch} disabled={searchLoading}>
            {searchLoading ? <Loader size={20} className="animate-spin" /> : <Search size={20} />}
            <span>Pesquisar</span>
          </button>
        </div>

        {/* Categories */}
        <div className="search-categories">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <cat.icon size={18} />
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Content based on search state */}
        {!hasSearched && !searchTerm ? (
          <>
            {/* Browse Genres */}
            <section className="search-section">
              <div className="section-header">
                <h2>Explorar por Gênero</h2>
              </div>
              <div className="genres-grid">
                {genres.map((genre) => (
                  <div
                    key={genre.name}
                    className="genre-card"
                    style={{ backgroundColor: genre.color, cursor: 'pointer' }}
                    onClick={() => handleGenreClick(genre.name)}
                  >
                    <span className="genre-name">{genre.name}</span>
                    <img src={genre.image} alt={genre.name} className="genre-image" />
                  </div>
                ))}
              </div>
            </section>

            {/* Trending Artists */}
            <section className="search-section">
              <div className="section-header">
                <TrendingUp size={24} />
                <h2>Artistas em Alta</h2>
              </div>
              <div className="trending-artists-grid">
                {trendingArtists.map((artist) => (
                  <Link key={artist.id} to={`/artists/${artist.id}`} className="trending-artist-card">
                    <div className="artist-avatar">
                      <img src={artist.image} alt={artist.name} />
                    </div>
                    <h3>{artist.name}</h3>
                    <span className="artist-genre">{artist.genre}</span>
                  </Link>
                ))}
              </div>
            </section>

            {/* Available Songs */}
            <section className="search-section">
              <div className="section-header">
                <Clock size={24} />
                <h2>Músicas Disponíveis</h2>
              </div>
              {loadingSongs ? (
                <div className="loading-songs" style={{ textAlign: 'center', padding: '40px' }}>
                  <Loader size={32} className="animate-spin" />
                  <p>Carregando músicas...</p>
                </div>
              ) : (
                <div className="songs-list">
                  {songs.map((song, index) => (
                    <div
                      key={index}
                      className={`song-item ${currentSong?.title === song.title && isPlaying ? 'playing' : ''}`}
                    >
                      <div className="song-cover" onClick={() => playSong(song, songs)}>
                        <img src={song.cover} alt={song.title} />
                        <div className="song-play-overlay">
                          {currentSong?.title === song.title && isPlaying ? (
                            <Pause size={24} onClick={(e) => { e.stopPropagation(); togglePlay(); }} />
                          ) : (
                            <Play size={24} />
                          )}
                        </div>
                      </div>
                      <div className="song-info">
                        <h4>{song.title}</h4>
                        <p>{song.artist}</p>
                      </div>
                      <span className="song-duration">{song.duration}</span>
                      <button
                        className={`like-btn ${isLiked(song) ? 'liked' : ''}`}
                        onClick={() => toggleLike(song)}
                      >
                        <Heart size={20} fill={isLiked(song) ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          /* Search Results */
          <div className="search-results">
            <div className="results-header">
              <Mic2 size={24} />
              <h2>Resultados para "{searchTerm}"</h2>
            </div>

            {searchLoading ? (
              <div className="loading-songs" style={{ textAlign: 'center', padding: '40px' }}>
                <Loader size={32} className="animate-spin" />
                <p>Buscando...</p>
              </div>
            ) : (
              <>
                {/* Songs Results */}
                {(activeCategory === 'all' || activeCategory === 'songs') && displaySongs.length > 0 && (
                  <section className="results-section">
                    <h3><Music size={20} /> Músicas</h3>
                    <div className="songs-list">
                      {displaySongs.map((song, index) => (
                        <div
                          key={index}
                          className={`song-item ${currentSong?.title === song.title && isPlaying ? 'playing' : ''}`}
                        >
                          <div className="song-cover" onClick={() => playSong(song, displaySongs)}>
                            <img src={song.cover} alt={song.title} />
                            <div className="song-play-overlay">
                              {currentSong?.title === song.title && isPlaying ? (
                                <Pause size={24} onClick={(e) => { e.stopPropagation(); togglePlay(); }} />
                              ) : (
                                <Play size={24} />
                              )}
                            </div>
                          </div>
                          <div className="song-info">
                            <h4>{song.title}</h4>
                            <p>{song.artist}</p>
                          </div>
                          <span className="song-duration">{song.duration}</span>
                          <button
                            className={`like-btn ${isLiked(song) ? 'liked' : ''}`}
                            onClick={() => toggleLike(song)}
                          >
                            <Heart size={20} fill={isLiked(song) ? 'currentColor' : 'none'} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Artists Results */}
                {(activeCategory === 'all' || activeCategory === 'artists') && filteredArtists.length > 0 && (
                  <section className="results-section">
                    <h3><User size={20} /> Artistas</h3>
                    <div className="trending-artists-grid">
                      {filteredArtists.map((artist) => (
                        <Link key={artist.id} to={`/artists/${artist.id}`} className="trending-artist-card">
                          <div className="artist-avatar">
                            <img src={artist.image} alt={artist.name} />
                          </div>
                          <h3>{artist.name}</h3>
                          <span className="artist-genre">{artist.genre}</span>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {/* No Results */}
                {displaySongs.length === 0 && filteredArtists.length === 0 && (
                  <div className="no-results">
                    <Search size={64} />
                    <h3>Nenhum resultado encontrado</h3>
                    <p>Tente buscar com outros termos</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      <GlobalMusicPlayer />
    </div>
  )
}

export default SearchPage
