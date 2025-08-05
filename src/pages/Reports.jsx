import React, { useState, useEffect } from 'react';
import api from '../api';
import Loader from '../components/Loader';
import { useToast } from '../components/Toast';
import './Reports.css';

const StatCard = ({ title, value, iconClass }) => (
  <div className="stat-card">
    <div className="stat-card-icon">
      <i className={`fa-solid ${iconClass}`}></i>
    </div>
    <div className="stat-card-content">
      <div className="stat-card-title">{title}</div>
      <div className="stat-card-value">{value}</div>
    </div>
  </div>
);


export default function ReportsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/reports/today');
        setStats(data);
      } catch (error) {
        addToast(error.response?.data?.error || 'Не удалось загрузить отчет', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [addToast]);

  return (
    <div className="login-page">
      <div className="box-static" style={{ maxWidth: '1000px' }}>
        <div className="login">
          {loading && <Loader />}
          <div className="loginBx" style={{ width: '100%' }}>
            <h2>
              <i className="fa-solid fa-chart-line" style={{ marginRight: '10px' }}></i>
              Отчет за сегодня
            </h2>
            
            {stats && (
              <div className="stats-grid">
                <StatCard 
                  title="Всего USDT" 
                  value={stats.totalUsdt.toFixed(2)} 
                  iconClass="fa-dollar-sign" 
                />
                <StatCard 
                  title="Кол-во USDT транзакций" 
                  value={stats.countUsdt} 
                  iconClass="fa-arrow-right-arrow-left" 
                />
                <StatCard 
                  title="Всего TRX" 
                  value={stats.totalTrx.toFixed(2)} 
                  iconClass="fa-sun" // Example icon for TRX
                />
                <StatCard 
                  title="Кол-во TRX транзакций" 
                  value={stats.countTrx} 
                  iconClass="fa-arrow-right-arrow-left" 
                />
                <StatCard 
                  title="Удалено заявок" 
                  value={stats.deletedCountToday} 
                  iconClass="fa-trash-can" 
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 