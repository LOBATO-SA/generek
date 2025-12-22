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
import { MusicPlayerProvider } from './contexts/MusicPlayerContext.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { ProtectedRoute } from './components/ProtectedRoute.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <MusicPlayerProvider>
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={<App />} />
            <Route path="/auth" element={<AuthPage />} />

            {/* Rotas Protegidas */}
            <Route path="/home" element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } />
            <Route path="/search" element={
              <ProtectedRoute>
                <SearchPage />
              </ProtectedRoute>
            } />
            <Route path="/playlist" element={
              <ProtectedRoute>
                <PlaylistPage />
              </ProtectedRoute>
            } />
            <Route path="/favorites" element={
              <ProtectedRoute>
                <FavoritesPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/contract" element={
              <ProtectedRoute>
                <ContractPage />
              </ProtectedRoute>
            } />
            <Route path="/artists" element={
              <ProtectedRoute>
                <ArtistsPage />
              </ProtectedRoute>
            } />
            <Route path="/artists/:id" element={
              <ProtectedRoute>
                <ArtistProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/booking" element={
              <ProtectedRoute>
                <BookingPage />
              </ProtectedRoute>
            } />
          </Routes>
        </MusicPlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
