import '../Page.css'
import Sidebar from '../../components/Sidebar'
import GlobalMusicPlayer from '../../components/GlobalMusicPlayer'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import styled from 'styled-components'
import { Check, X, MessageCircle, Calendar, MapPin, DollarSign, User, Clock } from 'lucide-react'

type RequestStatus = 'pending' | 'accepted' | 'rejected'

interface BookingRequest {
  id: string
  clientName: string
  clientAvatar?: string
  eventType: string
  eventDate: string
  location: string
  budget: number
  message: string
  status: RequestStatus
  createdAt: string
}

// Dados de exemplo
const MOCK_REQUESTS: BookingRequest[] = [
  {
    id: '1',
    clientName: 'João Silva',
    eventType: 'Casamento',
    eventDate: '2025-02-15',
    location: 'São Paulo, SP',
    budget: 2500,
    message: 'Olá! Estou organizando meu casamento e adoraria ter você como atração principal. O evento será às 19h.',
    status: 'pending',
    createdAt: '2025-12-20T10:30:00Z'
  },
  {
    id: '2',
    clientName: 'Maria Santos',
    eventType: 'Aniversário',
    eventDate: '2025-01-28',
    location: 'Rio de Janeiro, RJ',
    budget: 1500,
    message: 'Gostaria de contratar para o aniversário de 50 anos da minha mãe. Será uma festa íntima.',
    status: 'pending',
    createdAt: '2025-12-19T14:00:00Z'
  },
  {
    id: '3',
    clientName: 'Empresa ABC',
    eventType: 'Festa Corporativa',
    eventDate: '2025-03-10',
    location: 'Belo Horizonte, MG',
    budget: 5000,
    message: 'Evento corporativo de confraternização. Aproximadamente 200 convidados.',
    status: 'accepted',
    createdAt: '2025-12-15T09:00:00Z'
  }
]

