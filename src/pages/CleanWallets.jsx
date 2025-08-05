import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';
import Loader from '../components/Loader';
import './Login.css';

export default function CleanWallets() {
  const [wallets, setWallets] = useState([]);
  const [form, setForm] = useState({ walletAddress: '', exchange: '' });
  const [loading, setLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const fetchWallets = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/clean-wallets');
      setWallets(data);
    } catch (err) {
      setMsg({ type: 'error', text: 'Ошибка загрузки кошельков' });
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
    setMsg(null);
    setIsActionLoading(true);
    try {
      await api.post('/admin/clean-wallets', form);
      setForm({ walletAddress: '', exchange: '' });
      fetchWallets();
      setMsg({ type: 'success', text: 'Кошелек успешно добавлен' });
    } catch (err) {
      setMsg({ text: err.response?.data?.error || 'Ошибка добавления', type: 'error' });
    } finally {
      setIsActionLoading(false);
    }
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот кошелек?')) return;
    setIsActionLoading(true);
    try {
      await api.delete(`/admin/clean-wallets/${id}`);
      fetchWallets();
      setMsg({ type: 'success', text: 'Кошелек удален' });
    } catch (err) {
      setMsg({ text: err.response?.data?.error || 'Ошибка удаления', type: 'error' });
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
                {msg.text}
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