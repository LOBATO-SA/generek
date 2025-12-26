import '../Page.css'
import Sidebar from '../../components/Sidebar'
import GlobalMusicPlayer from '../../components/GlobalMusicPlayer'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useMusicPlayer } from '../../contexts/MusicPlayerContext'
import type { Song } from '../../contexts/MusicPlayerContext'
import styled from 'styled-components'
import { Upload, Music, Trash2, Play, Pause, X, Loader, RefreshCw } from 'lucide-react'
import { UploadManager } from "@bytescale/sdk";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const BYTESCALE_API_KEY = import.meta.env.VITE_BYTESCALE_API_KEY || 'public_W23MTVQ2dXiWg8NHVHD2hmwZyr7P'

const uploadManager = new UploadManager({
  apiKey: BYTESCALE_API_KEY
});

interface MusicTrack {
  _id: string
  title: string
  genre: string
  file_url: string  // URL do arquivo de áudio
  artist_id: string
  cover_url?: string
  duration?: number
  file_path?: string
  created_at: string
  updated_at?: string
  status?: 'uploading' | 'uploaded' | 'error'
}

// Converter MusicTrack para Song (formato do player global)
const trackToSong = (track: MusicTrack, artistName: string): Song => ({
  title: track.title,
  artist: artistName,
  duration: track.duration ? formatDuration(track.duration) : '0:00',
  cover: track.cover_url || 'https://via.placeholder.com/150?text=🎵',
  source: track.file_url
})

// Formatar duração em segundos para mm:ss
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Lista de gêneros disponíveis
const GENRES = [
  'Afro House',
  'Amapiano',
  'Kizomba',
  'Semba',
  'Kuduro',
  'Afrobeat',
  'R&B',
  'Hip Hop',
  'Pop',
  'Rock',
  'Jazz',
  'Reggae',
  'Gospel',
  'Outro'
]

