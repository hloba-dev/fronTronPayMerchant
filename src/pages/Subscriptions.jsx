import React, { useEffect, useState } from 'react';
import api from '../api';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import CustomSelect from '../components/CustomSelect';
import { useToast } from '../components/Toast';
import './Login.css';

export default function SubscriptionsPage() {
  const { addToast } = useToast();
  const [subs, setSubs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null); // whole subscription object
  const [isSaving, setIsSaving] = useState(false);

  const fetchSubs = async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/subscriptions', { params: { page: p, limit: 10 } });
      setSubs(data.subscriptions || []);
      setPage(data.currentPage || p);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      addToast(err.response?.data?.error || 'Ошибка загрузки подписок', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubs();
  }, []);

  const saveField = async (id, field, value) => {
    setIsSaving(true);
    try {
      await api.put(`/admin/subscriptions/${id}`, { [field]: value });
      addToast('Изменения сохранены', 'success');
      fetchSubs(page);
    } catch (err) {
      addToast(err.response?.data?.error || 'Ошибка сохранения', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <Loader/>;

  return (
    <>
      {loading && <Loader/>}
      <div className="login-page">
        <div className="box-static">
          <div className="login">
            <h2><i className="fa-solid fa-repeat"></i> Подписки</h2>
            <div className="table-container" style={{overflowX:'auto'}}>
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Почта</th>
                    <th>Статус оплаты</th>
                    <th>Статус подписки</th>
                    <th>Сумма</th>
                    <th>Действие</th>
                  </tr>
                </thead>
                <tbody>
                  {subs.map(s => (
                    <tr key={s._id}>
                      <td data-label="ID"><div>{s._id}</div></td>
                      <td data-label="Email"><div>{s.email}</div></td>
                      <td data-label="PaymentStatus"><div>{s.paymentStatus}</div></td>
                      <td data-label="SubStatus"><div>{s.subscriptionStatus}</div></td>
                      <td data-label="Amount"><div>{s.paymentAmount}</div></td>
                      <td data-label="Action">
                        <button className="btn btn-secondary" onClick={() => setDetail(s)}>Детали</button>
                      </td>
                    </tr>
                  ))}
                  {subs.length===0 && (<tr><td colSpan="6" style={{textAlign:'center'}}>Нет данных</td></tr>)}
                </tbody>
              </table>
            </div>

            {totalPages>1 && (
              <div className="pagination-controls">
                <button className="pagination-btn" disabled={page<=1} onClick={()=>fetchSubs(page-1)}>&#x276E;</button>
                <span className="page-info">{page}/{totalPages}</span>
                <button className="pagination-btn" disabled={page>=totalPages} onClick={()=>fetchSubs(page+1)}>&#x276F;</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {detail && (
        <Modal onClose={()=>!isSaving && setDetail(null)}>
          <SubscriptionDetail sub={detail} saveField={saveField} isSaving={isSaving}/>
        </Modal>
      )}
    </>
  );
}

function SubscriptionDetail({ sub, saveField, isSaving }) {
  const statusOptions = [
    { value:'pending', label:'pending' },
    { value:'paid', label:'paid' },
    { value:'deleted', label:'deleted' }
  ];
  const subStatusOptions = [
    { value:'active', label:'active' },
    { value:'inactive', label:'inactive' }
  ];

  return (
    <div>
      {isSaving && <Loader/>}
      <h3>Подписка {sub.orderNumber}</h3>
      <div className="detail-grid" style={{marginBottom:'1rem'}}>
        <div className="detail-row"><span className="detail-label">Email</span>{sub.email}</div>
        <div className="detail-row"><span className="detail-label">Сумма</span>{sub.paymentAmount}</div>
        <div className="detail-row"><span className="detail-label">Истекает</span>{new Date(sub.expiresAt).toLocaleDateString()}</div>
      </div>

      <div className="detail-row" style={{marginBottom:'1rem'}}>
        <span className="detail-label">Статус оплаты</span>
        <CustomSelect options={statusOptions} value={sub.paymentStatus} onChange={(val)=>saveField(sub._id,'paymentStatus',val)} disabled={isSaving}/>
      </div>
      <div className="detail-row" style={{marginBottom:'1rem'}}>
        <span className="detail-label">Статус подписки</span>
        <CustomSelect options={subStatusOptions} value={sub.subscriptionStatus} onChange={(val)=>saveField(sub._id,'subscriptionStatus',val)} disabled={isSaving}/>
      </div>
    </div>
  );
} 