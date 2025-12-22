import './Page.css'
import Sidebar from '../components/Sidebar'
import GlobalMusicPlayer from '../components/GlobalMusicPlayer'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext.tsx'
import styled from 'styled-components'
import { Camera } from 'lucide-react'

function ProfilePage() {
  const [activeNav, setActiveNav] = useState('profile')
  const { profile, updateProfile, uploadAvatar, user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // Form state
  const [fullName, setFullName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  // Carregar dados do perfil quando disponíveis
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setAvatarUrl(profile.avatar_url || '')
    }
  }, [profile])

  const handleSave = async () => {
    setLoading(true)
    setMessage(null)

    const updates: { full_name?: string; avatar_url?: string } = {}
    
    if (fullName !== profile?.full_name) {
      updates.full_name = fullName
    }
    if (avatarUrl !== profile?.avatar_url) {
      updates.avatar_url = avatarUrl
    }

    if (Object.keys(updates).length === 0) {
      setMessage({ type: 'error', text: 'Nenhuma alteração detectada' })
      setLoading(false)
      return
    }

    const { error } = await updateProfile(updates)

    if (error) {
      setMessage({ type: 'error', text: error.message || 'Erro ao atualizar perfil' })
    } else {
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' })
      setIsEditing(false)
    }

    setLoading(false)
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Por favor, selecione uma imagem válida' })
      return
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'A imagem deve ter no máximo 5MB' })
      return
    }

    setUploadingAvatar(true)
    setMessage(null)

    const { avatarUrl: newAvatarUrl, error } = await uploadAvatar(file)

    if (error) {
      setMessage({ type: 'error', text: error.message || 'Erro ao fazer upload da imagem' })
    } else if (newAvatarUrl) {
      setAvatarUrl(newAvatarUrl)
      setMessage({ type: 'success', text: 'Avatar atualizado com sucesso!' })
    }

    setUploadingAvatar(false)
    // Limpar o input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCancel = () => {
    // Restaurar valores originais
    if (profile) {
      setFullName(profile.full_name || '')
      setAvatarUrl(profile.avatar_url || '')
    }
    setIsEditing(false)
    setMessage(null)
  }

  return (
    <div className="page-container">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />
      
      <main className="page-content">
        <div className="page-header">
          <h1>Perfil</h1>
          <p>Gerencie as configurações da sua conta</p>
        </div>

        <ProfileContainer>
          <ProfileCard>
            <AvatarSection>
              <AvatarWrapper onClick={handleAvatarClick}>
                <Avatar 
                  src={avatarUrl || profile?.avatar_url || "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/37e5ccfa-f9ee-458b-afa2-dcd85b495e4e"} 
                  alt="Profile" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/37e5ccfa-f9ee-458b-afa2-dcd85b495e4e"
                  }}
                  style={{ opacity: uploadingAvatar ? 0.5 : 1 }}
                />
                <AvatarOverlay className="avatar-overlay">
                  {uploadingAvatar ? (
                    <span>Enviando...</span>
                  ) : (
                    <>
                      <Camera size={24} />
                      <span>Alterar foto</span>
                    </>
                  )}
                </AvatarOverlay>
              </AvatarWrapper>
              <HiddenFileInput 
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              <UserType>{profile?.user_type === 'artist' ? '🎵 Artista' : '🎧 Ouvinte'}</UserType>
            </AvatarSection>

            {message && (
              <Message type={message.type}>{message.text}</Message>
            )}

            <FormSection>
              <FormGroup>
                <Label>Nome Completo</Label>
                {isEditing ? (
                  <Input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome completo"
                  />
                ) : (
                  <DisplayValue>{profile?.full_name || 'Não definido'}</DisplayValue>
                )}
              </FormGroup>

              <FormGroup>
                <Label>Email</Label>
                <DisplayValue>{profile?.email || user?.email || 'Não definido'}</DisplayValue>
                <HelpText>O email não pode ser alterado</HelpText>
              </FormGroup>

              <FormGroup>
                <Label>Tipo de Conta</Label>
                <DisplayValue>{profile?.user_type === 'artist' ? 'Artista' : 'Ouvinte'}</DisplayValue>
                <HelpText>O tipo de conta não pode ser alterado</HelpText>
              </FormGroup>

              <FormGroup>
                <Label>Membro desde</Label>
                <DisplayValue>
                  {profile?.created_at 
                    ? new Date(profile.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })
                    : 'Não disponível'
                  }
                </DisplayValue>
              </FormGroup>
            </FormSection>

            <ButtonGroup>
              {isEditing ? (
                <>
                  <CancelButton onClick={handleCancel} disabled={loading}>
                    Cancelar
                  </CancelButton>
                  <SaveButton onClick={handleSave} disabled={loading}>
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </SaveButton>
                </>
              ) : (
                <EditButton onClick={() => setIsEditing(true)}>
                  Editar Perfil
                </EditButton>
              )}
            </ButtonGroup>
          </ProfileCard>
        </ProfileContainer>
      </main>

      <GlobalMusicPlayer />
    </div>
  )
}

const ProfileContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 20px;
`

const ProfileCard = styled.div`
  background: rgba(30, 30, 30, 0.9);
  border-radius: 16px;
  padding: 32px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`

const AvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
`

const AvatarWrapper = styled.div`
  position: relative;
  cursor: pointer;
  margin-bottom: 12px;

  &:hover .avatar-overlay {
    opacity: 1;
  }
`

const Avatar = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #1db954;
  transition: opacity 0.2s;
`

const AvatarOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  color: white;
  font-size: 12px;
  gap: 4px;
`

const HiddenFileInput = styled.input`
  display: none;
`

const UserType = styled.span`
  background: linear-gradient(135deg, #1db954, #1ed760);
  color: #000;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
`

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const Label = styled.label`
  color: #b3b3b3;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const Input = styled.input`
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

const DisplayValue = styled.p`
  color: #fff;
  font-size: 16px;
  margin: 0;
`

const HelpText = styled.span`
  color: #666;
  font-size: 12px;
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const EditButton = styled(Button)`
  background: #1db954;
  color: #000;

  &:hover:not(:disabled) {
    background: #1ed760;
    transform: scale(1.02);
  }
`

const SaveButton = styled(Button)`
  background: #1db954;
  color: #000;

  &:hover:not(:disabled) {
    background: #1ed760;
    transform: scale(1.02);
  }
`

const CancelButton = styled(Button)`
  background: transparent;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.3);

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
  }
`

export default ProfilePage