function ArtistMusicPage() {
  const [activeNav, setActiveNav] = useState('musicas')
  const { user, profile } = useAuth()
  const { playSong, isPlaying, songs, currentSongIndex, togglePlay } = useMusicPlayer()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [tracks, setTracks] = useState<MusicTrack[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showTerms, setShowTerms] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)

  // Estado do formulário de upload
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [songTitle, setSongTitle] = useState('')
  const [songGenre, setSongGenre] = useState('')

  // Estado para guardar dados de uploads com erro para retry
  const [pendingUploads, setPendingUploads] = useState<Map<string, { file: File, title: string, genre: string }>>(new Map())

  // Estado para modal de confirmação de delete
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [trackToDelete, setTrackToDelete] = useState<MusicTrack | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Verificar se uma track está tocando no player global
  const isTrackPlaying = (track: MusicTrack): boolean => {
    if (!isPlaying || !songs[currentSongIndex]) return false
    return songs[currentSongIndex].source === track.file_url
  }

  // Carregar músicas do artista
  useEffect(() => {
    fetchTracks()
  }, [])

  const fetchTracks = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/songs/my-songs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Músicas carregadas do backend:', data)
        // Verificar estrutura dos dados
        if (data.songs && data.songs.length > 0) {
          console.log('Primeira música:', data.songs[0])
          console.log('Campos disponíveis:', Object.keys(data.songs[0]))
        }
        setTracks(data.songs || [])
      }
    } catch (error) {
      console.error('Erro ao carregar músicas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadClick = () => {
    if (!termsAccepted) {
      setShowTerms(true)
      return
    }
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-m4a']
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|m4a)$/i)) {
      setMessage({ type: 'error', text: 'Por favor, selecione um arquivo de áudio válido (MP3, WAV, OGG, M4A)' })
      return
    }

    // Validar tamanho (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'O arquivo deve ter no máximo 50MB' })
      return
    }

    if (!termsAccepted) {
      setPendingFile(file)
      setShowTerms(true)
      return
    }

    // Mostrar formulário de upload
    setSelectedFile(file)
    setSongTitle(file.name.replace(/\.[^/.]+$/, ''))
    setSongGenre('')
    setShowUploadForm(true)
  }

  const handleSubmitUpload = async () => {
    if (!selectedFile || !songTitle.trim() || !songGenre) {
      setMessage({ type: 'error', text: 'Preencha todos os campos obrigatórios' })
      return
    }

    setUploading(true)
    setMessage(null)
    setShowUploadForm(false)

    // Adicionar track temporária com status uploading
    const tempId = `temp-${Date.now()}`
    const tempTrack: MusicTrack = {
      _id: tempId,
      title: songTitle,
      genre: songGenre,
      file_url: '',
      artist_id: user?.id || '',
      created_at: new Date().toISOString(),
      status: 'uploading'
    }
    setTracks(prev => [tempTrack, ...prev])

    try {
      const token = localStorage.getItem('token')
      let data;

      // Usar Direct-to-Cloud se não for localhost (para burlar limites da Vercel)
      const useDirectUpload = !API_URL.includes('localhost');

      if (useDirectUpload) {
        console.log("🚀 Fazendo upload direto para Bytescale...");
        const { fileUrl, filePath } = await uploadManager.upload({
          data: selectedFile,
          originalFileName: selectedFile.name,
          mime: selectedFile.type
        });

        console.log("✅ Upload concluído. Registrando no backend...");
        const response = await fetch(`${API_URL}/api/songs/register`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: songTitle.trim(),
            genre: songGenre,
            file_url: fileUrl,
            file_path: filePath
          })
        });

        data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Erro ao registrar música');

      } else {
        // Modo tradicional para desenvolvimento local
        const formData = new FormData()
        formData.append('song', selectedFile)
        formData.append('title', songTitle.trim())
        formData.append('genre', songGenre)

        const response = await fetch(`${API_URL}/api/songs/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        })

        data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Erro ao fazer upload');
      }

      // Atualizar a lista de tracks
      setTracks(prev => prev.map(t =>
        t._id === tempId
          ? { ...data.song, status: 'uploaded' as const }
          : t
      ))

      setMessage({ type: 'success', text: 'Música enviada com sucesso!' })

      // Limpar formulário
      setSelectedFile(null)
      setSongTitle('')
      setSongGenre('')

    } catch (error) {
      console.error('Erro no upload:', error)
      setTracks(prev => prev.map(t =>
        t._id === tempId ? { ...t, status: 'error' as const } : t
      ))
      // Guardar dados para retry
      setPendingUploads(prev => new Map(prev).set(tempId, {
        file: selectedFile,
        title: songTitle.trim(),
        genre: songGenre
      }))
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Erro ao enviar música'
      })
    }

    setUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleAcceptTerms = async () => {
    setTermsAccepted(true)
    setShowTerms(false)

    if (pendingFile) {
      // Mostrar formulário de upload
      setSelectedFile(pendingFile)
      setSongTitle(pendingFile.name.replace(/\.[^/.]+$/, ''))
      setSongGenre('')
      setShowUploadForm(true)
      setPendingFile(null)
    }
  }

  const handleDeleteTrack = (track: MusicTrack) => {
    setTrackToDelete(track)
    setShowDeleteModal(true)
  }

  const confirmDeleteTrack = async () => {
    if (!trackToDelete) return

    setDeleting(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/songs/${trackToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setTracks(prev => prev.filter(t => t._id !== trackToDelete._id))
        setMessage({ type: 'success', text: 'Música removida com sucesso' })
        setShowDeleteModal(false)
        setTrackToDelete(null)
      } else {
        const data = await response.json()
        throw new Error(data.message || 'Erro ao remover música')
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Erro ao remover música'
      })
    } finally {
      setDeleting(false)
    }
  }

  const cancelDeleteTrack = () => {
    setShowDeleteModal(false)
    setTrackToDelete(null)
  }

  // Função para tentar novamente o upload de uma track com erro
  const handleRetryUpload = async (trackId: string) => {
    const uploadData = pendingUploads.get(trackId)
    if (!uploadData) {
      setMessage({ type: 'error', text: 'Dados do upload não encontrados. Por favor, faça um novo upload.' })
      // Remover a track com erro
      setTracks(prev => prev.filter(t => t._id !== trackId))
      return
    }

    const { file, title, genre } = uploadData

    // Atualizar status para uploading
    setTracks(prev => prev.map(t =>
      t._id === trackId ? { ...t, status: 'uploading' as const } : t
    ))
    setMessage(null)

    try {
      const token = localStorage.getItem('token')
      let data;

      // Usar Direct-to-Cloud se não for localhost
      const useDirectUpload = !API_URL.includes('localhost');

      if (useDirectUpload) {
        console.log("🚀 Tentando novamente upload direto para Bytescale...");
        const { fileUrl, filePath } = await uploadManager.upload({
          data: file,
          originalFileName: file.name,
          mime: file.type
        });

        const response = await fetch(`${API_URL}/api/songs/register`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: title,
            genre: genre,
            file_url: fileUrl,
            file_path: filePath
          })
        });

        data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Erro ao registrar música');

      } else {
        // Modo tradicional para desenvolvimento local
        const formData = new FormData()
        formData.append('song', file)
        formData.append('title', title)
        formData.append('genre', genre)

        const response = await fetch(`${API_URL}/api/songs/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        })

        data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Erro ao fazer upload')
      }

      // Atualizar a lista de tracks com sucesso
      setTracks(prev => prev.map(t =>
        t._id === trackId
          ? { ...data.song, status: 'uploaded' as const }
          : t
      ))

      // Remover dos pendentes
      setPendingUploads(prev => {
        const newMap = new Map(prev)
        newMap.delete(trackId)
        return newMap
      })

      setMessage({ type: 'success', text: 'Música enviada com sucesso!' })

    } catch (error) {
      console.error('Erro no retry:', error)
      setTracks(prev => prev.map(t =>
        t._id === trackId ? { ...t, status: 'error' as const } : t
      ))
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Erro ao enviar música'
      })
    }
  }

  // Função para remover uma track com erro sem deletar do servidor
  const handleRemoveFailedTrack = (trackId: string) => {
    setTracks(prev => prev.filter(t => t._id !== trackId))
    setPendingUploads(prev => {
      const newMap = new Map(prev)
      newMap.delete(trackId)
      return newMap
    })
  }

  // Função para tocar/pausar música no player global
  const handlePlayTrack = (track: MusicTrack) => {
    if (!track.file_url) {
      setMessage({ type: 'error', text: 'URL da música não encontrada' })
      return
    }

    // Se a música já está tocando, pausar
    if (isTrackPlaying(track)) {
      togglePlay()
      return
    }

    // Converter todas as tracks para o formato Song e criar playlist
    const artistName = profile?.full_name || 'Artista'
    const playlist = tracks
      .filter(t => t.file_url && t.status !== 'uploading' && t.status !== 'error')
      .map(t => trackToSong(t, artistName))

    // Encontrar a música clicada na playlist
    const song = trackToSong(track, artistName)

    // Tocar a música no player global
    playSong(song, playlist)
  }

  return (
    <div className="page-container">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />

      <main className="page-content">
        <div className="page-header">
          <h1>Minhas Músicas</h1>
          <p>Faça upload das suas músicas para os clientes conhecerem seu trabalho</p>
        </div>

        <MusicContainer>
          <MusicCard>
            {message && (
              <Message type={message.type}>
                {message.text}
                <CloseMessage onClick={() => setMessage(null)}>
                  <X size={16} />
                </CloseMessage>
              </Message>
            )}

            <UploadSection>
              <UploadButton onClick={handleUploadClick} disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader size={24} className="spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload size={24} />
                    Enviar Nova Música
                  </>
                )}
              </UploadButton>
              <HiddenInput
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.ogg,.m4a"
                onChange={handleFileChange}
              />
              <HelpText>Formatos aceitos: MP3, WAV, OGG, M4A (máx. 50MB)</HelpText>
            </UploadSection>

            {loading ? (
              <LoadingState>
                <Loader size={32} className="spin" />
                <p>Carregando suas músicas...</p>
              </LoadingState>
            ) : tracks.length > 0 ? (
              <>
                <TrackList>
                  {tracks.map(track => (
                    <TrackItem
                      key={track._id}
                      $isError={track.status === 'error'}
                      $isPlaying={isTrackPlaying(track)}
                    >
                      <PlayButton
                        onClick={() => handlePlayTrack(track)}
                        disabled={!track.file_url || track.status === 'uploading'}
                        $isPlaying={isTrackPlaying(track)}
                      >
                        {track.status === 'uploading' ? (
                          <Loader size={20} className="spin" />
                        ) : isTrackPlaying(track) ? (
                          <Pause size={20} />
                        ) : (
                          <Play size={20} />
                        )}
                      </PlayButton>
                      <TrackInfo>
                        <TrackTitle>{track.title}</TrackTitle>
                        <TrackMeta>
                          {track.status === 'uploading' && (
                            <>Enviando...</>
                          )}
                          {track.status === 'error' && (
                            <ErrorText>Erro no upload</ErrorText>
                          )}
                          {track.status !== 'uploading' && track.status !== 'error' && (
                            <>
                              <GenreBadge>{track.genre}</GenreBadge>
                              <span>{new Date(track.created_at).toLocaleDateString('pt-BR')}</span>
                            </>
                          )}
                        </TrackMeta>
                      </TrackInfo>
                      <TrackActions>
                        {track.status === 'error' && (
                          <RetryButton
                            onClick={() => handleRetryUpload(track._id)}
                            title="Tentar novamente"
                          >
                            <RefreshCw size={18} />
                            Tentar novamente
                          </RetryButton>
                        )}
                        <ActionButton
                          $danger
                          onClick={() => track.status === 'error' ? handleRemoveFailedTrack(track._id) : handleDeleteTrack(track)}
                          disabled={track.status === 'uploading'}
                          title={track.status === 'error' ? 'Remover' : 'Excluir música'}
                        >
                          {track.status === 'error' ? <X size={18} /> : <Trash2 size={18} />}
                        </ActionButton>
                      </TrackActions>
                    </TrackItem>
                  ))}
                </TrackList>
              </>
            ) : (
              <EmptyState>
                <Music size={48} />
                <p>Nenhuma música enviada ainda</p>
                <span>Faça upload das suas músicas para mostrar seu talento</span>
              </EmptyState>
            )}
          </MusicCard>
        </MusicContainer>

        {/* Modal de Formulário de Upload */}
        {showUploadForm && (
          <ModalOverlay>
            <Modal>
              <ModalTitle>
                <Music size={24} />
                Informações da Música
              </ModalTitle>
              <ModalContent>
                <FormGroup>
                  <Label>Arquivo Selecionado</Label>
                  <FileInfo>
                    <Music size={18} />
                    {selectedFile?.name}
                  </FileInfo>
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="songTitle">Título da Música *</Label>
                  <Input
                    id="songTitle"
                    type="text"
                    value={songTitle}
                    onChange={(e) => setSongTitle(e.target.value)}
                    placeholder="Ex: Minha Música"
                    maxLength={100}
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="songGenre">Gênero Musical *</Label>
                  <Select
                    id="songGenre"
                    value={songGenre}
                    onChange={(e) => setSongGenre(e.target.value)}
                  >
                    <option value="">Selecione um gênero</option>
                    {GENRES.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </Select>
                </FormGroup>
              </ModalContent>
              <ModalActions>
                <CancelButton onClick={() => {
                  setShowUploadForm(false)
                  setSelectedFile(null)
                  setSongTitle('')
                  setSongGenre('')
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}>
                  Cancelar
                </CancelButton>
                <AcceptButton
                  onClick={handleSubmitUpload}
                  disabled={!songTitle.trim() || !songGenre}
                >
                  <Upload size={18} />
                  Enviar Música
                </AcceptButton>
              </ModalActions>
            </Modal>
          </ModalOverlay>
        )}

        {/* Modal de Termos */}
        {showTerms && (
          <ModalOverlay>
            <Modal>
              <ModalTitle>Termos de Upload de Música</ModalTitle>
              <ModalContent>
                <p>Ao fazer upload de músicas na plataforma Generek, você declara e certifica que:</p>
                <ul>
                  <li>Você é o autor ou detentor dos direitos autorais da música enviada;</li>
                  <li>A música não infringe direitos de terceiros;</li>
                  <li>Você autoriza a plataforma a reproduzir a música para fins de demonstração do seu trabalho;</li>
                  <li>Você é responsável por qualquer reclamação relacionada aos direitos autorais da música.</li>
                </ul>
                <p><strong>A violação destes termos pode resultar na remoção do conteúdo e suspensão da conta.</strong></p>
              </ModalContent>
              <ModalActions>
                <CancelButton onClick={() => { setShowTerms(false); setPendingFile(null) }}>
                  Cancelar
                </CancelButton>
                <AcceptButton onClick={handleAcceptTerms}>
                  Aceito os Termos
                </AcceptButton>
              </ModalActions>
            </Modal>
          </ModalOverlay>
        )}

        {/* Modal de Confirmação de Delete */}
        {showDeleteModal && trackToDelete && (
          <ModalOverlay>
            <Modal>
              <ModalTitle>
                <Trash2 size={24} color="#ff4d4d" />
                Excluir Música
              </ModalTitle>
              <ModalContent>
                <p>Tem certeza que deseja excluir a música <strong style={{ color: '#fff' }}>"{trackToDelete.title}"</strong>?</p>
                <p style={{ marginTop: '12px', color: '#ff4d4d' }}>
                  Esta ação não pode ser desfeita. O arquivo será removido permanentemente.
                </p>
              </ModalContent>
              <ModalActions>
                <CancelButton onClick={cancelDeleteTrack} disabled={deleting}>
                  Cancelar
                </CancelButton>
                <DeleteButton onClick={confirmDeleteTrack} disabled={deleting}>
                  {deleting ? (
                    <>
                      <Loader size={16} className="spin" />
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Excluir Música
                    </>
                  )}
                </DeleteButton>
              </ModalActions>
            </Modal>
          </ModalOverlay>
        )}
      </main>

      <GlobalMusicPlayer />
    </div>
  )
}

const MusicContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 20px;
`

const MusicCard = styled.div`
  background: rgba(30, 30, 30, 0.9);
  border-radius: 16px;
  padding: 32px;
  width: 100%;
  max-width: 700px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`

const UploadSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  margin-bottom: 24px;
`

const UploadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  background: #1db954;
  color: #000;

  &:hover:not(:disabled) {
    background: #1ed760;
    transform: scale(1.02);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`

const HiddenInput = styled.input`
  display: none;
`

const HelpText = styled.span`
  color: #666;
  font-size: 12px;
  margin-top: 12px;
`

const TrackList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const TrackItem = styled.div<{ $isError?: boolean; $isPlaying?: boolean }>`
  display: flex;
  align-items: flex-start;
  padding: 16px;
  background: ${props => {
    if (props.$isError) return 'rgba(255, 77, 77, 0.1)';
    if (props.$isPlaying) return 'rgba(29, 185, 84, 0.1)';
    return 'rgba(255, 255, 255, 0.05)';
  }};
  border-radius: 12px;
  gap: 16px;
  border: 1px solid ${props => {
    if (props.$isError) return 'rgba(255, 77, 77, 0.3)';
    if (props.$isPlaying) return 'rgba(29, 185, 84, 0.3)';
    return 'transparent';
  }};
  transition: all 0.2s;
`

const PlayButton = styled.button<{ $isPlaying?: boolean }>`
  width: 48px;
  height: 48px;
  background: ${props => props.$isPlaying ? '#1db954' : 'rgba(29, 185, 84, 0.2)'};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$isPlaying ? '#000' : '#1db954'};
  flex-shrink: 0;
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #1db954;
    color: #000;
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .spin {
    animation: spin 1s linear infinite;
  }
