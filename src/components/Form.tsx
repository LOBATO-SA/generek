import React, { useState } from 'react';
import styled from 'styled-components';
import type { UserType } from '../types';

interface FormProps {
  isLogin?: boolean;
  onSubmit?: (data: { email: string; password: string; name?: string; userType?: UserType }) => void;
  onToggleMode?: () => void;
  loading?: boolean;
  error?: string | null;
  successMessage?: string | null;
}

const Form: React.FC<FormProps> = ({ isLogin = true, onSubmit, onToggleMode, loading = false, error = null, successMessage = null }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [userType, setUserType] = useState<UserType>('listener');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(isLogin ? { email, password } : { email, password, name, userType });
    }
  };

  return (
    <StyledWrapper>
      <form className="form" onSubmit={handleSubmit}>
        <p id="heading">{isLogin ? 'Login' : 'Cadastro'}</p>
        
        {!isLogin && (
          <div className="field">
            <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
              <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
            </svg>
            <input 
              autoComplete="off" 
              placeholder="Nome completo" 
              className="input-field" 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        )}

        {!isLogin && (
          <div className="user-type-selector">
            <p className="user-type-label">Eu sou:</p>
            <div className="user-type-options">
              <button
                type="button"
                className={`user-type-btn ${userType === 'listener' ? 'active' : ''}`}
                onClick={() => setUserType('listener')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 3a5 5 0 0 0-5 5v1h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a6 6 0 1 1 12 0v5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1V8a5 5 0 0 0-5-5z"/>
                </svg>
                <span>Ouvinte</span>
                <small>Quero contratar artistas</small>
              </button>
              <button
                type="button"
                className={`user-type-btn ${userType === 'artist' ? 'active' : ''}`}
                onClick={() => setUserType('artist')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="currentColor" viewBox="0 0 16 16">
                  <path d="M6 13c0 1.105-1.12 2-2.5 2S1 14.105 1 13c0-1.104 1.12-2 2.5-2s2.5.896 2.5 2zm9-2c0 1.105-1.12 2-2.5 2s-2.5-.895-2.5-2 1.12-2 2.5-2 2.5.895 2.5 2z"/>
                  <path fillRule="evenodd" d="M14 11V2h1v9h-1zM6 3v10H5V3h1z"/>
                  <path d="M5 2.905a1 1 0 0 1 .9-.995l8-.8a1 1 0 0 1 1.1.995V3L5 4V2.905z"/>
                </svg>
                <span>Artista</span>
                <small>Quero ser contratado</small>
              </button>
            </div>
          </div>
        )}

        <div className="field">
          <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
            <path d="M13.106 7.222c0-2.967-2.249-5.032-5.482-5.032-3.35 0-5.646 2.318-5.646 5.702 0 3.493 2.235 5.708 5.762 5.708.862 0 1.689-.123 2.304-.335v-.862c-.43.199-1.354.328-2.29.328-2.926 0-4.813-1.88-4.813-4.798 0-2.844 1.921-4.881 4.594-4.881 2.735 0 4.608 1.688 4.608 4.156 0 1.682-.554 2.769-1.416 2.769-.492 0-.772-.28-.772-.76V5.206H8.923v.834h-.11c-.266-.595-.881-.964-1.6-.964-1.4 0-2.378 1.162-2.378 2.823 0 1.737.957 2.906 2.379 2.906.8 0 1.415-.39 1.709-1.087h.11c.081.67.703 1.148 1.503 1.148 1.572 0 2.57-1.415 2.57-3.643zm-7.177.704c0-1.197.54-1.907 1.456-1.907.93 0 1.524.738 1.524 1.907S8.308 9.84 7.371 9.84c-.895 0-1.442-.725-1.442-1.914z" />
          </svg>
          <input 
            autoComplete="off" 
            placeholder="Email" 
            className="input-field" 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
          </svg>
          <input 
            placeholder="Senha" 
            className="input-field" 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="btn">
          <button type="submit" className="button1" disabled={loading}>
            {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Cadastrar')}
          </button>
        </div>

        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {isLogin && (
          <button type="button" className="button3">Esqueceu a senha?</button>
        )}

        <div className="toggle-mode">
          <p>
            {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
            {' '}
            <button type="button" onClick={onToggleMode}>
              {isLogin ? 'Cadastre-se' : 'Entrar'}
            </button>
          </p>
        </div>
      </form>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .form {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-left: 1.5em;
    padding-right: 1.5em;
    padding-bottom: 0.8em;
    background-color: #171717;
    border-radius: 20px;
    transition: .4s ease-in-out;
  }

  .form:hover {
    transform: scale(1.05);
    border: 1px solid black;
  }

  #heading {
    text-align: center;
    margin: 1.2em 0 0.8em 0;
    color: rgb(255, 255, 255);
    font-size: 1.1em;
  }

  .field {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5em;
    border-radius: 20px;
    padding: 0.5em;
    border: none;
    outline: none;
    color: white;
    background-color: #171717;
    box-shadow: inset 2px 5px 10px rgb(5, 5, 5);
  }

  .input-icon {
    height: 1.3em;
    width: 1.3em;
    fill: white;
  }

  .input-field {
    background: none;
    border: none;
    outline: none;
    width: 100%;
    color: #d3d3d3;
  }

  .form .btn {
    display: flex;
    justify-content: center;
    flex-direction: row;
    margin-top: 1.2em;
  }

  .button1 {
    padding: 0.6em 2em;
    border-radius: 5px;
    border: none;
    outline: none;
    transition: .4s ease-in-out;
    background-color: #252525;
    color: white;
    font-size: 0.95em;
    font-weight: 600;
    cursor: pointer;
    width: 100%;
  }

  .button1:hover {
    background-color: black;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }

  .button3 {
    margin-bottom: 0.5em;
    margin-top: 0.8em;
    padding: 0.4em;
    border-radius: 5px;
    border: none;
    outline: none;
    transition: .4s ease-in-out;
    background-color: #252525;
    color: white;
    cursor: pointer;
    font-size: 0.85em;
  }

  .button3:hover {
    background-color: red;
    color: white;
    transform: translateY(-2px);
  }

  .toggle-mode {
    text-align: center;
    margin-top: 0.5em;
    margin-bottom: 1em;
    padding-top: 0.8em;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .toggle-mode p {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9em;
    margin: 0;
  }

  .toggle-mode button {
    background: none;
    border: none;
    color: #4a9eff;
    font-weight: 700;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.3s ease;
    font-size: 0.9em;
    padding: 0;
    position: relative;
  }

  .toggle-mode button::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 2px;
    background: #4a9eff;
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  .toggle-mode button:hover::after {
    transform: scaleX(1);
  }

  .toggle-mode button:hover {
    color: #6bb1ff;
  }

  .user-type-selector {
    margin-top: 0.5em;
  }

  .user-type-label {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9em;
    margin-bottom: 0.5em;
    text-align: center;
  }

  .user-type-options {
    display: flex;
    gap: 0.5em;
  }

  .user-type-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3em;
    padding: 0.8em 0.5em;
    border-radius: 12px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    background-color: #252525;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .user-type-btn:hover {
    border-color: rgba(74, 158, 255, 0.5);
    background-color: #2a2a2a;
  }

  .user-type-btn.active {
    border-color: #4a9eff;
    background-color: rgba(74, 158, 255, 0.15);
    color: white;
  }

  .user-type-btn span {
    font-weight: 600;
    font-size: 0.9em;
  }

  .user-type-btn small {
    font-size: 0.7em;
    opacity: 0.7;
    text-align: center;
  }

  .user-type-btn svg {
    opacity: 0.8;
  }

  .user-type-btn.active svg {
    opacity: 1;
    fill: #4a9eff;
  }

  .error-message {
    background-color: rgba(255, 59, 48, 0.15);
    border: 1px solid rgba(255, 59, 48, 0.3);
    color: #ff6b6b;
    padding: 0.6em 0.8em;
    border-radius: 8px;
    font-size: 0.85em;
    text-align: center;
    margin-top: 0.5em;
  }

  .success-message {
    background-color: rgba(52, 199, 89, 0.15);
    border: 1px solid rgba(52, 199, 89, 0.3);
    color: #34c759;
    padding: 0.6em 0.8em;
    border-radius: 8px;
    font-size: 0.85em;
    text-align: center;
    margin-top: 0.5em;
  }

  .button1:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
`;

export default Form;
