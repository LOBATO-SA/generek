import './HomePage.css'
import { useState, useRef, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectCoverflow, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import 'swiper/css/pagination'

function HomePage() {
  const [activeNav, setActiveNav] = useState('discover')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSongIndex, setCurrentSongIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [rotation, setRotation] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const rotationInterval = useRef<number | null>(null)

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

  const playlists = [
    { name: "Midnight Moods", image: "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/95b52c32-f5da-4fe6-956d-a5ed118bbdd2" },
    { name: "Party Starters", image: "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/6ddf81f5-2689-4f34-bf80-a1e07f14621c" },
    { name: "Relaxing Tones", image: "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/ab52d9d0-308e-43e0-a577-dce35fedd2a3" },
    { name: "Smooth Jazz", image: "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/20c8fdd5-9f4a-4917-ae90-0239a52e8334" },
    { name: "Uplifting Rhythms", image: "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/df461a99-2fb3-4d55-ac16-2e0c6dd783e1" }
  ]

  const artists = [
    { name: "Taylor Swift", image: "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/c8feaa0f-6ae7-4c69-bb7d-4a11de76b4f5" },
    { name: "The Weeknd", image: "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/bf80314e-5a02-4702-bb64-eae8c113c417" },
    { name: "Dua Lipa", image: "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/e4576af8-0e84-4343-8f90-7a01acb9c8b7" },
    { name: "Jimin", image: "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/d8eb2888-1e74-4117-82d7-833ad29e3cc1" },
    { name: "Alicia Keys", image: "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/f23adc16-11d7-41dc-af6a-191e03a81603" },
    { name: "Maroon 5", image: "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/f511c102-3217-4bea-bede-8be23b969bd8" },
    { name: "Imagine Dragons", image: "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/9a8bd237-b525-43e6-a37c-daaac39db8ce" },
    { name: "Billie Eilish", image: "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/99452c85-26f4-4ccd-b439-7d1bd3875634" }
  ]

  const albums = [
    { title: "Views", artist: "Drake", image: "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/74c4f0f9-d73e-4737-83fa-ea4afe392229" },
    { title: "Speak Now", artist: "Taylor Swift", image: "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/d3a0bac0-fdb4-467e-bdf5-f3f415928f24" },
    { title: "Born to Die", artist: "Lana Del Rey", image: "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/85521a12-cc46-4b9f-a742-21ba407ebd5e" },
    { title: "Endless Summer", artist: "Miley Cyrus", image: "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/4e7bf466-7fa5-4dad-b628-5bca12833b64" },
    { title: "The Dark Side", artist: "Pink Floyd", image: "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/f01f546a-7ab7-4e90-acb9-1c1e817b676d" }
  ]

  const recommendedSongs = [
    { title: "Blank Space", artist: "Taylor Swift", duration: "4:33", image: "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/ea61baa7-9c4b-4f43-805e-81de5fc8aa2b" },
    { title: "One Dance", artist: "Drake", duration: "4:03", image: "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/6f72f702-c049-46fe-af76-a3b188b9a909" },
    { title: "Pawn It All", artist: "Alicia Keys", duration: "3:10", image: "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/ad2e664a-3ab9-4f30-933a-623e26999030" },
    { title: "Lose Control", artist: "Teddy Swims", duration: "3:30", image: "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/666e065b-eb53-4320-a580-30e266370955" },
    { title: "Be The One", artist: "Dua Lipa", duration: "3:24", image: "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/619ed17f-5df2-4d32-a419-78f120a1aa5c" },
    { title: "Delicate", artist: "Taylor Swift", duration: "3:54", image: "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/0ed3f51d-b769-4256-a4dd-8f35b12a1690" },
    { title: "Last Christmas", artist: "Wham!", duration: "4:39", image: "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/33779e1a-55f9-402a-b004-002395d0fbf1" }
  ]

  useEffect(() => {
    if (isPlaying && rotationInterval.current === null) {
      rotationInterval.current = window.setInterval(() => {
        setRotation(prev => prev + 1)
      }, 50)
    } else if (!isPlaying && rotationInterval.current !== null) {
      clearInterval(rotationInterval.current)
      rotationInterval.current = null
    }

    return () => {
      if (rotationInterval.current) clearInterval(rotationInterval.current)
    }
  }, [isPlaying])

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

  return (
    <div className="home-page">
      <audio ref={audioRef} src={songs[currentSongIndex].source} />
      
      <aside className="main-menu">
        <div>
          <div className="user-info">
            <img src="https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/37e5ccfa-f9ee-458b-afa2-dcd85b495e4e" alt="user" />
            <p>Jane Wilson</p>
          </div>
          <ul>
            {['discover', 'trending', 'album', 'playlist', 'favorites'].map((item) => (
              <li key={item} className={`nav-item ${activeNav === item ? 'active' : ''}`} onClick={() => setActiveNav(item)}>
                <a href="#">
                  <i className={`fa fa-${item === 'discover' ? 'map' : item === 'trending' ? 'arrow-trend-up' : item === 'album' ? 'compact-disc' : item === 'playlist' ? 'circle-play' : 'heart'} nav-icon`}></i>
                  <span className="nav-text">{item.charAt(0).toUpperCase() + item.slice(1)}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        
        <ul>
          {['profile', 'settings', 'logout'].map((item) => (
            <li key={item} className="nav-item">
              <a href="#">
                <i className={`fa fa-${item === 'profile' ? 'user' : item === 'settings' ? 'gear' : 'right-from-bracket'} nav-icon`}></i>
                <span className="nav-text">{item.charAt(0).toUpperCase() + item.slice(1)}</span>
              </a>
            </li>
          ))}
        </ul>
      </aside>

      <main className="content">
        <div className="left-content">
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

          <div className="artists">
            <h1>Featured Artists</h1>
            <div className="artist-container containers">
              {artists.map((artist, index) => (
                <div key={index} className="artist">
                  <div className="artist-img-container">
                    <img src={artist.image} alt={artist.name} />
                  </div>
                  <p>{artist.name}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="albums">
            <h1>Recommended Albums</h1>
            <div className="album-container containers">
              {albums.map((album, index) => (
                <div key={index} className="album">
                  <div className="album-frame">
                    <img src={album.image} alt={album.title} />
                  </div>
                  <div>
                    <h2>{album.title}</h2>
                    <p>{album.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="right-content">
          <div className="recommended-songs">
            <h1>Recommended Songs</h1>
            <div className="song-container">
              {recommendedSongs.map((song, index) => (
                <div key={index} className="song">
                  <div className="song-img">
                    <img src={song.image} alt={song.title} />
                    <div className="overlay">
                      <i className="fa-solid fa-play"></i>
                    </div>
                  </div>
                  <div className="song-title">
                    <h2>{song.title}</h2>
                    <p>{song.artist}</p>
                  </div>
                  <span>{song.duration}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="music-player">
            <div className="album-cover">
              <img 
                src={songs[currentSongIndex].cover} 
                alt="Album Cover"
                style={{ transform: `rotate(${rotation}deg)` }}
              />
              <span className="point"></span>
            </div>

            <h2>{songs[currentSongIndex].title}</h2>
            <p>{songs[currentSongIndex].artist}</p>

            <input 
              type="range" 
              value={progress} 
              onChange={handleProgressChange}
              id="progress" 
            />

            <div className="controls">
              <button className="backward" onClick={handlePrevious}>
                <i className="fa-solid fa-backward"></i>
              </button>
              <button className="play-pause-btn" onClick={togglePlay}>
                <i className={`fa-solid fa-${isPlaying ? 'pause' : 'play'}`}></i>
              </button>
              <button className="forward" onClick={handleNext}>
                <i className="fa-solid fa-forward"></i>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default HomePage
