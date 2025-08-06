import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './NavBar.css';
import { createPortal } from 'react-dom';

export default function NavBar() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    // No need to navigate, ProtectedRoute will automatically redirect.
  };

  // Use NavLink for active styling
  const links = (onClick) => (
    <>
      <NavLink to="/payments" onClick={onClick}>Платежи</NavLink>
      <NavLink to="/delegate-energy" onClick={onClick}>Делегирование</NavLink>
      <NavLink to="/config" onClick={onClick}>Конфигурация</NavLink>
      <NavLink to="/clean-wallets" onClick={onClick}>База чистых кошельков</NavLink>
      <NavLink to="/subscriptions" onClick={onClick}>Подписки</NavLink>
      <NavLink to="/reports" onClick={onClick}>Отчеты</NavLink>
    </>
  );

  const drawer = (
    <div className={`side-drawer ${open ? 'open' : ''}`} onClick={() => setOpen(false)}>
      <button className="drawer-close" onClick={() => setOpen(false)}>&times;</button>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        {links(() => setOpen(false))}
        <button className="logout-btn" style={{ marginTop: '1rem' }} onClick={handleLogout}>
          Выход
        </button>
      </div>
    </div>
  );

  return (
    <>
      <nav className="nav-bar">
        <div className="nav-left">
          <button className="mobile-toggle" onClick={() => setOpen(!open)}>
            ☰
          </button>
        </div>

        <div className="nav-center">
          <div className="nav-links desktop-only">{links()}</div>
        </div>

        <div className="nav-right">
          <button onClick={handleLogout} className="logout-btn">
            Выход <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      </nav>
      {createPortal(drawer, document.body)}
    </>
  );
} 