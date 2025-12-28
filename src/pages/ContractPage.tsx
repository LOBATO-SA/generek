import './Page.css'
import styled from 'styled-components'
import Sidebar from '../components/Sidebar'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, MapPin, CheckCircle, XCircle, Plus, Loader, AlertCircle, ThumbsUp, ThumbsDown, DollarSign, RefreshCw, Download } from 'lucide-react'
import PaymentModal from '../components/PaymentModal'
import type { Booking } from '../types'
import type { BookingStatus } from '../types'
import { bookingService } from '../services/bookingService'
import { pdfService } from '../services/pdfService'
import { useAuth } from '../contexts/AuthContext'

function ContractPage() {
  const { profile } = useAuth()
  const isArtist = profile?.user_type === 'artist'

  const [activeNav, setActiveNav] = useState('contract')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [currentBooking, setCurrentBooking] = useState<{ id: string, price: number } | null>(null)

  const statusOptions: { label: string; value: 'all' | BookingStatus }[] = [
    { label: 'Todas', value: 'all' },
    { label: 'Aguardando Confirmação', value: 'waiting_confirmation' },
    { label: 'Aguardando Pagamento', value: 'waiting_payment' },
    { label: 'Aguardando Confirmação Final', value: 'waiting_final_confirmation' },
    { label: 'Concluídas', value: 'completed' },
    { label: 'Canceladas', value: 'cancelled' },
  ]
  const [filter, setFilter] = useState<'all' | BookingStatus>('all')

  const fetchBookings = async () => {
    setLoading(true)
    setError(null)
    try {
      // The role parameter is currently unused in the service but good for semantics
      const data = await bookingService.getMyBookings(isArtist ? 'artist' : 'listener')
      console.log('📦 Bookings fetched:', data)
      setBookings(data)
    } catch (err) {
      console.error('Error fetching bookings:', err)
      setError('Erro ao carregar contratações.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [isArtist])

  const filteredBookings = bookings.filter(b =>
    filter === 'all' || b.status === filter
  )

  function getStatusText(status: BookingStatus | 'all') {
    switch (status) {
      case 'waiting_confirmation': return 'Aguardando Confirmação'
      case 'waiting_payment': return 'Aguardando Pagamento'
      case 'waiting_final_confirmation': return 'Aguardando Confirmação Final'
      case 'confirmed_by_artist': return 'Confirmado pelo Artista'
      case 'paid': return 'Pago'
      case 'completed': return 'Concluída'
      case 'cancelled': return 'Cancelada'
      case 'all': return 'Todas'
      default: return status
    }
  }

  function getStatusIcon(status: BookingStatus) {
    switch (status) {
      case 'completed':
        return <CheckCircle size={18} className="status-icon confirmed" />
      case 'cancelled':
        return <XCircle size={18} className="status-icon cancelled" />
      default:
        return <Clock size={18} className="status-icon pending" />
    }
  }

  // Booking Actions
  const handleAction = async (actionFn: () => Promise<any>, bookingId: string) => {
    setActionLoading(bookingId)
    try {
      await actionFn()
      // Refresh list
      await fetchBookings()
    } catch (err) {
      console.error(`Error performing action on booking ${bookingId}:`, err)
      alert("Erro ao realizar ação. Tente novamente.")
    } finally {
      setActionLoading(null)
    }
  }

  // Listener Actions
  const handlePayClick = (id: string, price: number) => {
    setCurrentBooking({ id, price })
    setShowPaymentModal(true)
  }

  const handlePaySuccess = async () => {
    if (!currentBooking) return
    await handleAction(() => bookingService.payBooking(currentBooking.id), currentBooking.id)
  }

  const handleFinalConfirm = (id: string) => handleAction(() => bookingService.confirmFinal(id), id)
  const handleCancel = (id: string) => handleAction(() => bookingService.cancelBooking(id), id)
  const handleDownloadContract = (booking: Booking) => pdfService.generateContractPDF(booking)

  // Artist Actions
  const handleArtistAccept = (id: string) => handleAction(() => bookingService.acceptBooking(id), id)
  const handleArtistReject = (id: string) => handleAction(() => bookingService.rejectBooking(id), id)

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
          <div className="header-content">
            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ flex: 1 }}>
                <h1>{isArtist ? 'Solicitações de Shows' : 'Minhas Contratações'}</h1>
                <p>{isArtist
                  ? 'Gerencie as solicitações de shows recebidas'
                  : 'Gerencie suas solicitações de contratação de artistas'
                }</p>
              </div>
              <RefreshButton onClick={fetchBookings} title="Atualizar lista">
                <RefreshCw size={20} className={loading ? 'spin' : ''} />
              </RefreshButton>
            </div>
            {!isArtist && (
              <Link to="/artists" className="new-booking-btn" style={{ marginLeft: '16px' }}>
                <Plus size={20} />
                Nova Contratação
              </Link>
            )}
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Filters */}
        <div className="bookings-filters">
          {statusOptions.map(opt => (
            <button
              key={opt.value}
              className={`filter-btn ${filter === opt.value ? 'active' : ''}`}
              onClick={() => setFilter(opt.value)}
            >
              {opt.label} ({opt.value === 'all' ? bookings.length : bookings.filter(b => b.status === opt.value).length})
            </button>
          ))}
        </div>

        {/* Bookings List */}
        <div className="bookings-container">
          {filteredBookings.length === 0 ? (
            <div className="empty-state">
              <Calendar size={64} />
              <h3>Nenhuma contratação encontrada</h3>
              <p>
                {filter === 'all'
                  ? (isArtist ? 'Você ainda não recebeu nenhuma solicitação.' : 'Você ainda não fez nenhuma contratação.')
                  : `Não há contratações com status "${getStatusText(filter)}".`}
              </p>
              {!isArtist && (
                <Link to="/artists" className="empty-state-btn">
                  <Plus size={18} />
                  Contratar um Artista
                </Link>
              )}
            </div>
          ) : (
            <div className="bookings-grid">
              {filteredBookings.map((booking) => {
                // Determine who to show: If I'm artist, show Listener. If I'm Listener, show Artist.
                const otherPartyName = isArtist ? booking.listener_name : booking.artist_name;
                const otherPartyAvatar = isArtist ? booking.listener_avatar : booking.artist_avatar;
                // Since generic listener avatar might be empty, handle reasonable fallback
                const displayAvatar = otherPartyAvatar || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=150&h=150';

                return (
                  <div key={booking.id} className={`booking-card status-${booking.status}`}>
                    <div className="booking-header">
                      <div className="artist-info-small">
                        <img
                          src={displayAvatar}
                          alt={otherPartyName}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=150&h=150';
                          }}
                        />
                        <div>
                          <h3>{otherPartyName}</h3>
                          <p>{booking.event_type}</p>
                        </div>
                      </div>
                      <div className="booking-status">
                        {getStatusIcon(booking.status)}
                        <span>{getStatusText(booking.status)}</span>
                      </div>
                    </div>

                    <div className="booking-details">
                      <div className="detail-row">
                        <Calendar size={16} />
                        <span>
                          {(() => {
                            const dateStr = booking.event_date;
                            const finalDateStr = dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`;
                            const dateObj = new Date(finalDateStr);
                            return !isNaN(dateObj.getTime())
                              ? dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
                              : 'Data inválida';
                          })()}
                          {booking.event_time && ` às ${booking.event_time}`}
                        </span>
                      </div>
                      <div className="detail-row">
                        <Clock size={16} />
                        <span>{booking.duration_hours} horas</span>
                      </div>
                      <div className="detail-row">
                        <MapPin size={16} />
                        <span>{booking.location}</span>
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="booking-notes">
                        <strong>Observações:</strong>
                        <p>{booking.notes}</p>
                      </div>
                    )}

                    <div className="booking-footer">
                      <div className="booking-price">
                        <span>Total:</span>
                        <strong>KZ {(booking.total_price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                      </div>

                      <div className="booking-actions">
                        {actionLoading === booking.id && <Loader size={16} className="animate-spin" />}

                        {/* Status Logic for Actions */}

                        {/* 1. Waiting Confirmation */}
                        {booking.status === 'waiting_confirmation' && (
                          <>
                            {isArtist ? (
                              <>
                                <button className="action-btn confirm" onClick={() => handleArtistAccept(booking.id)} disabled={!!actionLoading} title="Aceitar">
                                  <ThumbsUp size={18} />
                                </button>
                                <button className="action-btn cancel" onClick={() => handleArtistReject(booking.id)} disabled={!!actionLoading} title="Rejeitar">
                                  <ThumbsDown size={18} />
                                </button>
                              </>
                            ) : (
                              <button className="action-btn cancel" onClick={() => handleCancel(booking.id)} disabled={!!actionLoading} title="Cancelar">
                                <XCircle size={18} />
                              </button>
                            )}
                          </>
                        )}

                        {/* 2. Waiting Payment */}
                        {booking.status === 'waiting_payment' && (
                          <>
                            {!isArtist && !booking.payment_done && (
                              <button className="action-btn confirm" onClick={() => handlePayClick(booking.id, booking.total_price || 0)} disabled={!!actionLoading} title="Pagar">
                                <DollarSign size={18} />
                              </button>
                            )}
                            <button className="action-btn cancel" onClick={() => handleCancel(booking.id)} disabled={!!actionLoading} title="Cancelar">
                              <XCircle size={18} />
                            </button>
                          </>
                        )}

                        {/* 3. Final Confirmation */}
                        {booking.status === 'waiting_final_confirmation' && (
                          <>
                            {/* Listener needs to confirm */}
                            {!isArtist && !booking.listener_final_confirmed && (
                              <button className="action-btn confirm" onClick={() => handleFinalConfirm(booking.id)} disabled={!!actionLoading} title="Confirmar Final">
                                <CheckCircle size={18} />
                              </button>
                            )}
                            {/* Artist needs to confirm too? Usually final confirmation is mutual or listener-driven after payment */}
                            {isArtist && !booking.artist_confirmed && (
                              <button className="action-btn confirm" onClick={() => handleFinalConfirm(booking.id)} disabled={!!actionLoading} title="Confirmar Final">
                                <CheckCircle size={18} />
                              </button>
                            )}
                          </>
                        )}

                        {/* 4. Completed */}
                        {booking.status === 'completed' && (
                          <DownloadButton
                            onClick={() => handleDownloadContract(booking)}
                            title="Baixar Contrato PDF"
                          >
                            <Download size={18} />
                            <span>Contrato</span>
                          </DownloadButton>
                        )}

                      </div>
                    </div>

                    <div className="booking-date-created">
                      Criado em {new Date(booking.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {currentBooking && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaySuccess}
          totalPrice={currentBooking.price}
        />
      )}
    </div>
  )
}


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
  margin-left: 16px;

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

const DownloadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  height: 44px;
  background: #1db954;
  color: #000;
  border: none;
  border-radius: 22px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(29, 185, 84, 0.3);

  &:hover {
    background: #1ed760;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(29, 185, 84, 0.4);
  }

  svg {
    flex-shrink: 0;
  }

  span {
    white-space: nowrap;
  }
`

export default ContractPage
