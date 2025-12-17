import { useState, useEffect, useCallback } from 'react'

export interface Song {
  title: string
  artist: string
  duration: string
  cover: string
  source: string
}

export interface Playlist {
  id: string
  name: string
  description: string
  cover: string
  songs: Song[]
  createdAt: string
}

const STORAGE_KEY = 'userPlaylists'

export function usePlaylists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])

  // Carregar playlists do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setPlaylists(JSON.parse(saved))
      }
    } catch {
      setPlaylists([])
    }
  }, [])

  // Salvar playlists no localStorage
  const savePlaylists = useCallback((newPlaylists: Playlist[]) => {
    setPlaylists(newPlaylists)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPlaylists))
  }, [])

  // Criar nova playlist
  const createPlaylist = useCallback((name: string, description: string = '') => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      description,
      cover: 'https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/95b52c32-f5da-4fe6-956d-a5ed118bbdd2',
      songs: [],
      createdAt: new Date().toISOString()
    }
    const updated = [...playlists, newPlaylist]
    savePlaylists(updated)
    return newPlaylist
  }, [playlists, savePlaylists])

  // Deletar playlist
  const deletePlaylist = useCallback((playlistId: string) => {
    const updated = playlists.filter(p => p.id !== playlistId)
    savePlaylists(updated)
  }, [playlists, savePlaylists])

  // Adicionar música a uma playlist
  const addSongToPlaylist = useCallback((playlistId: string, song: Song) => {
    const updated = playlists.map(p => {
      if (p.id === playlistId) {
        // Evitar duplicatas
        const exists = p.songs.some(s => s.source === song.source)
        if (exists) return p
        return {
          ...p,
          songs: [...p.songs, song],
          // Usar a capa da primeira música como capa da playlist
          cover: p.songs.length === 0 ? song.cover : p.cover
        }
      }
      return p
    })
    savePlaylists(updated)
  }, [playlists, savePlaylists])

  // Remover música de uma playlist
  const removeSongFromPlaylist = useCallback((playlistId: string, songSource: string) => {
    const updated = playlists.map(p => {
      if (p.id === playlistId) {
        return {
          ...p,
          songs: p.songs.filter(s => s.source !== songSource)
        }
      }
      return p
    })
    savePlaylists(updated)
  }, [playlists, savePlaylists])

  // Verificar se uma música está em uma playlist
  const isSongInPlaylist = useCallback((playlistId: string, songSource: string) => {
    const playlist = playlists.find(p => p.id === playlistId)
    return playlist?.songs.some(s => s.source === songSource) ?? false
  }, [playlists])

  // Atualizar playlist
  const updatePlaylist = useCallback((playlistId: string, updates: Partial<Omit<Playlist, 'id' | 'createdAt'>>) => {
    const updated = playlists.map(p => {
      if (p.id === playlistId) {
        return { ...p, ...updates }
      }
      return p
    })
    savePlaylists(updated)
  }, [playlists, savePlaylists])

  return {
    playlists,
    createPlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    isSongInPlaylist,
    updatePlaylist
  }
}

// Funções utilitárias para uso fora de componentes React
export function getPlaylistsFromStorage(): Playlist[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export function savePlaylistsToStorage(playlists: Playlist[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists))
}