function ArtistRequestsPage() {
  const [activeNav, setActiveNav] = useState('solicitacoes')
  useAuth() // Verificar autenticação
  
  const [requests, setRequests] = useState<BookingRequest[]>(MOCK_REQUESTS)
  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null)
  const [filter, setFilter] = useState<'all' | RequestStatus>('all')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessage, setChatMessage] = useState('')

  const filteredRequests = requests.filter(r => filter === 'all' || r.status === filter)

  const handleAccept = async (id: string) => {
    // TODO: Implementar chamada ao backend
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'accepted' as const } : r))
    setMessage({ type: 'success', text: 'Solicitação aceita!' })
    setSelectedRequest(null)
  }

  const handleReject = async (id: string) => {
    // TODO: Implementar chamada ao backend
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' as const } : r))
    setMessage({ type: 'success', text: 'Solicitação recusada' })
    setSelectedRequest(null)
  }

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return
    // TODO: Implementar envio de mensagem ao backend
    console.log('Enviando mensagem:', chatMessage)
    setChatMessage('')
    setMessage({ type: 'success', text: 'Mensagem enviada!' })
  }

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case 'pending': return '#f0ad4e'
      case 'accepted': return '#1db954'
      case 'rejected': return '#ff4d4d'
    }
  }

  const getStatusLabel = (status: RequestStatus) => {
    switch (status) {
      case 'pending': return 'Pendente'
      case 'accepted': return 'Aceito'
      case 'rejected': return 'Recusado'
    }
  }

  return (
    <div className="page-container">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />
      
      <main className="page-content">
        <div className="page-header">
          <h1>Solicitações</h1>
          <p>Gerencie as solicitações de contratação</p>
        </div>

        <RequestsContainer>
          <RequestsCard>
            {message && (
              <Message type={message.type}>{message.text}</Message>
            )}

            <FilterSection>
              <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
                Todas
              </FilterButton>
              <FilterButton active={filter === 'pending'} onClick={() => setFilter('pending')}>
                Pendentes
              </FilterButton>
              <FilterButton active={filter === 'accepted'} onClick={() => setFilter('accepted')}>
                Aceitas
              </FilterButton>
              <FilterButton active={filter === 'rejected'} onClick={() => setFilter('rejected')}>
                Recusadas
              </FilterButton>
            </FilterSection>

            {filteredRequests.length > 0 ? (
              <RequestList>
                {filteredRequests.map(request => (
                  <RequestItem key={request.id} onClick={() => setSelectedRequest(request)}>
                    <RequestHeader>
                      <ClientInfo>
                        <ClientAvatar>
                          {request.clientAvatar ? (
                            <img src={request.clientAvatar} alt={request.clientName} />
                          ) : (
                            <User size={20} />
                          )}
                        </ClientAvatar>
                        <div>
                          <ClientName>{request.clientName}</ClientName>
                          <EventType>{request.eventType}</EventType>
                        </div>
                      </ClientInfo>
                      <StatusBadge color={getStatusColor(request.status)}>
                        {getStatusLabel(request.status)}
                      </StatusBadge>
                    </RequestHeader>
                    <RequestDetails>
                      <DetailItem>
                        <Calendar size={14} />
                        {new Date(request.eventDate).toLocaleDateString('pt-BR')}
                      </DetailItem>
                      <DetailItem>
                        <MapPin size={14} />
                        {request.location}
                      </DetailItem>
                      <DetailItem>
                        <DollarSign size={14} />
                        R$ {request.budget.toLocaleString('pt-BR')}
                      </DetailItem>
                    </RequestDetails>
                  </RequestItem>
                ))}
              </RequestList>
            ) : (
              <EmptyState>
                <MessageCircle size={48} />
                <p>Nenhuma solicitação encontrada</p>
                <span>As solicitações de contratação aparecerão aqui</span>
              </EmptyState>
            )}
          </RequestsCard>
        </RequestsContainer>

        {/* Modal de Detalhes */}
        {selectedRequest && (
          <ModalOverlay onClick={() => setSelectedRequest(null)}>
            <Modal onClick={e => e.stopPropagation()}>
              <ModalHeader>
                <div>
                  <ModalTitle>{selectedRequest.clientName}</ModalTitle>
                  <ModalSubtitle>{selectedRequest.eventType}</ModalSubtitle>
                </div>
                <StatusBadge color={getStatusColor(selectedRequest.status)}>
                  {getStatusLabel(selectedRequest.status)}
                </StatusBadge>
              </ModalHeader>

              <ModalBody>
                <DetailGrid>
                  <DetailCard>
                    <Calendar size={20} />
                    <div>
                      <DetailLabel>Data do Evento</DetailLabel>
                      <DetailValue>{new Date(selectedRequest.eventDate).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}</DetailValue>
                    </div>
                  </DetailCard>
                  <DetailCard>
                    <MapPin size={20} />
                    <div>
                      <DetailLabel>Local</DetailLabel>
                      <DetailValue>{selectedRequest.location}</DetailValue>
                    </div>
                  </DetailCard>
                  <DetailCard>
                    <DollarSign size={20} />
                    <div>
                      <DetailLabel>Orçamento</DetailLabel>
                      <DetailValue>R$ {selectedRequest.budget.toLocaleString('pt-BR')}</DetailValue>
                    </div>
                  </DetailCard>
                  <DetailCard>
                    <Clock size={20} />
                    <div>
                      <DetailLabel>Solicitado em</DetailLabel>
                      <DetailValue>{new Date(selectedRequest.createdAt).toLocaleDateString('pt-BR')}</DetailValue>
                    </div>
                  </DetailCard>
                </DetailGrid>

                <MessageSection>
                  <MessageLabel>Mensagem do Cliente</MessageLabel>
                  <MessageBox>{selectedRequest.message}</MessageBox>
                </MessageSection>

                {chatOpen && (
                  <ChatSection>
                    <ChatInput 
                      placeholder="Digite sua mensagem..."
                      value={chatMessage}
                      onChange={e => setChatMessage(e.target.value)}
                    />
                    <SendButton onClick={handleSendMessage}>Enviar</SendButton>
                  </ChatSection>
                )}
              </ModalBody>

              <ModalActions>
                {selectedRequest.status === 'pending' ? (
                  <>
                    <RejectButton onClick={() => handleReject(selectedRequest.id)}>
                      <X size={18} />
                      Recusar
                    </RejectButton>
                    <ChatButton onClick={() => setChatOpen(!chatOpen)}>
                      <MessageCircle size={18} />
                      Mensagem
                    </ChatButton>
                    <AcceptButton onClick={() => handleAccept(selectedRequest.id)}>
                      <Check size={18} />
                      Aceitar
                    </AcceptButton>
                  </>
                ) : (
                  <ChatButton onClick={() => setChatOpen(!chatOpen)}>
                    <MessageCircle size={18} />
                    Enviar Mensagem
                  </ChatButton>
                )}
              </ModalActions>
            </Modal>
          </ModalOverlay>
        )}
      </main>

      <GlobalMusicPlayer />
    </div>
  )
}

const RequestsContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 20px;
`

const RequestsCard = styled.div`
  background: rgba(30, 30, 30, 0.9);
  border-radius: 16px;
  padding: 32px;
  width: 100%;
  max-width: 800px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`

const FilterSection = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`

const FilterButton = styled.button<{ active: boolean }>`
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid ${props => props.active ? '#1db954' : 'rgba(255,255,255,0.2)'};
  background: ${props => props.active ? 'rgba(29, 185, 84, 0.2)' : 'transparent'};
  color: ${props => props.active ? '#1db954' : '#b3b3b3'};

  &:hover {
    border-color: #1db954;
  }
`

const RequestList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const RequestItem = styled.div`
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`

const RequestHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`

const ClientInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const ClientAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const ClientName = styled.h4`
  color: #fff;
  margin: 0;
  font-size: 16px;
`

const EventType = styled.span`
  color: #666;
  font-size: 12px;
`

const StatusBadge = styled.span<{ color: string }>`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  background: ${props => props.color}20;
  color: ${props => props.color};
  border: 1px solid ${props => props.color};
`

const RequestDetails = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`

const DetailItem = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #b3b3b3;
  font-size: 13px;
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
  text-align: center;
  font-size: 14px;
  background: ${props => props.type === 'success' ? 'rgba(29, 185, 84, 0.2)' : 'rgba(255, 77, 77, 0.2)'};
  color: ${props => props.type === 'success' ? '#1db954' : '#ff4d4d'};
  border: 1px solid ${props => props.type === 'success' ? '#1db954' : '#ff4d4d'};
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
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
`

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`

const ModalTitle = styled.h2`
  color: #fff;
  margin: 0;
  font-size: 20px;
`

const ModalSubtitle = styled.span`
  color: #666;
  font-size: 14px;
`

const ModalBody = styled.div`
  padding: 24px;
`

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
`

const DetailCard = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  color: #1db954;
`

const DetailLabel = styled.span`
  display: block;
  color: #666;
  font-size: 12px;
  margin-bottom: 4px;
`

const DetailValue = styled.span`
  color: #fff;
  font-size: 14px;
`

const MessageSection = styled.div`
  margin-bottom: 20px;
`

const MessageLabel = styled.span`
  display: block;
  color: #666;
  font-size: 12px;
  margin-bottom: 8px;
`

const MessageBox = styled.div`
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  color: #b3b3b3;
  font-size: 14px;
  line-height: 1.6;
`

const ChatSection = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
`

const ChatInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #1db954;
  }
`

const SendButton = styled.button`
  padding: 12px 20px;
  border-radius: 8px;
  background: #1db954;
  color: #000;
  border: none;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #1ed760;
  }
`

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  justify-content: flex-end;
`

const ActionButtonBase = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
`

const AcceptButton = styled(ActionButtonBase)`
  background: #1db954;
  color: #000;
  border: none;

  &:hover {
    background: #1ed760;
  }
`

const RejectButton = styled(ActionButtonBase)`
  background: transparent;
  color: #ff4d4d;
  border: 1px solid #ff4d4d;

  &:hover {
    background: rgba(255, 77, 77, 0.1);
  }
`

const ChatButton = styled(ActionButtonBase)`
  background: transparent;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.3);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`

export default ArtistRequestsPage
