import React, { useEffect, useState } from 'react';
import api from '../api';
import Loader from '../components/Loader';
import './Login.css';

export default function ConfigPage() {
  const [form, setForm] = useState({ mainWallet: '', freezeWallet: '', energyWallet: '' });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null); // Will now be an object { message: string, type: 'success' | 'error' }
  const [config, setConfig] = useState({});

  const fetchConfig = async () => {
    // Initial fetch doesn't need to show the big loader
    try {
      const { data } = await api.get('/admin/config');
      setForm(data.config || {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const { data } = await api.put('/admin/config', {
        mainWallet  : form.mainWallet,
        freezeWallet: form.freezeWallet,
        energyWallet: form.energyWallet,
      });
      const successText = data.message && data.message.trim() !== '' ? data.message : 'Конфигурация сохранена';
      setMsg({ message: successText, type: 'success' });
    } catch (err) {
      // Standardize the error message shape to be an object
      const errorMessage = err.response?.data?.error || err.message || 'Произошла неизвестная ошибка.';
      setMsg({ message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="box-static" style={{ maxWidth: '700px' }}>
        <div className="login">
          {loading && <Loader />}
          <div className="loginBx" style={{ width: '100%' }}>
            <h2>
              <i className="fa-solid fa-gears" style={{ marginRight: '10px' }}></i>
              Настройка кошельков
            </h2>

            <form onSubmit={handleSubmit} className="config-form">
              {[
                { field: 'mainWallet', label: 'Основной кошелек' },
                { field: 'freezeWallet', label: 'Freeze кошелек' },
                { field: 'energyWallet', label: 'Energy кошелек' },
              ].map(({ field, label }) => (
                <div key={field} className="form-group">
                  <label htmlFor={field}>{label}</label>
                  <input
                    type="text"
                    id={field}
                    name={field}
                    value={form[field] || ''}
                    onChange={handleChange}
                    required
                  />
                </div>
              ))}
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Сохранение...' : 'Сохранить'}
              </button>
            </form>

            {msg && (
              <p className={`message ${msg.type === 'error' ? 'error' : 'success'}`}>
                {msg.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 