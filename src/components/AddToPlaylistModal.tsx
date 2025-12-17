import { useState, useEffect } from 'react'
import { X, Plus, Music, Check } from 'lucide-react'
import { getPlaylistsFromStorage, savePlaylistsToStorage } from '../hooks/usePlaylists'
import type { Playlist, Song } from '../hooks/usePlaylists'
import './AddToPlaylistModal.css'

interface AddToPlaylistModalProps {
  isOpen: boolean
  onClose: () => void
  song: Song | null
}

function AddToPlaylistModal({ isOpen, onClose, song }: AddToPlaylistModalProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [addedToPlaylist, setAddedToPlaylist] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setPlaylists(getPlaylistsFromStorage())
      setShowCreateForm(false)
      setNewPlaylistName('')
      setAddedToPlaylist(null)
    }
  }, [isOpen])

  if (!isOpen || !song) return null

  const handleAddToPlaylist = (playlistId: string) => {
    const updated = playlists.map(p => {
      if (p.id === playlistId) {
        const exists = p.songs.some(s => s.source === song.source)
        if (exists) return p
        return {
          ...p,
          songs: [...p.songs, song],
          cover: p.songs.length === 0 ? song.cover : p.cover
        }
      }
      return p
    })
    savePlaylistsToStorage(updated)
    setPlaylists(updated)
    setAddedToPlaylist(playlistId)
    
    // Fechar após 1 segundo
    setTimeout(() => {
      onClose()
    }, 800)
  }

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return

    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name: newPlaylistName.trim(),
      description: '',
      cover: song.cover,
      songs: [song],
      createdAt: new Date().toISOString()
    }

    const updated = [...playlists, newPlaylist]
    savePlaylistsToStorage(updated)
    setPlaylists(updated)
    setAddedToPlaylist(newPlaylist.id)
    setShowCreateForm(false)
    setNewPlaylistName('')

    setTimeout(() => {
      onClose()
    }, 800)
  }

  const isSongInPlaylist = (playlistId: string) => {
    const playlist = playlists.find(p => p.id === playlistId)
    return playlist?.songs.some(s => s.source === song.source) ?? false
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Adicionar à Playlist</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-song-preview">
          <img src={song.cover} alt={song.title} />
          <div className="song-preview-info">
            <h3>{song.title}</h3>
            <p>{song.artist}</p>
          </div>
        </div>

        <div className="modal-body">
          {/* Botão para criar nova playlist */}
          {!showCreateForm ? (
            <button 
              className="create-playlist-btn"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus size={20} />
              Criar Nova Playlist
            </button>
          ) : (
            <div className="create-playlist-form">
              <input
                type="text"
                placeholder="Nome da playlist..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreatePlaylist()
                  if (e.key === 'Escape') setShowCreateForm(false)
                }}
              />
              <div className="form-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancelar
                </button>
                <button 
                  className="confirm-btn"
                  onClick={handleCreatePlaylist}
                  disabled={!newPlaylistName.trim()}
                >
                  Criar
                </button>
              </div>
            </div>
          )}

          {/* Lista de playlists */}
          <div className="playlists-list">
            {playlists.length === 0 ? (
              <div className="empty-playlists">
                <Music size={48} />
                <p>Você ainda não tem playlists</p>
              </div>
            ) : (
              playlists.map(playlist => (
                <button
                  key={playlist.id}
                  className={`playlist-item ${isSongInPlaylist(playlist.id) ? 'already-added' : ''} ${addedToPlaylist === playlist.id ? 'just-added' : ''}`}
                  onClick={() => !isSongInPlaylist(playlist.id) && handleAddToPlaylist(playlist.id)}
                  disabled={isSongInPlaylist(playlist.id)}
                >
                  <img src={playlist.cover} alt={playlist.name} />
                  <div className="playlist-item-info">
                    <h4>{playlist.name}</h4>
                    <span>{playlist.songs.length} música{playlist.songs.length !== 1 ? 's' : ''}</span>
                  </div>
                  {isSongInPlaylist(playlist.id) && (
                    <div className="added-indicator">
                      <Check size={18} />
                    </div>
                  )}
                  {addedToPlaylist === playlist.id && !isSongInPlaylist(playlist.id) && (
                    <div className="added-indicator success">
                      <Check size={18} />
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddToPlaylistModal
