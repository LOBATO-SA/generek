import './Sidebar.css'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Search, Disc, ListMusic, Heart, User, Handshake, LogOut, Menu, UserRoundPen, Music, FileText, MessageSquare } from "lucide-react"
import { useAuth } from '../contexts/AuthContext.tsx'

interface SidebarProps {
  activeNav?: string
  onNavChange?: (nav: string) => void
}

function Sidebar({ activeNav, onNavChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut, profile } = useAuth()

  const isArtist = profile?.user_type === 'artist'

  // Menu para Ouvintes
  const listenerNavItems = [
    { id: 'discover', path: '/home', icon: Home, label: 'Página Inicial' },
    { id: 'trending', path: '/search', icon: Search, label: 'Pesquisar' },
    { id: 'playlist', path: '/playlist', icon: ListMusic, label: 'Playlist' },
    { id: 'favorites', path: '/favorites', icon: Heart, label: 'Favoritos' },
    { id: 'artists', path: '/artists', icon: User, label: 'Artistas' }
  ]

  const listenerBottomItems = [
    { id: 'profile', path: '/profile', icon: UserRoundPen, label: 'Perfil' },
    { id: 'settings', path: '/contract', icon: Handshake, label: 'Contratar' },
    { id: 'logout', path: '/auth', icon: LogOut, label: 'Sair' }
  ]

  // Menu para Artistas
  const artistNavItems = [
    { id: 'bio', path: '/artist/bio', icon: FileText, label: 'Minha Bio' },
    { id: 'musicas', path: '/artist/music', icon: Music, label: 'Minhas Músicas' },
    { id: 'solicitacoes', path: '/artist/requests', icon: MessageSquare, label: 'Solicitações' }
  ]

  const artistBottomItems = [
    { id: 'profile', path: '/profile', icon: UserRoundPen, label: 'Perfil' },
    { id: 'logout', path: '/auth', icon: LogOut, label: 'Sair' }
  ]

  const navItems = isArtist ? artistNavItems : listenerNavItems
  const bottomItems = isArtist ? artistBottomItems : listenerBottomItems

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      {!isOpen && (
        <button className="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle menu">
          <Menu size={24} />
        </button>
      )}

      <aside className={`main-menu ${isOpen ? 'open' : ''}`}>
        <div>
          <div className="user-info">
            <img src={profile?.avatar_url || "https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/37e5ccfa-f9ee-458b-afa2-dcd85b495e4e"} alt="user" />
            <p>{profile?.full_name || 'Usuário'}</p>
          </div>
          <ul>
            {navItems.map((item) => {
              const IconComponent = item.icon
              const isActive = location.pathname === item.path || activeNav === item.id
              return (
                <li 
                  key={item.id} 
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    if (onNavChange) onNavChange(item.id)
                    if (window.innerWidth <= 768) {
                      setIsOpen(false)
                    }
                  }}
                >
                  <Link to={item.path} data-tooltip={item.label}>
                    <IconComponent className="nav-icon" size={20} />
                    <span className="nav-text">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
        
        <ul>
          {bottomItems.map((item) => {
            const IconComponent = item.icon
            const isActive = location.pathname === item.path || activeNav === item.id
            const isLogout = item.id === 'logout'
            
            return (
              <li 
                key={item.id} 
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={async () => {
                  if (isLogout) {
                    await signOut()
                    navigate('/auth')
                    return
                  }
                  if (onNavChange) onNavChange(item.id)
                  if (window.innerWidth <= 768) {
                    setIsOpen(false)
                  }
                }}
              >
                {isLogout ? (
                  <a href="#" data-tooltip={item.label} onClick={(e) => e.preventDefault()}>
                    <IconComponent className="nav-icon" size={20} />
                    <span className="nav-text">{item.label}</span>
                  </a>
                ) : (
                  <Link to={item.path} data-tooltip={item.label}>
                    <IconComponent className="nav-icon" size={20} />
                    <span className="nav-text">{item.label}</span>
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </aside>

      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
    </>
  )
}

export default Sidebar