`

const TrackInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const TrackTitle = styled.h4`
  color: #fff;
  margin: 0 0 4px 0;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const TrackMeta = styled.div`
  color: #666;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  .spin {
    animation: spin 1s linear infinite;
  }
`

const GenreBadge = styled.span`
  background: rgba(29, 185, 84, 0.2);
  color: #1db954;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
`

const ErrorText = styled.span`
  color: #ff4d4d;
`

const LoadingState = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: #666;

  .spin {
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }

  p {
    color: #b3b3b3;
  }
`

const TrackActions = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  align-items: center;
`

const RetryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  border: none;
  background: rgba(29, 185, 84, 0.2);
  color: #1db954;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: rgba(29, 185, 84, 0.3);
    transform: scale(1.02);
  }

  svg {
    flex-shrink: 0;
  }
`

const ActionButton = styled.button<{ $danger?: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: ${props => props.$danger ? 'rgba(255, 77, 77, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.$danger ? '#ff4d4d' : '#fff'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${props => props.$danger ? 'rgba(255, 77, 77, 0.3)' : 'rgba(255, 255, 255, 0.2)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: #666;

  svg {
    margin-bottom: 16px;
  }

  p {
    color: #fff;
    font-size: 18px;
    margin-bottom: 8px;
  }

  span {
    font-size: 14px;
  }
`

