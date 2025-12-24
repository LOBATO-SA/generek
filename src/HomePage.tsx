import './HomePage.css'
import { useState, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectCoverflow, Pagination } from 'swiper/modules'
import GlobalMusicPlayer from './components/GlobalMusicPlayer'
import Sidebar from './components/Sidebar'
import AddToPlaylistModal from './components/AddToPlaylistModal'
import { useMusicPlayer, defaultSongs } from './contexts/MusicPlayerContext'
import type { Song } from './contexts/MusicPlayerContext'
import { songService } from './services/songService'
// import 'swiper/css'
// import 'swiper/css/effect-coverflow'
// import 'swiper/css/pagination'
import { Heart, ListPlus, Loader } from 'lucide-react'

function HomePage() {
  const [activeNav, setActiveNav] = useState('discover')
  const { playSong, isLiked, toggleLike, songs: currentPlaylist, currentSongIndex } = useMusicPlayer()

  const [showPlaylistModal, setShowPlaylistModal] = useState(false)
  const [songForPlaylist, setSongForPlaylist] = useState<Song | null>(null)

  const [songs, setSongs] = useState<Song[]>(defaultSongs)
  const [loadingSongs, setLoadingSongs] = useState(true)

  const playlists = [
    { name: "Midnight Moods", image: "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/95b52c32-f5da-4fe6-956d-a5ed118bbdd2" },
    { name: "Party Starters", image: "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/6ddf81f5-2689-4f34-bf80-a1e07f14621c" },
    { name: "Relaxing Tones", image: "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/ab52d9d0-308e-43e0-a577-dce35fedd2a3" },
    { name: "Smooth Jazz", image: "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/20c8fdd5-9f4a-4917-ae90-0239a52e8334" },
    { name: "Uplifting Rhythms", image: "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/df461a99-2fb3-4d55-ac16-2e0c6dd783e1" }
  ]

  // Fetch songs from API
  useEffect(() => {
    const fetchSongs = async () => {
      setLoadingSongs(true)
      try {
        const apiSongs = await songService.getSongs()
        console.log('🎵 API Songs found:', apiSongs)
        // Concatenate default songs with API songs
        setSongs([...defaultSongs, ...apiSongs])
      } catch (error) {
        console.error('Error fetching songs:', error)
        setSongs(defaultSongs) // Fallback on error
      } finally {
        setLoadingSongs(false)
      }
    }
    fetchSongs()
  }, [])

  const openPlaylistModal = (song: Song) => {
    setSongForPlaylist(song)
    setShowPlaylistModal(true)
  }

  const closePlaylistModal = () => {
    setShowPlaylistModal(false)
    setSongForPlaylist(null)
  }

  // Obter a música atual para o modal de playlist
  const getCurrentSong = () => {
    if (currentPlaylist.length > 0 && currentPlaylist[currentSongIndex]) {
      return currentPlaylist[currentSongIndex]
    }
    return songs[0]
  }

  return (
    <div className="home-page">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />

      <main className="content">
        <div className="slider-container">
          <h1>Popular Playlist</h1>
          <Swiper
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            loop={true}
            slidesPerView="auto"
            coverflowEffect={{
              rotate: 10,
              stretch: 120,
              depth: 200,
              modifier: 1,
              slideShadows: false
            }}
            pagination={{ clickable: true }}
            modules={[EffectCoverflow, Pagination]}
            className="mySwiper"
          >
            {playlists.map((playlist, index) => (
              <SwiperSlide key={index}>
                <img src={playlist.image} alt={playlist.name} />
                <div className="slide-overlay">
                  <h2>{playlist.name}</h2>
                  <button>Listen Now <i className="fa-solid fa-circle-play"></i></button>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="songs-section">
          <h1>Músicas recomendadas</h1>
          {loadingSongs ? (
            <div className="loading-songs">
              <Loader size={32} className="animate-spin" />
              <p>Carregando músicas...</p>
            </div>
          ) : (
            <div className="songs-grid">
              {songs.map((song, index) => (
                <div key={index} className="song-card">
                  <div className="song-card-image">
                    <img src={song.cover} alt={song.title} />
                    <div
                      className="play-overlay"
                      onClick={() => playSong(song, songs)}
                      style={{ cursor: 'pointer' }}
                    >
                      <i className="fa-solid fa-play"></i>
                    </div>
                  </div>
                  <div className="song-card-info">
                    <div className="song-card-info-row">
                      <div className="song-meta">
                        <h3>{song.title}</h3>
                        <p>{song.artist}</p>
                        <span>{song.duration}</span>
                      </div>
                      <button
                        className="song-like-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleLike(song)
                        }}
                        title={isLiked(song) ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
                      >
                        <Heart
                          size={20}
                          color={isLiked(song) ? '#ef4444' : '#fff'}
                          fill={isLiked(song) ? '#ef4444' : 'none'}
                          strokeWidth={2}
                        />
                      </button>
                      <button
                        className="song-playlist-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          openPlaylistModal(song)
                        }}
                        title="Adicionar à Playlist"
                      >
                        <ListPlus
                          size={20}
                          color="#fff"
                          strokeWidth={2}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <GlobalMusicPlayer
        onAddToPlaylist={() => openPlaylistModal(getCurrentSong())}
      />

      <AddToPlaylistModal
        isOpen={showPlaylistModal}
        onClose={closePlaylistModal}
        song={songForPlaylist}
      />
    </div>
  )
}

export default HomePage