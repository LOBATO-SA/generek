import './HomePage.css'
import { useState, useRef, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectCoverflow, Pagination } from 'swiper/modules'
import MusicPlayer from './components/MusicPlayer'
import Sidebar from './components/Sidebar'
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import 'swiper/css/pagination'

function HomePage() {
  const [activeNav, setActiveNav] = useState('discover')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSongIndex, setCurrentSongIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  const playlists = [
    { name: "Midnight Moods", image: "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/95b52c32-f5da-4fe6-956d-a5ed118bbdd2" },
    { name: "Party Starters", image: "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/6ddf81f5-2689-4f34-bf80-a1e07f14621c" },
    { name: "Relaxing Tones", image: "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/ab52d9d0-308e-43e0-a577-dce35fedd2a3" },
    { name: "Smooth Jazz", image: "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/20c8fdd5-9f4a-4917-ae90-0239a52e8334" },
    { name: "Uplifting Rhythms", image: "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/df461a99-2fb3-4d55-ac16-2e0c6dd783e1" }
  ]

  const songs = [
    {
      title: "Redemption",
      artist: "Besomorph & Coopex",
      duration: "3:45",
      cover: "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/398875d0-9b9e-494a-8906-210aa3f777e0",
      source: "https://github.com/ecemgo/mini-samples-great-tricks/raw/main/song-list/Besomorph-Coopex-Redemption.mp3"
    },
    {
      title: "What's The Problem?",
      artist: "OSKI",
      duration: "4:20",
      cover: "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/810d1ddc-1168-4990-8d43-a0ffee21fb8c",
      source: "https://github.com/ecemgo/mini-samples-great-tricks/raw/main/song-list/OSKI-Whats-The-Problem.mp3"
    },
    {
      title: "Control",
      artist: "Unknown Brain x Rival",
      duration: "3:58",
      cover: "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/7bd23b84-d9b0-4604-a7e3-872157a37b61",
      source: "https://github.com/ecemgo/mini-samples-great-tricks/raw/main/song-list/Unknown-BrainxRival-Control.mp3"
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
    <div className="home-page">
      <audio ref={audioRef} src={songs[currentSongIndex].source} />
      
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
          <h1>Recommended Songs</h1>
          <div className="songs-grid">
            {songs.map((song, index) => (
              <div key={index} className="song-card">
                <div className="song-card-image">
                  <img src={song.cover} alt={song.title} />
                  <div className="play-overlay">
                    <i className="fa-solid fa-play"></i>
                  </div>
                </div>
                <div className="song-card-info">
                  <h3>{song.title}</h3>
                  <p>{song.artist}</p>
                  <span>{song.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

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
      </main>
    </div>
  )
}

export default HomePage
