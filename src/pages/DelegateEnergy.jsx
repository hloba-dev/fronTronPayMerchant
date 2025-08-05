import React, { useState, useEffect } from 'react';
import api from '../api';
import Loader from '../components/Loader';
import CopyButton from '../components/CopyButton';
import './Login.css'; // Reuse styles

export default function DelegateEnergy() {
  const [tronAddress, setTronAddress] = useState('');
  const [energy, setEnergy] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    const { data } = await api.get('/admin/config');
    setConfig(data.config);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const { data } = await api.post('/admin/delegate-energy', { tronAddress, energy });
      setMsg({ text: data.message || 'Энергия успешно делегирована', type: 'success' });
      setTronAddress('');
      setEnergy('');
    } catch (err) {
      setMsg({ text: err.response?.data?.error || 'Ошибка делегирования', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="box-static" style={{ maxWidth: '600px' }}>
        <div className="login">
          {loading && <Loader />}
          <div className="loginBx" style={{ width: '100%' }}>
            <h2>
              <i className="fa-solid fa-bolt" style={{ marginRight: '10px' }}></i>
              Делегировать энергию
            </h2>

            {config && (
              <div className="config-info-box">
                <div className="detail-row">
                  <span className="detail-label">Основной кошелек</span>
                  <span className="detail-value">
                    {config.mainWallet}
                    <CopyButton text={config.mainWallet} />
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Freeze кошелек</span>
                  <span className="detail-value">
                    {config.freezeWallet}
                    <CopyButton text={config.freezeWallet} />
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="delegate-form">
              <input
                type="text"
                placeholder="TRON адрес"
                value={tronAddress}
                onChange={(e) => setTronAddress(e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Количество энергии"
                value={energy}
                onChange={(e) => setEnergy(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Выполняется...' : 'Делегировать'}
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