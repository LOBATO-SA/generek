import './BookingPage.css'
import Sidebar from '../components/Sidebar'
import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, MapPin, DollarSign, CheckCircle, X, PartyPopper } from 'lucide-react'

interface Artist {
  id: string
  name: string
  avatar_url: string
  verified: boolean
  hourly_rate: number
}

const mockArtists: Record<string, Artist> = {
  '1': {
    id: '1',
    name: 'Ana Silva',
    avatar_url: 'https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/398875d0-9b9e-494a-8906-210aa3f777e0',
    verified: true,
    hourly_rate: 2500
  },
  '2': {
    id: '2',
    name: 'DJ Thunder',
    avatar_url: 'https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/810d1ddc-1168-4990-8d43-a0ffee21fb8c',
    verified: true,
    hourly_rate: 3500
  },
  '3': {
    id: '3',
    name: 'Carlos Mendes',
    avatar_url: 'https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/7bd23b84-d9b0-4604-a7e3-872157a37b61',
    verified: false,
    hourly_rate: 1800
  }
}

function BookingPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const artistId = searchParams.get('artist') || '1'
  const artist = mockArtists[artistId]

  const [formData, setFormData] = useState({
    eventDate: '',
    eventTime: '',
    duration: '3',
    eventType: '',
    location: '',
    notes: ''
  })

  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const calculateTotal = () => {
    if (!artist?.hourly_rate || !formData.duration) return 0
    return artist.hourly_rate * parseInt(formData.duration)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Criar nova contratação
    const newBooking = {
      id: Date.now().toString(),
      artistId: artist.id,
      artistName: artist.name,
      artistAvatar: artist.avatar_url,
      eventType: formData.eventType,
      eventDate: formData.eventDate,
      eventTime: formData.eventTime,
      duration: formData.duration,
      location: formData.location,
      notes: formData.notes,
      status: 'pending' as const,
      totalPrice: calculateTotal(),
      createdAt: new Date().toISOString()
    }

    // Salvar no localStorage
    const existingBookings = localStorage.getItem('bookings')
    const bookings = existingBookings ? JSON.parse(existingBookings) : []
    bookings.push(newBooking)
    localStorage.setItem('bookings', JSON.stringify(bookings))

    setShowSuccessModal(true)
  }

  const handleCloseModal = () => {
    setShowSuccessModal(false)
    navigate('/contract')
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (!artist) {
    return (
      <div className="page-container">
        <Sidebar activeNav="contract" />
        <main className="page-content">
          <div className="error-message">
            <h2>Artista não encontrado</h2>
            <Link to="/artists" className="back-button">
              Voltar para Artistas
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="page-container">
      <Sidebar activeNav="contract" />
      
      <main className="page-content">
        {/* Header */}
        <div className="booking-header">
          <Link to={`/artists/${artistId}`} className="back-link">
            <ArrowLeft size={20} />
            Voltar
          </Link>
          <h1>Nova Contratação</h1>
          <p>Preencha os detalhes do seu evento</p>
        </div>

        <div className="booking-layout">
          {/* Form */}
          <div className="booking-form-container">
            <form onSubmit={handleSubmit} className="booking-form">
              <h2>Detalhes do Evento</h2>

              <div className="form-group">
                <label htmlFor="eventType">Tipo de Evento *</label>
                <input
                  id="eventType"
                  type="text"
                  placeholder="Ex: Casamento, Festa, Corporativo"
                  value={formData.eventType}
                  onChange={(e) => handleChange('eventType', e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="eventDate">Data do Evento *</label>
                  <input
                    id="eventDate"
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => handleChange('eventDate', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="eventTime">Horário *</label>
                  <input
                    id="eventTime"
                    type="time"
                    value={formData.eventTime}
                    onChange={(e) => handleChange('eventTime', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="duration">Duração (horas) *</label>
                <input
                  id="duration"
                  type="number"
                  min="1"
                  max="12"
                  value={formData.duration}
                  onChange={(e) => handleChange('duration', e.target.value)}
                  required
                />
                <p className="form-hint">
                  Valor: KZ {artist.hourly_rate.toLocaleString('pt-BR')}/hora
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="location">Local do Evento *</label>
                <input
                  id="location"
                  type="text"
                  placeholder="Cidade, Estado"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">Observações</label>
                <textarea
                  id="notes"
                  placeholder="Detalhes adicionais sobre o evento, preferências musicais, etc."
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                />
              </div>

              <div className="form-footer">
                <button type="submit" className="submit-button">
                  Solicitar Contratação
                </button>
                <p className="form-hint-center">
                  Você receberá uma confirmação por email
                </p>
              </div>
            </form>
          </div>

          {/* Summary Sidebar */}
          <aside className="booking-summary">
            <div className="summary-card">
              <h3>Resumo</h3>

              {/* Artist Info */}
              <div className="summary-artist">
                <div className="summary-avatar">
                  <img src={artist.avatar_url} alt={artist.name} />
                </div>
                <div className="summary-artist-info">
                  <div className="summary-artist-name">
                    {artist.name}
                    {artist.verified && (
                      <CheckCircle size={16} className="verified-icon" />
                    )}
                  </div>
                  <p className="summary-artist-label">Artista</p>
                </div>
              </div>

              {/* Event Details */}
              <div className="summary-details">
                {formData.eventDate && (
                  <div className="summary-item">
                    <Calendar size={20} className="summary-icon" />
                    <div>
                      <p className="summary-label">Data</p>
                      <p className="summary-value">
                        {new Date(formData.eventDate + 'T00:00:00').toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                        {formData.eventTime && ` às ${formData.eventTime}`}
                      </p>
                    </div>
                  </div>
                )}

                {formData.duration && (
                  <div className="summary-item">
                    <Clock size={20} className="summary-icon" />
                    <div>
                      <p className="summary-label">Duração</p>
                      <p className="summary-value">{formData.duration} horas</p>
                    </div>
                  </div>
                )}

                {formData.location && (
                  <div className="summary-item">
                    <MapPin size={20} className="summary-icon" />
                    <div>
                      <p className="summary-label">Local</p>
                      <p className="summary-value">{formData.location}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="summary-price">
                <div className="price-row">
                  <span>Valor por hora</span>
                  <span>KZ {artist.hourly_rate.toLocaleString('pt-BR')}</span>
                </div>
                <div className="price-row">
                  <span>Duração</span>
                  <span>{formData.duration || 0}h</span>
                </div>
                <div className="price-total">
                  <span>Total</span>
                  <span className="total-value">
                    KZ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="summary-note">
                <DollarSign size={16} />
                <p>O pagamento será processado após a confirmação do artista</p>
              </div>
            </div>
          </aside>
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={handleCloseModal}>
                <X size={24} />
              </button>
              
              <div className="modal-icon">
                <PartyPopper size={48} />
              </div>
              
              <h2 className="modal-title">Solicitação Enviada!</h2>
              
              <p className="modal-message">
                A sua solicitação de contratação para <strong>{artist.name}</strong> foi enviada com sucesso!
              </p>
              
              <div className="modal-details">
                <div className="modal-detail-item">
                  <Calendar size={18} />
                  <span>{formData.eventDate && new Date(formData.eventDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="modal-detail-item">
                  <Clock size={18} />
                  <span>{formData.duration} horas</span>
                </div>
                <div className="modal-detail-item">
                  <MapPin size={18} />
                  <span>{formData.location}</span>
                </div>
              </div>
              
              <p className="modal-note">
                Você receberá uma confirmação por email assim que o artista responder.
              </p>
              
              <button className="modal-button" onClick={handleCloseModal}>
                Ver Minhas Contratações
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default BookingPage
