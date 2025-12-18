import './Page.css'
import './PlaylistPage.css'
import Sidebar from '../components/Sidebar'
import GlobalMusicPlayer from '../components/GlobalMusicPlayer'
import { useState, useEffect } from 'react'
import { Plus, Play, Trash2, Music, MoreVertical, X } from 'lucide-react'
import { usePlaylists } from '../hooks/usePlaylists'
import type { Playlist } from '../hooks/usePlaylists'
import { useMusicPlayer } from '../contexts/MusicPlayerContext'

function PlaylistPage() {
  const [activeNav, setActiveNav] = useState('playlist')
  const { playSong, playPlaylist } = useMusicPlayer()

  // Playlist management
  const { playlists, createPlaylist, deletePlaylist, removeSongFromPlaylist } = usePlaylists()
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  // Atualizar playlist selecionada quando playlists mudam
  useEffect(() => {
    if (selectedPlaylist) {
      const updated = playlists.find(p => p.id === selectedPlaylist.id)
      if (updated) {
        setSelectedPlaylist(updated)
      } else {
        setSelectedPlaylist(null)
      }
    }
  }, [playlists, selectedPlaylist])

  const handlePlaySong = (index: number) => {
    if (!selectedPlaylist?.songs.length) return
    const song = selectedPlaylist.songs[index]
    if (song) {
      playSong(song, selectedPlaylist.songs)
    }
  }

  const handlePlayPlaylist = (playlist: Playlist) => {
    if (playlist.songs.length > 0) {
      setSelectedPlaylist(playlist)
      playPlaylist(playlist.songs, 0)
    }
  }

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return
    createPlaylist(newPlaylistName.trim(), newPlaylistDescription.trim())
    setNewPlaylistName('')
    setNewPlaylistDescription('')
    setShowCreateModal(false)
  }

  const handleDeletePlaylist = (playlistId: string) => {
    deletePlaylist(playlistId)
    if (selectedPlaylist?.id === playlistId) {
      setSelectedPlaylist(null)
    }
    setShowDeleteConfirm(null)
  }

  const handleRemoveSong = (songSource: string) => {
    if (!selectedPlaylist) return
    removeSongFromPlaylist(selectedPlaylist.id, songSource)
  }

  return (
    <div className="page-container">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />
      
      <main className="page-content">
        <div className="page-header">
          <h1>Minhas Playlists</h1>
          <p>Crie e gerencie suas coleções de música</p>
        </div>

        {/* Botão criar playlist */}
        <button 
          className="create-playlist-main-btn"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={22} />
          Criar Nova Playlist
        </button>

        {/* Grid de Playlists */}
        <div className="playlists-grid">
          {playlists.length === 0 ? (
            <div className="empty-playlists-state">
              <Music size={80} />
              <h3>Nenhuma playlist criada</h3>
              <p>Crie sua primeira playlist e adicione músicas enquanto navega pelo app!</p>
            </div>
          ) : (
            playlists.map(playlist => (
              <div 
                key={playlist.id} 
                className={`playlist-card ${selectedPlaylist?.id === playlist.id ? 'selected' : ''}`}
                onClick={() => setSelectedPlaylist(playlist)}
              >
                <div className="playlist-card-image">
                  <img src={playlist.cover} alt={playlist.name} />
                  <div className="playlist-card-overlay">
                    <button 
                      className="play-playlist-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePlayPlaylist(playlist)
                      }}
                    >
                      <Play size={28} fill="white" />
                    </button>
                  </div>
                </div>
                <div className="playlist-card-info">
                  <h3>{playlist.name}</h3>
                  <p>{playlist.songs.length} música{playlist.songs.length !== 1 ? 's' : ''}</p>
                </div>
                <button 
                  className="playlist-menu-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowDeleteConfirm(playlist.id)
                  }}
                >
                  <MoreVertical size={20} />
                </button>

                {/* Delete confirmation */}
                {showDeleteConfirm === playlist.id && (
                  <div className="delete-confirm-popup" onClick={e => e.stopPropagation()}>
                    <p>Excluir "{playlist.name}"?</p>
                    <div className="delete-confirm-actions">
                      <button onClick={() => setShowDeleteConfirm(null)}>Cancelar</button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeletePlaylist(playlist.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Músicas da playlist selecionada */}
        {selectedPlaylist && (
          <div className="playlist-songs-section">
            <div className="playlist-songs-header">
              <h2>{selectedPlaylist.name}</h2>
              <span>{selectedPlaylist.songs.length} música{selectedPlaylist.songs.length !== 1 ? 's' : ''}</span>
            </div>

            {selectedPlaylist.songs.length === 0 ? (
              <div className="empty-playlist-songs">
                <Music size={48} />
                <p>Esta playlist está vazia</p>
                <span>Adicione músicas pelo reprodutor ou pelos cards de música</span>
              </div>
            ) : (
              <div className="playlist-songs-list">
                {selectedPlaylist.songs.map((song, index) => (
                  <div 
                    key={song.source} 
                    className="playlist-song-item"
                  >
                    <button 
                      className="song-play-btn-small"
                      onClick={() => handlePlaySong(index)}
                    >
                      <Play size={16} fill="currentColor" />
                    </button>
                    <img src={song.cover} alt={song.title} className="song-thumb" />
                    <div className="song-info-compact">
                      <h4>{song.title}</h4>
                      <p>{song.artist}</p>
                    </div>
                    <span className="song-duration-small">{song.duration}</span>
                    <button 
                      className="remove-song-btn"
                      onClick={() => handleRemoveSong(song.source)}
                      title="Remover da playlist"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal criar playlist */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content create-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Criar Nova Playlist</h2>
                <button className="modal-close-btn" onClick={() => setShowCreateModal(false)}>
                  <X size={24} />
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nome da Playlist</label>
                  <input
                    type="text"
                    placeholder="Minha playlist incrível..."
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label>Descrição (opcional)</label>
                  <textarea
                    placeholder="Descreva sua playlist..."
                    value={newPlaylistDescription}
                    onChange={(e) => setNewPlaylistDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="modal-actions">
                  <button 
                    className="cancel-btn"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="confirm-btn"
                    onClick={handleCreatePlaylist}
                    disabled={!newPlaylistName.trim()}
                  >
                    Criar Playlist
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <GlobalMusicPlayer />
    </div>
  )
}

export default PlaylistPage