const Message = styled.div<{ type: 'success' | 'error' }>`
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  background: ${props => props.type === 'success' ? 'rgba(29, 185, 84, 0.2)' : 'rgba(255, 77, 77, 0.2)'};
  color: ${props => props.type === 'success' ? '#1db954' : '#ff4d4d'};
  border: 1px solid ${props => props.type === 'success' ? '#1db954' : '#ff4d4d'};
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const CloseMessage = styled.button`
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
`

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`

const Modal = styled.div`
  background: #1e1e1e;
  border-radius: 16px;
  padding: 32px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`

const ModalTitle = styled.h2`
  color: #fff;
  margin: 0 0 20px 0;
  font-size: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
`

const ModalContent = styled.div`
  color: #b3b3b3;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 24px;

  ul {
    margin: 16px 0;
    padding-left: 20px;
  }

  li {
    margin-bottom: 8px;
  }

  strong {
    color: #ff4d4d;
  }
`

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`

const CancelButton = styled.button`
  padding: 12px 24px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  background: transparent;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`

const AcceptButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  background: #1db954;
  color: #000;
  border: none;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #1ed760;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const DeleteButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  background: #ff4d4d;
  color: #fff;
  border: none;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #ff6666;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .spin {
    animation: spin 1s linear infinite;
  }
`

const FormGroup = styled.div`
  margin-bottom: 20px;
`

const Label = styled.label`
  display: block;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
`

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 14px;
  transition: border-color 0.2s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #1db954;
  }

  &::placeholder {
    color: #666;
  }
`

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.2s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #1db954;
  }

  option {
    background: #1e1e1e;
    color: #fff;
  }
`

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(29, 185, 84, 0.1);
  border: 1px solid rgba(29, 185, 84, 0.3);
  border-radius: 8px;
  color: #1db954;
  font-size: 14px;
  word-break: break-all;
`

export default ArtistMusicPage
