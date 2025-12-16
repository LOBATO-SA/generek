import './Sidebar.css'
import { useState } from 'react'

interface SidebarProps {
  activeNav: string
  onNavChange: (nav: string) => void
}

function Sidebar({ activeNav, onNavChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { id: 'discover', icon: 'map', label: 'Discover' },
    { id: 'trending', icon: 'arrow-trend-up', label: 'Trending' },
    { id: 'album', icon: 'compact-disc', label: 'Album' },
    { id: 'playlist', icon: 'circle-play', label: 'Playlist' },
    { id: 'favorites', icon: 'heart', label: 'Favorites' }
  ]

  const bottomItems = [
    { id: 'profile', icon: 'user', label: 'Profile' },
    { id: 'settings', icon: 'gear', label: 'Settings' },
    { id: 'logout', icon: 'right-from-bracket', label: 'Logout' }
  ]

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      {!isOpen && (
        <button className="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle menu">
          <i className="fa fa-bars"></i>
        </button>
      )}

      <aside className={`main-menu ${isOpen ? 'open' : ''}`}>
        <div>
          <div className="user-info">
            <img src="https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/37e5ccfa-f9ee-458b-afa2-dcd85b495e4e" alt="user" />
            <p>Jane Wilson</p>
          </div>
          <ul>
            {navItems.map((item) => (
              <li 
                key={item.id} 
                className={`nav-item ${activeNav === item.id ? 'active' : ''}`} 
                onClick={() => {
                  onNavChange(item.id)
                  if (window.innerWidth <= 768) {
                    setIsOpen(false)
                  }
                }}
              >
                <a href="#">
                  <i className={`fa fa-${item.icon} nav-icon`}></i>
                  <span className="nav-text">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        
        <ul>
          {bottomItems.map((item) => (
            <li 
              key={item.id} 
              className="nav-item"
              onClick={() => {
                onNavChange(item.id)
                if (window.innerWidth <= 768) {
                  setIsOpen(false)
                }
              }}
            >
              <a href="#">
                <i className={`fa fa-${item.icon} nav-icon`}></i>
                <span className="nav-text">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </aside>

      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
    </>
  )
}

export default Sidebar
