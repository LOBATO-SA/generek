import '../Page.css'
import Sidebar from '../../components/Sidebar'
import GlobalMusicPlayer from '../../components/GlobalMusicPlayer'
import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import styled from 'styled-components'
import { MapPin, Music, DollarSign, Calendar, Save, Loader } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Tipos de evento disponíveis
const EVENT_TYPES = [
  'Casamento',
  'Aniversário',
  'Festa Corporativa',
  'Show Privado',
  'Festival',
  'Bar/Restaurante',
  'Evento Religioso',
  'Formatura',
  'Outro'
]

// Gêneros musicais
const MUSIC_GENRES = [
  'Pop',
  'Rock',
  'MPB',
  'Sertanejo',
  'Funk',
  'Pagode',
  'Samba',
  'Forró',
  'Eletrônica',
  'Jazz',
  'Blues',
  'Gospel',
  'Reggae',
  'Hip Hop',
  'Clássica',
  'Outro'
]

interface ArtistBio {
  genres: string[]
  location: string
  minPrice: number
  about: string
  eventTypes: string[]
}

function ArtistBioPage() {
  const [activeNav, setActiveNav] = useState('bio')
  useAuth() // Verificar autenticação
  
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // Form state
  const [bio, setBio] = useState<ArtistBio>({
    genres: [],
    location: '',
    minPrice: 0,
    about: '',
    eventTypes: []
  })

  // Carregar dados existentes do backend
  useEffect(() => {
    fetchBio()
  }, [])

  const fetchBio = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/artists/bio`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.bio) {
          setBio({
            genres: data.bio.genres || [],
            location: data.bio.location || '',
            minPrice: data.bio.minPrice || 0,
            about: data.bio.about || '',
            eventTypes: data.bio.eventTypes || []
          })
        }
      }
    } catch (error) {
      console.error('Erro ao carregar bio:', error)
    } finally {
      setFetching(false)
    }
  }

  const handleGenreToggle = (genre: string) => {
    setBio(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }))
  }

  const handleEventTypeToggle = (eventType: string) => {
    setBio(prev => ({
      ...prev,
      eventTypes: prev.eventTypes.includes(eventType)
        ? prev.eventTypes.filter(e => e !== eventType)
        : [...prev.eventTypes, eventType]
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/artists/bio`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bio)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao salvar bio')
      }

      setMessage({ type: 'success', text: 'Bio atualizada com sucesso!' })
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Erro ao salvar bio' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />
      
      <main className="page-content">
        <div className="page-header">
          <h1>Minha Bio</h1>
          <p>Configure seu perfil artístico para atrair mais clientes</p>
        </div>

        <BioContainer>
          {fetching ? (
            <LoadingState>
              <Loader size={32} className="spin" />
              <p>Carregando sua bio...</p>
            </LoadingState>
          ) : (
          <BioCard>
            {message && (
              <Message type={message.type}>{message.text}</Message>
            )}

            <Section>
              <SectionTitle>
                <Music size={20} />
                Gêneros Musicais
              </SectionTitle>
              <TagGrid>
                {MUSIC_GENRES.map(genre => (
                  <Tag 
                    key={genre}
                    selected={bio.genres.includes(genre)}
                    onClick={() => handleGenreToggle(genre)}
                  >
                    {genre}
                  </Tag>
                ))}
              </TagGrid>
            </Section>

            <Section>
              <SectionTitle>
                <Calendar size={20} />
                Tipos de Evento
              </SectionTitle>
              <TagGrid>
                {EVENT_TYPES.map(eventType => (
                  <Tag 
                    key={eventType}
                    selected={bio.eventTypes.includes(eventType)}
                    onClick={() => handleEventTypeToggle(eventType)}
                  >
                    {eventType}
                  </Tag>
                ))}
              </TagGrid>
            </Section>

            <Section>
              <SectionTitle>
                <MapPin size={20} />
                Localização
              </SectionTitle>
              <Input 
                type="text"
                value={bio.location}
                onChange={(e) => setBio(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Ex: São Paulo, SP"
              />
            </Section>

            <Section>
              <SectionTitle>
                <DollarSign size={20} />
                Preço Inicial (R$)
              </SectionTitle>
              <Input 
                type="number"
                value={bio.minPrice || ''}
                onChange={(e) => setBio(prev => ({ ...prev, minPrice: Number(e.target.value) }))}
                placeholder="Ex: 500"
                min="0"
              />
              <HelpText>Valor mínimo para uma apresentação</HelpText>
            </Section>

            <Section>
              <SectionTitle>Sobre Você</SectionTitle>
              <TextArea 
                value={bio.about}
                onChange={(e) => setBio(prev => ({ ...prev, about: e.target.value }))}
                placeholder="Conte um pouco sobre sua carreira, experiência, estilo musical..."
                rows={5}
              />
            </Section>

            <SaveButton onClick={handleSave} disabled={loading}>
              <Save size={18} />
              {loading ? 'Salvando...' : 'Salvar Bio'}
            </SaveButton>
          </BioCard>
          )}
        </BioContainer>
      </main>

      <GlobalMusicPlayer />
    </div>
  )
}

const BioContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 20px;
`

const LoadingState = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: #666;
  background: rgba(30, 30, 30, 0.9);
  border-radius: 16px;
  max-width: 700px;
  width: 100%;

  .spin {
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  p {
    color: #b3b3b3;
  }
`

const BioCard = styled.div`
  background: rgba(30, 30, 30, 0.9);
  border-radius: 16px;
  padding: 32px;
  width: 100%;
  max-width: 700px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`

const Section = styled.div`
  margin-bottom: 28px;
`

const SectionTitle = styled.h3`
  color: #fff;
  font-size: 16px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`

const TagGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const Tag = styled.button<{ selected: boolean }>`
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid ${props => props.selected ? '#1db954' : 'rgba(255,255,255,0.2)'};
  background: ${props => props.selected ? 'rgba(29, 185, 84, 0.2)' : 'transparent'};
  color: ${props => props.selected ? '#1db954' : '#b3b3b3'};

  &:hover {
    border-color: #1db954;
    color: #1db954;
  }
`

const Input = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px 16px;
  color: #fff;
  font-size: 16px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #1db954;
    background: rgba(255, 255, 255, 0.15);
  }

  &::placeholder {
    color: #666;
  }
`

const TextArea = styled.textarea`
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px 16px;
  color: #fff;
  font-size: 16px;
  resize: vertical;
  min-height: 100px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #1db954;
    background: rgba(255, 255, 255, 0.15);
  }

  &::placeholder {
    color: #666;
  }
`

const HelpText = styled.span`
  color: #666;
  font-size: 12px;
  margin-top: 4px;
  display: block;
`

const Message = styled.div<{ type: 'success' | 'error' }>`
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  font-size: 14px;
  background: ${props => props.type === 'success' ? 'rgba(29, 185, 84, 0.2)' : 'rgba(255, 77, 77, 0.2)'};
  color: ${props => props.type === 'success' ? '#1db954' : '#ff4d4d'};
  border: 1px solid ${props => props.type === 'success' ? '#1db954' : '#ff4d4d'};
`

const SaveButton = styled.button`
  width: 100%;
  padding: 14px 24px;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  background: #1db954;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) {
    background: #1ed760;
    transform: scale(1.02);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

export default ArtistBioPage
