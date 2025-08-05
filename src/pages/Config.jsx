import React, { useEffect, useState } from 'react';
import api from '../api';
import Loader from '../components/Loader';
import './Login.css';

export default function ConfigPage() {
  const [form, setForm] = useState({ mainWallet: '', freezeWallet: '', energyWallet: '' });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

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
    setMsg(null);
    setLoading(true);
    try {
      await api.put('/admin/config', form);
      setMsg({ text: 'Настройки успешно сохранены', type: 'success' });
    } catch (err) {
      setMsg({ text: err.response?.data?.error || 'Ошибка сохранения', type: 'error' });
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
                {msg.text}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 