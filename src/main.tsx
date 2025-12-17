import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import App from './App.tsx'
import AuthPage from './AuthPage.tsx'
import HomePage from './HomePage.tsx'
import SearchPage from './pages/SearchPage.tsx'
import PlaylistPage from './pages/PlaylistPage.tsx'
import FavoritesPage from './pages/FavoritesPage.tsx'
import ProfilePage from './pages/ProfilePage.tsx'
import ContractPage from './pages/ContractPage.tsx'
import ArtistsPage from './pages/ArtistsPage.tsx'
import ArtistProfilePage from './pages/ArtistProfilePage.tsx'
import BookingPage from './pages/BookingPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/playlist" element={<PlaylistPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/contract" element={<ContractPage />} />
        <Route path="/artists" element={<ArtistsPage />} />
        <Route path="/artists/:id" element={<ArtistProfilePage />} />
        <Route path="/booking" element={<BookingPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
