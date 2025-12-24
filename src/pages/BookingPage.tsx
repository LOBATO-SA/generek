import './BookingPage.css'
import Sidebar from '../components/Sidebar'
import { useState, useEffect } from 'react'
import type { Artist } from '../types'
import { useAuth } from '../contexts/AuthContext'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, MapPin, DollarSign, CheckCircle, X, PartyPopper, Loader, AlertCircle } from 'lucide-react'
import { artistService } from '../services/artistService'
import { bookingService } from '../services/bookingService'

function BookingPage() {
  const { profile } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const artistId = searchParams.get('artist')

  // State
  const [artist, setArtist] = useState<Artist | null>(null)
  const [loadingArtist, setLoadingArtist] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const [formData, setFormData] = useState({
    eventDate: '',
    eventTime: '',
    duration: '3',
    eventType: '',
    location: '',
    notes: ''
  })

  // Fetch Artist Data
  useEffect(() => {
    const fetchArtist = async () => {
      if (!artistId) {
        setLoadingArtist(false)
        return
      }
      try {
        const data = await artistService.getArtistById(artistId)
        setArtist(data)
      } catch (err) {
        console.error('Error fetching artist:', err)
        setError('Não foi possível carregar os dados do artista.')
      } finally {
        setLoadingArtist(false)
      }
    }
    fetchArtist()
  }, [artistId])

  const calculateTotal = () => {
    if (!artist?.hourly_rate || !formData.duration) return 0
    return artist.hourly_rate * parseInt(formData.duration)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile || !artist) return

    setSubmitting(true)
    setError(null)

    try {
      await bookingService.createBooking({
        artist_id: artist.id,
        event_type: formData.eventType,
        event_date: formData.eventDate,
        event_time: formData.eventTime,
        duration_hours: parseInt(formData.duration),
        location: formData.location,
        notes: formData.notes
      })

      setShowSuccessModal(true)
    } catch (err: any) {
      console.error('Error creating booking:', err)
      setError(err.response?.data?.message || 'Erro ao criar solicitação. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCloseModal = () => {
    setShowSuccessModal(false)
    // Redirect to a "My Bookings" page or Contract page
    navigate('/contract')
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (loadingArtist) {
    return (
      <div className="page-container">
        <Sidebar activeNav="contract" />
        <main className="page-content center-content">
          <Loader size={48} className="animate-spin" />
        </main>
      </div>
    )
  }

  if (!artist || !artistId) {
    return (
      <div className="page-container">
        <Sidebar activeNav="contract" />
        <main className="page-content">
          <div className="error-message">
            <h2>{error || 'Artista não especificado'}</h2>
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

        {error && (
          <div className="error-banner">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

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
                <button
                  type="submit"
                  className="submit-button"
                  disabled={submitting}
                >
                  {submitting ? 'Enviando...' : 'Solicitar Contratação'}
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
