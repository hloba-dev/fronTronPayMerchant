import React, { useEffect, useState } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import CopyButton from '../components/CopyButton';
import Loader from '../components/Loader';
import ActionMenu from '../components/ActionMenu';
import './Login.css';
import CustomSelect from '../components/CustomSelect'; // Corrected import path
import { useToast } from '../components/Toast';
import AmlDetails from '../components/AmlDetails';

const allowedStatuses = ['pending', 'wait', 'lesspay', 'completed', 'frozen', 'delete', 'refaund'];

export default function Payments() {
  const { addToast } = useToast();
  const [payments, setPayments] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null);
  const [modal, setModal] = useState(null); // {type, payment}
  const [config, setConfig] = useState(null);
  const [openAction, setOpenAction] = useState(null); // { id, position: { top, left } }
  const [isActionLoading, setIsActionLoading] = useState(false);

  // close action menu on outside click -- NOW HANDLED BY OVERLAY IN PORTAL
  // useEffect(() => {
  //   const closeMenu = () => setOpenAction(null);
  //   document.addEventListener('click', closeMenu);
  //   return () => document.removeEventListener('click', closeMenu);
  // }, []);

  const handleActionClick = (e, paymentId) => {
    e.stopPropagation();
    const rect = e.target.getBoundingClientRect();
    setOpenAction({
      id: paymentId,
      position: { top: rect.bottom + 5, left: rect.left },
    });
  };

  const getActionBtnClass = (status) => {
    switch (status) {
      case 'completed': return 'btn-success';
      case 'delete': return 'btn-danger';
      case 'frozen': return 'btn-warning';
      default: return 'btn-secondary';
    }
  };

  const menuOptions = (payment) => [
    { label: 'Детали', action: () => openDetail(payment._id) },
    { label: 'Сменить статус', action: () => openStatusModal(payment) },
    { label: 'Перевод ручной', action: () => openManualModal(payment._id) },
  ];

  const fetchPayments = async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/payments', { params: { page: p, limit: 10 } });
      setPayments(data.payments || []);
      setTotalPages(data.totalPages || 1);
      setPage(data.currentPage || p);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    // load config
    api.get('/admin/config').then(({ data }) => setConfig(data.config));
  }, []);

  const openDetail = async (id) => {
    const { data } = await api.get(`/admin/payments/${id}`);
    setDetail(data);
  };

  const openStatusModal = (payment) => setModal({ type: 'status', payment });

  const openManualModal = (paymentId, target = '') => setModal({ type: 'manual', paymentId, target });

  const openToFreezeModal = (paymentId) => setModal({ type: 'toFreeze', paymentId });

  const handleStatusSubmit = async (paymentId, newStatus) => {
    setIsActionLoading(true);
    try {
      await api.put(`/admin/payments/${paymentId}/status`, { newStatus });
      setModal(null);
      fetchPayments(page);
      addToast('Статус успешно изменен', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Ошибка смены статуса', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleManualSubmit = async (paymentId, targetWallet) => {
    setIsActionLoading(true);
    try {
      await api.post('/admin/manual-transfer', { paymentId, targetWallet });
      setModal(null);
      fetchPayments(page);
      addToast('Перевод выполнен успешно', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Ошибка ручного перевода', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      {loading && <Loader />}
      <div className="login-page">
        <div className="box-static">
          <div className="login">
            <div className="loginBx" style={{ width: '100%', overflowX: 'auto' }}>
              <h2>
                <i className="fa-solid fa-coins"></i> Платежи
              </h2>
              <table className="table">
                <thead>
                  <tr>
                    <th>ID  </th>
                    <th>Заявка</th>
                    <th>Валюта</th>
                    <th>Сумма</th>
                    <th>Статус</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p._id}>
                      <td data-label="ID"><div>{p._id}</div></td>
                      <td data-label="Заявка"><div>{p.userId || '-'}</div></td>
                      <td data-label="Валюта"><div>{p.currency}</div></td>
                      <td data-label="Сумма"><div>{p.amount}</div></td>
                      <td data-label="Статус"><div>{p.status}</div></td>
                      <td data-label="Действия">
                        <button
                          className={`btn ${getActionBtnClass(p.status)} action-toggle`}
                          onClick={(e) => handleActionClick(e, p._id)}
                        >
                          Действие 
                        </button>
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center' }}>
                        Нет платежей
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="pagination-controls">
                  <button
                    className="pagination-btn"
                    disabled={page <= 1}
                    onClick={() => fetchPayments(page - 1)}
                    aria-label="Previous Page"
                  >
                    &#x276E;
                  </button>
                  <span className="page-info">
                    {page} / {totalPages}
                  </span>
                  <button
                    className="pagination-btn"
                    disabled={page >= totalPages}
                    onClick={() => fetchPayments(page + 1)}
                    aria-label="Next Page"
                  >
                    &#x276F;
                  </button>
                </div>
              )}

              {detail && (
                <Modal onClose={() => !isActionLoading && setDetail(null)}>
                  <PaymentDetailContent
                    detail={detail}
                    freezeWallet={config?.freezeWallet}
                    refresh={() => fetchPayments(page)}
                    close={() => setDetail(null)}
                    isLoading={isActionLoading}
                    setIsLoading={setIsActionLoading}
                  />
                </Modal>
              )}

              {modal && (
                <Modal onClose={() => setModal(null)}>
                  {modal.type === 'status' && (
                    <StatusModalContent
                      payment={modal.payment}
                      onSubmit={handleStatusSubmit}
                      isLoading={isActionLoading}
                    />
                  )}
                  {modal.type === 'manual' && (
                    <ManualModalContent
                      paymentId={modal.paymentId}
                      onSubmit={handleManualSubmit}
                      isLoading={isActionLoading}
                    />
                  )}
                  {modal.type === 'toFreeze' && (
                    <TransferToFreezeContent
                      paymentId={modal.paymentId}
                      freezeWallet={config?.freezeWallet}
                      onSubmit={handleManualSubmit}
                      isLoading={isActionLoading}
                    />
                  )}
                </Modal>
              )}
            </div>
          </div>
        </div>
      </div>

      {openAction && (
        <ActionMenu
          options={menuOptions(payments.find(p => p._id === openAction.id))}
          position={openAction.position}
          onClose={() => setOpenAction(null)}
        />
      )}
    </>
  );
}

