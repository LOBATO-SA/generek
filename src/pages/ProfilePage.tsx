import './Page.css'
import Sidebar from '../components/Sidebar'
import GlobalMusicPlayer from '../components/GlobalMusicPlayer'
import { useState } from 'react'

function ProfilePage() {
  const [activeNav, setActiveNav] = useState('profile')

  return (
    <div className="page-container">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />
      
      <main className="page-content">
        <div className="page-header">
          <h1>Profile</h1>
          <p>Manage your account settings</p>
        </div>

        <div className="content-section">
          <div className="profile-info">
            <img src="https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/37e5ccfa-f9ee-458b-afa2-dcd85b495e4e" alt="Profile" />
            <h2>Jane Wilson</h2>
            <p>jane.wilson@example.com</p>
          </div>
        </div>
      </main>

      <GlobalMusicPlayer />
    </div>
  )
}

export default ProfilePage
