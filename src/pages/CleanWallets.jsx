import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';
import Loader from '../components/Loader';
import './Login.css';

export default function CleanWallets() {
  const [wallets, setWallets] = useState([]);
  const [form, setForm] = useState({ walletAddress: '', exchange: '' });
  const [loading, setLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [msg, setMsg] = useState(null); // Will now be an object { message: string, type: 'success' | 'error' }

  const fetchWallets = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/clean-wallets');
      setWallets(data);
    } catch (err) {
      setMsg({ message: 'Ошибка загрузки кошельков', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsActionLoading(true);
    setMsg(null);
    try {
      const { data } = await api.post('/admin/clean-wallets', { walletAddress: form.walletAddress, exchange: form.exchange });
      setForm({ walletAddress: '', exchange: '' });
      fetchWallets();
      setMsg({ message: data.message, type: 'success' });
    } catch (err) {
      // Standardize the error message shape to be an object
      const errorMessage = err.response?.data?.error || err.message || 'Произошла неизвестная ошибка.';
      setMsg({ message: errorMessage, type: 'error' });
    } finally {
      setIsActionLoading(false);
    }
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот кошелек?')) return;
    setIsActionLoading(true);
    setMsg(null);
    try {
      const { data } = await api.delete(`/admin/clean-wallets/${id}`);
      fetchWallets();
      setMsg({ message: data.message, type: 'success' });
    } catch (err) {
      // Standardize the error message shape to be an object
      const errorMessage = err.response?.data?.error || err.message || 'Произошла неизвестная ошибка.';
      setMsg({ message: errorMessage, type: 'error' });
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="box-static" style={{ maxWidth: '900px' }}>
        <div className="login">
          {(loading || isActionLoading) && <Loader />}
          <div className="loginBx" style={{ width: '100%' }}>
            <h2>
              <i className="fa-solid fa-broom" style={{ marginRight: '10px' }}></i>
              База чистых кошельков
            </h2>
            
            <form onSubmit={handleSubmit} className="clean-wallet-form">
              <input
                type="text"
                name="walletAddress"
                placeholder="Адрес кошелька"
                value={form.walletAddress}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="exchange"
                placeholder="Биржа"
                value={form.exchange}
                onChange={handleChange}
                required
              />
              <button type="submit" className="btn btn-primary" disabled={isActionLoading}>
                {isActionLoading ? 'Добавление...' : 'Добавить'}
              </button>
            </form>

            {msg && (
              <p className={`message ${msg.type === 'error' ? 'error' : 'success'}`}>
                {msg.message}
              </p>
            )}

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Кошелек</th>
                    <th>Биржа</th>
                    <th>Действие</th>
                  </tr>
                </thead>
                <tbody>
                  {wallets.map((w) => (
                    <tr key={w._id}>
                      <td data-label="Кошелек"><div>{w.walletAddress}</div></td>
                      <td data-label="Биржа"><div>{w.exchange}</div></td>
                      <td data-label="Действие">
                        <button className="btn btn-danger" onClick={() => handleDelete(w._id)} disabled={isActionLoading}>
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                  {wallets.length === 0 && !loading && (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center' }}>
                        Нет данных
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 