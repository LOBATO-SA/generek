import '../Page.css'
import Sidebar from '../../components/Sidebar'
import GlobalMusicPlayer from '../../components/GlobalMusicPlayer'
import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import type { Booking, BookingStatus } from '../../types'
import { bookingService } from '../../services/bookingService'
import { pdfService } from '../../services/pdfService'
import styled from 'styled-components'
import { Check, X, MessageCircle, Calendar, MapPin, DollarSign, User, Clock, Loader, RefreshCw, Download } from 'lucide-react'

function ArtistRequestsPage() {
  const { } = useAuth()
  const [activeNav, setActiveNav] = useState('solicitacoes')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [filter, setFilter] = useState<'all' | BookingStatus>('all')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [loading, setLoading] = useState(true)

  // Carregar bookings via API
  const fetchBookings = async () => {
    setLoading(true)
    try {
      const data = await bookingService.getMyBookings('artist')
      setBookings(data)
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error)
      setMessage({ type: 'error', text: 'Erro ao carregar solicitações.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const filteredBookings = bookings.filter(b => filter === 'all' || b.status === filter)

  // Ação: artista confirma contratação
  const handleArtistConfirm = async (id: string) => {
    try {
      await bookingService.acceptBooking(id)
      setMessage({ type: 'success', text: 'Confirmação enviada!' })
      fetchBookings() // Reload list
      setSelectedBooking(null)
    } catch (error) {
      console.error('Erro ao confirmar:', error)
      setMessage({ type: 'error', text: 'Erro ao confirmar solicitação.' })
    }
  }

  // Ação: artista cancela/rejeita
  const handleArtistCancel = async (id: string) => {
    try {
      // Se estiver aguardando confirmação, é um reject. Se estiver em outro estado, pode ser cancel.
      // O endpoint rejectBooking deve ser usado para recusar inicial.
      // O cancelBooking para cancelar depois.
      // Vou assumir reject se waiting_confirmation, cancel caso contrário.
      const booking = bookings.find(b => b.id === id)
      if (booking && booking.status === 'waiting_confirmation') {
        await bookingService.rejectBooking(id)
      } else {
        await bookingService.cancelBooking(id)
      }

      setMessage({ type: 'success', text: 'Solicitação cancelada/rejeitada.' })
      fetchBookings()
      setSelectedBooking(null)
    } catch (error) {
      console.error('Erro ao cancelar:', error)
      setMessage({ type: 'error', text: 'Erro ao cancelar solicitação.' })
    }
  }

  const handleArtistFinalConfirm = async (id: string) => {
    try {
      await bookingService.confirmFinal(id)
      setMessage({ type: 'success', text: 'Finalização confirmada!' })
      fetchBookings()
      setSelectedBooking(null)
    } catch (error) {
      console.error('Erro ao finalizar:', error)
      setMessage({ type: 'error', text: 'Erro ao confirmar finalização.' })
    }
  }

  const handleDownloadContract = (booking: Booking) => pdfService.generateContractPDF(booking)

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return
    // TODO: Implementar envio de mensagem ao backend
    console.log('Enviando mensagem para booking', selectedBooking?.id, chatMessage)
    setChatMessage('')
    setMessage({ type: 'success', text: 'Mensagem enviada!' })
  }


  // Cores e labels para os novos estados
  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'waiting_confirmation': return '#f0ad4e'
      case 'waiting_payment': return '#007bff'
      case 'waiting_final_confirmation': return '#f0ad4e'
      case 'completed': return '#1db954'
      case 'cancelled': return '#ff4d4d'
      // case 'incomplete': return '#888'
      default: return '#888'
    }
  }
  const getStatusLabel = (status: BookingStatus) => {
    switch (status) {
      case 'waiting_confirmation': return 'Aguardando Confirmação'
      case 'waiting_payment': return 'Aguardando Pagamento'
      case 'waiting_final_confirmation': return 'Aguardando Confirmação Final'
      case 'completed': return 'Concluída'
      case 'cancelled': return 'Cancelada'
      // case 'incomplete': return 'Incompleta'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />
        <main className="page-content center-content">
          <Loader size={48} className="animate-spin" />
        </main>
      </div>
    )
  }

  return (
    <div className="page-container">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />

      <main className="page-content">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1>Solicitações</h1>
              <p>Gerencie as solicitações de contratação</p>
            </div>
            <RefreshButton onClick={fetchBookings} title="Atualizar lista">
              <RefreshCw size={20} className={loading ? 'spin' : ''} />
            </RefreshButton>
          </div>
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
              {['waiting_confirmation', 'waiting_payment', 'waiting_final_confirmation', 'completed', 'cancelled'].map(st => (
                <FilterButton key={st} active={filter === st} onClick={() => setFilter(st as BookingStatus)}>
                  {getStatusLabel(st as BookingStatus)}
                </FilterButton>
              ))}
            </FilterSection>

            {filteredBookings.length > 0 ? (
              <RequestList>
                {filteredBookings.map(booking => (
                  <RequestItem key={booking.id} onClick={() => setSelectedBooking(booking)}>
                    <RequestHeader>
                      <ClientInfo>
                        <ClientAvatar>
                          {booking.listener_avatar ? (
                            <img src={booking.listener_avatar} alt={booking.listener_name} />
                          ) : (
                            <User size={20} />
                          )}
                        </ClientAvatar>
                        <div>
                          <ClientName>{booking.listener_name || 'Cliente'}</ClientName>
                          <EventType>{booking.event_type}</EventType>
                        </div>
                      </ClientInfo>
                      <StatusBadge color={getStatusColor(booking.status)}>
                        {getStatusLabel(booking.status)}
                      </StatusBadge>
                    </RequestHeader>
                    <RequestDetails>
                      <DetailItem>
                        <Calendar size={14} />
                        {(() => {
                          const dateStr = booking.event_date;
                          const finalDateStr = dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`;
                          const dateObj = new Date(finalDateStr);
                          return !isNaN(dateObj.getTime())
                            ? dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'numeric', year: 'numeric' })
                            : 'Data inv.';
                        })()}
                      </DetailItem>
                      <DetailItem>
                        <MapPin size={14} />
                        {booking.location}
                      </DetailItem>
                      <DetailItem>
                        <DollarSign size={14} />
                        KZ {booking.total_price.toLocaleString('pt-BR')}
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
        {selectedBooking && (
          <ModalOverlay onClick={() => setSelectedBooking(null)}>
            <Modal onClick={e => e.stopPropagation()}>
              <ModalHeader>
                <div>
                  <ModalTitle>{selectedBooking.listener_name || 'Detalhes do Evento'}</ModalTitle>
                  <ModalSubtitle>{selectedBooking.event_type}</ModalSubtitle>
                </div>
                <StatusBadge color={getStatusColor(selectedBooking.status)}>
                  {getStatusLabel(selectedBooking.status)}
                </StatusBadge>
              </ModalHeader>

              <ModalBody>
                <DetailGrid>
                  <DetailCard>
                    <Calendar size={20} />
                    <div>
                      <DetailLabel>Data do Evento</DetailLabel>
                      <DetailValue>{(() => {
                        const dateObj = new Date(selectedBooking.event_date.includes('T') ? selectedBooking.event_date : selectedBooking.event_date + 'T00:00:00');
                        return !isNaN(dateObj.getTime())
                          ? dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
                          : selectedBooking.event_date;
                      })()}</DetailValue>
                    </div>
                  </DetailCard>
                  <DetailCard>
                    <MapPin size={20} />
                    <div>
                      <DetailLabel>Local</DetailLabel>
                      <DetailValue>{selectedBooking.location}</DetailValue>
                    </div>
                  </DetailCard>
                  <DetailCard>
                    <DollarSign size={20} />
                    <div>
                      <DetailLabel>Valor Total</DetailLabel>
                      <DetailValue>KZ {selectedBooking.total_price.toLocaleString('pt-BR')}</DetailValue>
                    </div>
                  </DetailCard>
                  <DetailCard>
                    <Clock size={20} />
                    <div>
                      <DetailLabel>Solicitado em</DetailLabel>
                      <DetailValue>{new Date(selectedBooking.created_at).toLocaleDateString('pt-BR')}</DetailValue>
                    </div>
                  </DetailCard>
                </DetailGrid>

                <MessageSection>
                  <MessageLabel>Observações</MessageLabel>
                  <MessageBox>{selectedBooking.notes || 'Nenhuma observação.'}</MessageBox>
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
                {/* Exemplo: artista pode confirmar/cancelar se status for waiting_confirmation */}
                {selectedBooking.status === 'waiting_confirmation' && !selectedBooking.artist_confirmed && (
                  <>
                    <RejectButton onClick={() => handleArtistCancel(selectedBooking.id)}>
                      <X size={18} />
                      Rejeitar
                    </RejectButton>
                    <ChatButton onClick={() => setChatOpen(!chatOpen)}>
                      <MessageCircle size={18} />
                      Mensagem
                    </ChatButton>
                    <AcceptButton onClick={() => handleArtistConfirm(selectedBooking.id)}>
                      <Check size={18} />
                      Aceitar
                    </AcceptButton>
                  </>
                )}

                {/* Confirmação Final após Pagamento */}
                {selectedBooking.status === 'waiting_final_confirmation' && !selectedBooking.artist_final_confirmed && (
                  <>
                    <ChatButton onClick={() => setChatOpen(!chatOpen)}>
                      <MessageCircle size={18} />
                      Mensagem
                    </ChatButton>
                    <AcceptButton onClick={() => handleArtistFinalConfirm(selectedBooking.id)}>
                      <Check size={18} />
                      Confirmar Realização
                    </AcceptButton>
                  </>
                )}

                {/* Chat apenas para outros status */}
                {selectedBooking.status !== 'waiting_confirmation' && selectedBooking.status !== 'waiting_final_confirmation' && (
                  <>
                    {selectedBooking.status === 'completed' && (
                      <DownloadButton onClick={() => handleDownloadContract(selectedBooking)}>
                        <Download size={18} />
                        Contrato
                      </DownloadButton>
                    )}
                    <ChatButton onClick={() => setChatOpen(!chatOpen)}>
                      <MessageCircle size={18} />
                      Enviar Mensagem
                    </ChatButton>
                  </>
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

const DownloadButton = styled(ActionButtonBase)`
  background: #1db954;
  color: #000;
  border: none;
  box-shadow: 0 4px 12px rgba(29, 185, 84, 0.3);

  &:hover {
    background: #1ed760;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(29, 185, 84, 0.4);
  }
`

const RefreshButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: #fff;
  }

  svg.spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`

export default ArtistRequestsPage