function StatusModalContent({ payment, onSubmit, isLoading }) {
  const [status, setStatus] = useState(payment.status);
  
  const statusOptions = [
    { value: 'pending', label: 'pending' },
    { value: 'wait', label: 'wait' },
    { value: 'lesspay', label: 'lesspay' },
    { value: 'completed', label: 'completed' },
    { value: 'frozen', label: 'frozen' },
    { value: 'delete', label: 'delete' },
    { value: 'refaund', label: 'refaund' }
  ];

  return (
    <div>
      {isLoading && <Loader />}
      <h3>Изменить статус</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <CustomSelect
          options={statusOptions}
          value={status}
          onChange={(newStatus) => setStatus(newStatus)}
          disabled={isLoading}
        />
        <button className="btn btn-primary" onClick={() => onSubmit(payment._id, status)} disabled={isLoading}>
          {isLoading ? '...' : 'Сохранить'}
        </button>
      </div>
    </div>
  );
}

function ManualModalContent({ paymentId, onSubmit, isLoading }) {
  const [target, setTarget] = useState('');
  return (
    <div>
      {isLoading && <Loader />}
      <h3>Ручной перевод</h3>
      <input
        type="text"
        placeholder="Адрес получателя"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        style={{ width: '100%', marginBottom: '1rem' }}
        disabled={isLoading}
      />
      <button className="btn btn-primary" onClick={() => onSubmit(paymentId, target)} disabled={isLoading}>
        {isLoading ? 'Загрузка...' : 'Отправить'}
      </button>
    </div>
  );
}

function TransferToFreezeContent({ paymentId, freezeWallet, onSubmit, isLoading }) {
  if (!freezeWallet) return <p>Freeze кошелек не настроен</p>;
  return (
    <div>
      {isLoading && <Loader />}
      <h3>Перевод на Freeze кошелек</h3>
      <p>
        Freeze кошелек: {freezeWallet}
      </p>
      <button className="btn btn-primary" onClick={() => onSubmit(paymentId, freezeWallet)} disabled={isLoading}>
        {isLoading ? 'Загрузка...' : 'Подтвердить перевод'}
      </button>
    </div>
  );
}

function PaymentDetailContent({ detail, freezeWallet, refresh, close, isLoading, setIsLoading }) {
  const { addToast } = useToast();
  const renderDetailRow = (label, value, valueColor) => {
    if (!value) return null;
    return (
      <div className="detail-row">
        <span className="detail-label">{label}</span>
        <span className="detail-value" style={{ color: valueColor }}>
          {value}
        </span>
      </div>
    );
  };

  const amlStatus =
    detail.amlPassed === true
      ? { text: 'Пройдена', color: '#28a745' }
      : detail.amlPassed === false
      ? { text: 'Не пройдена', color: '#dc3545' }
      : { text: 'Не проверено', color: '#ccc' };

  return (
    <div className="payment-detail-container">
      <h3>Детали платежа</h3>
      <div className="detail-grid">
        {renderDetailRow('ID заявки', detail._id)}
        {renderDetailRow('Заявка', detail.userId)}
        {renderDetailRow('Статус', detail.status)}
        {renderDetailRow('Валюта', detail.currency)}
        {renderDetailRow('Ожидаемая сумма', detail.amount)}
        {renderDetailRow('Реальная сумма', detail.realAmount ?? '-')}
        {renderDetailRow('Адрес кошелька', detail.walletAddress)}
        {renderDetailRow('TX ID', detail.tx_id)}
        {renderDetailRow('AML результат', amlStatus.text, amlStatus.color)}
      </div>

      {detail.amlDetail && Object.keys(detail.amlDetail).length > 0 && (
        <AmlDetails details={detail.amlDetail} />
      )}

      <div className="detail-actions">
        {isLoading && <Loader />}
        {detail.status === 'frozen' && freezeWallet && (
          <button
            className="btn btn-warning"
            disabled={isLoading}
            onClick={async () => {
              setIsLoading(true);
              try {
                await api.post('/admin/manual-transfer', { paymentId: detail._id, targetWallet: freezeWallet });
                refresh();
                close();
                addToast('Перевод на freeze-кошелек выполнен', 'success');
              } catch (err) {
                addToast(err.response?.data?.error || 'Ошибка перевода на freeze-кошелек', 'error');
              } finally {
                setIsLoading(false);
              }
            }}
          >
            {isLoading ? 'Загрузка...' : 'Перевести → Freeze'}
          </button>
        )}
        <button className="btn btn-secondary" onClick={close} disabled={isLoading}>
          Закрыть
        </button>
      </div>
    </div>
  );
} 