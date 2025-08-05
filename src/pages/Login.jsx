import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useToast } from '../components/Toast';
import Loader from '../components/Loader';
import './Login.css';

export default function Login() {
  const nav = useNavigate();
  const { addToast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/admin/login', { username, password });
      // Pass the tempToken via navigation state as per instructions
      nav('/2fa', { state: { tempToken: data.tempToken } });
    } catch (err) {
      addToast(err.response?.data?.error || 'Ошибка входа', 'error');
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
                <i className="fa-solid fa-user"></i> Вход
              </h2>
              <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <input
                  type="text"
                  placeholder="Логин"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {/* Error handling is now handled by useToast */}
                <input
                  type="submit"
                  value={loading ? '...' : 'Войти'}
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