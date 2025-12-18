import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'

export interface Song {
  title: string
  artist: string
  duration: string
  cover: string
  source: string
}

interface MusicPlayerContextType {
  // Estado atual
  songs: Song[]
  currentSongIndex: number
  isPlaying: boolean
  progress: number
  
  // Ações
  playSong: (song: Song, playlist?: Song[]) => void
  playPlaylist: (playlist: Song[], startIndex?: number) => void
  togglePlay: () => void
  next: () => void
  previous: () => void
  shuffle: () => void
  setProgress: (value: number) => void
  
  // Likes
  likedSongs: Song[]
  isLiked: (song: Song) => boolean
  toggleLike: (song: Song) => void
  
  // Áudio ref para controle externo
  audioRef: React.RefObject<HTMLAudioElement | null>
}

const MusicPlayerContext = createContext<MusicPlayerContextType | null>(null)

// Músicas padrão do app
const defaultSongs: Song[] = [
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

const LIKED_SONGS_KEY = 'likedSongs'

export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [songs, setSongs] = useState<Song[]>(defaultSongs)
  const [currentSongIndex, setCurrentSongIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [likedSongs, setLikedSongs] = useState<Song[]>([])

  // Carregar likes do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LIKED_SONGS_KEY)
      if (saved) {
        setLikedSongs(JSON.parse(saved))
      }
    } catch {
      setLikedSongs([])
    }
  }, [])

  // Salvar likes no localStorage
  const saveLikedSongs = useCallback((list: Song[]) => {
    setLikedSongs(list)
    localStorage.setItem(LIKED_SONGS_KEY, JSON.stringify(list))
  }, [])

  // Verificar se música é liked
  const isLiked = useCallback((song: Song) => {
    return likedSongs.some(s => s.source === song.source)
  }, [likedSongs])

  // Toggle like
  const toggleLike = useCallback((song: Song) => {
    if (isLiked(song)) {
      saveLikedSongs(likedSongs.filter(s => s.source !== song.source))
    } else {
      saveLikedSongs([...likedSongs, song])
    }
  }, [isLiked, likedSongs, saveLikedSongs])

  // Atualizar progresso
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100)
      }
    }

    const handleEnded = () => {
      // Próxima música automaticamente
      setCurrentSongIndex(prev => (prev + 1) % songs.length)
      setTimeout(() => {
        audioRef.current?.play()
      }, 100)
    }

    audio.addEventListener('timeupdate', updateProgress)
    audio.addEventListener('ended', handleEnded)
    
    return () => {
      audio.removeEventListener('timeupdate', updateProgress)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [songs.length])

  // Tocar música quando muda a fonte
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !songs[currentSongIndex]) return

    audio.src = songs[currentSongIndex].source
    if (isPlaying) {
      audio.play().catch(console.error)
    }
  }, [currentSongIndex, songs])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play().catch(console.error)
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  const playSong = useCallback((song: Song, playlist?: Song[]) => {
    const newPlaylist = playlist || [song]
    const index = newPlaylist.findIndex(s => s.source === song.source)
    
    setSongs(newPlaylist)
    setCurrentSongIndex(index >= 0 ? index : 0)
    setIsPlaying(true)
    
    setTimeout(() => {
      audioRef.current?.play().catch(console.error)
    }, 100)
  }, [])

  const playPlaylist = useCallback((playlist: Song[], startIndex = 0) => {
    if (playlist.length === 0) return
    
    setSongs(playlist)
    setCurrentSongIndex(startIndex)
    setIsPlaying(true)
    
    setTimeout(() => {
      audioRef.current?.play().catch(console.error)
    }, 100)
  }, [])

  const next = useCallback(() => {
    setCurrentSongIndex(prev => (prev + 1) % songs.length)
    setIsPlaying(true)
    setTimeout(() => {
      audioRef.current?.play().catch(console.error)
    }, 100)
  }, [songs.length])

  const previous = useCallback(() => {
    setCurrentSongIndex(prev => (prev - 1 + songs.length) % songs.length)
    setIsPlaying(true)
    setTimeout(() => {
      audioRef.current?.play().catch(console.error)
    }, 100)
  }, [songs.length])

  const shuffle = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * songs.length)
    setCurrentSongIndex(randomIndex)
    setIsPlaying(true)
    setTimeout(() => {
      audioRef.current?.play().catch(console.error)
    }, 100)
  }, [songs.length])

  const handleSetProgress = useCallback((value: number) => {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    
    const newTime = (value / 100) * audio.duration
    audio.currentTime = newTime
    setProgress(value)
  }, [])

  return (
    <MusicPlayerContext.Provider value={{
      songs,
      currentSongIndex,
      isPlaying,
      progress,
      playSong,
      playPlaylist,
      togglePlay,
      next,
      previous,
      shuffle,
      setProgress: handleSetProgress,
      likedSongs,
      isLiked,
      toggleLike,
      audioRef
    }}>
      {/* Elemento de áudio global */}
      <audio ref={audioRef} />
      {children}
    </MusicPlayerContext.Provider>
  )
}

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext)
  if (!context) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider')
  }
  return context
}

// Exportar as músicas padrão para uso em outras páginas
export { defaultSongs }
