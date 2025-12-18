import './Sidebar.css'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Search, Disc, ListMusic, Heart, User, Handshake, LogOut, Menu } from "lucide-react"

interface SidebarProps {
  activeNav?: string
  onNavChange?: (nav: string) => void
}

function Sidebar({ activeNav, onNavChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const navItems = [
    { id: 'discover', path: '/home', icon: Home, label: 'Página Inicial' },
    { id: 'trending', path: '/search', icon: Search, label: 'Pesquisar' },
    { id: 'playlist', path: '/playlist', icon: ListMusic, label: 'Playlist' },
    { id: 'favorites', path: '/favorites', icon: Heart, label: 'Favoritos' },
    { id: 'artists', path: '/artists', icon: User, label: 'Artistas' }
  ]

  const bottomItems = [
    { id: 'profile', path: '/profile', icon: User, label: 'Perfil' },
    { id: 'settings', path: '/contract', icon: Handshake, label: 'Contratar' },
    { id: 'logout', path: '/auth', icon: LogOut, label: 'Sair' }
  ]

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
            <img src="https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/37e5ccfa-f9ee-458b-afa2-dcd85b495e4e" alt="user" />
            <p>Jane Wilson</p>
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
      </aside>

      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
    </>
  )
}

export default Sidebar
