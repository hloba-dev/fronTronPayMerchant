import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import Loader from '../components/Loader';
import './Login.css';

export default function TwoFA() {
  const nav = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const { addToast } = useToast();
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  // Get the tempToken from the navigation state.
  const tempToken = location.state?.tempToken;

  // This effect runs ONCE and checks for the tempToken.
  // If it's missing, it redirects immediately.
  useEffect(() => {
    if (!tempToken) {
      addToast('Сессия истекла, пожалуйста, войдите снова.', 'error');
      nav('/login', { replace: true });
    }
  }, []); // Empty dependency array ensures it runs only once.

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tempToken) return; // Guard against submission if no token

    setLoading(true);
    try {
      const { data } = await api.post('/admin/2fa', { token, tempToken });
      console.log('Ответ от /admin/2fa:', data); // <--- DEBUG LINE
      if (data.accessToken) {
        auth.login(data.accessToken);
        nav('/payments', { replace: true });
      } else {
        addToast('Не удалось получить токен доступа', 'error');
      }
    } catch (err) {
      addToast(err.response?.data?.error || 'Ошибка 2FA', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loader />}
      <div className="login-page">
        <div className="box">
          <div className="login">
            <div className="loginBx">
              <h2>
                <i className="fa-solid fa-shield-halved"></i> 2FA
              </h2>
              <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <input
                  type="text"
                  placeholder="Код Google Authenticator"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                />
                {/* error && <p style={{ color: 'var(--accent)' }}>{error}</p> */}
                <input
                  type="submit"
                  value={loading ? '...' : 'Подтвердить'}
                  disabled={loading}
                />
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 