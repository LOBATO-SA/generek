import './Page.css'
import Sidebar from '../components/Sidebar'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react'

interface Booking {
  id: string
  artistId: string
  artistName: string
  artistAvatar: string
  eventType: string
  eventDate: string
  eventTime: string
  duration: string
  location: string
  notes: string
  status: 'pending' | 'confirmed' | 'cancelled'
  totalPrice: number
  createdAt: string
}

function ContractPage() {
  const [activeNav, setActiveNav] = useState('contract')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all')

  useEffect(() => {
    // Carregar contratações do localStorage
    const savedBookings = localStorage.getItem('bookings')
    if (savedBookings) {
      setBookings(JSON.parse(savedBookings))
    }
  }, [])


  const updateStatus = (id: string, status: 'pending' | 'confirmed' | 'cancelled') => {
    const updatedBookings = bookings.map(b => 
      b.id === id ? { ...b, status } : b
    )
    setBookings(updatedBookings)
    localStorage.setItem('bookings', JSON.stringify(updatedBookings))
  }

  const filteredBookings = bookings.filter(b => 
    filter === 'all' || b.status === filter
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle size={18} className="status-icon confirmed" />
      case 'cancelled':
        return <XCircle size={18} className="status-icon cancelled" />
      default:
        return <AlertCircle size={18} className="status-icon pending" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado'
      case 'cancelled':
        return 'Cancelado'
      default:
        return 'Pendente'
    }
  }

  return (
    <div className="page-container">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />
      <main className="page-content">
        <div className="page-header">
          <div className="header-content">
            <div>
              <h1>Minhas Contratações</h1>
              <p>Gerencie suas solicitações de contratação de artistas</p>
            </div>
            <Link to="/artists" className="new-booking-btn">
              <Plus size={20} />
              Nova Contratação
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bookings-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todas ({bookings.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pendentes ({bookings.filter(b => b.status === 'pending').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'confirmed' ? 'active' : ''}`}
            onClick={() => setFilter('confirmed')}
          >
            Confirmadas ({bookings.filter(b => b.status === 'confirmed').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setFilter('cancelled')}
          >
            Canceladas ({bookings.filter(b => b.status === 'cancelled').length})
          </button>
        </div>

        {/* Bookings List */}
        <div className="bookings-container">
          {filteredBookings.length === 0 ? (
            <div className="empty-state">
              <Calendar size={64} />
              <h3>Nenhuma contratação encontrada</h3>
              <p>
                {filter === 'all' 
                  ? 'Você ainda não fez nenhuma solicitação de contratação.'
                  : `Não há contratações com status "${getStatusText(filter)}".`}
              </p>
              <Link to="/artists" className="empty-state-btn">
                <Plus size={18} />
                Contratar um Artista
              </Link>
            </div>
          ) : (
            <div className="bookings-grid">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className={`booking-card status-${booking.status}`}>
                  <div className="booking-header">
                    <div className="artist-info-small">
                      <img src={booking.artistAvatar} alt={booking.artistName} />
                      <div>
                        <h3>{booking.artistName}</h3>
                        <p>{booking.eventType}</p>
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
                        {new Date(booking.eventDate + 'T00:00:00').toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                        {booking.eventTime && ` às ${booking.eventTime}`}
                      </span>
                    </div>
                    <div className="detail-row">
                      <Clock size={16} />
                      <span>{booking.duration} horas</span>
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
                      <strong>KZ {booking.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                    </div>
                    <div className="booking-actions">
                      {booking.status === 'pending' && (
                        <>
                          <button 
                            className="action-btn confirm"
                            onClick={() => updateStatus(booking.id, 'confirmed')}
                            title="Confirmar"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button 
                            className="action-btn cancel"
                            onClick={() => updateStatus(booking.id, 'cancelled')}
                            title="Cancelar"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="booking-date-created">
                    Criado em {new Date(booking.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default ContractPage
