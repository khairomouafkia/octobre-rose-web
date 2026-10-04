import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAdmin } from '../hooks/useAdmin';

const ADMIN_NAV = [
  { to: '/admin/events', icon: '📰', key: 'events' as const },
  { to: '/admin/centers', icon: '🗺️', key: 'centers' as const },
  { to: '/admin/community', icon: '💬', key: 'community' as const },
];

export default function AdminLayout() {
  const { t } = useTranslation();
  const isAdmin = useAdmin();

  if (isAdmin === null) {
    return (
      <div className="state-block" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="container" style={{ paddingTop: 80 }}>
        <div className="state-block">
          <span className="state-icon">🔒</span>
          <h2 className="text-h3">{t('admin.notAuthorizedTitle')}</h2>
          <p>{t('admin.notAuthorizedBody')}</p>
          <NavLink to="/app" className="btn btn-outline" style={{ marginTop: 12 }}>
            {t('nav.home')}
          </NavLink>
        </div>
      </div>
    );
  }

  return (
    <div className="app-frame">
      <aside className="app-sidebar admin-sidebar">
        <div className="brand">
          <span>🛠️</span>
          <span>{t('admin.title')}</span>
        </div>
        {ADMIN_NAV.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'active' : '')}>
            <span>{item.icon}</span>
            <span>{t(`admin.${item.key}`)}</span>
          </NavLink>
        ))}
        <div className="sidebar-footer">
          <NavLink to="/app" className="nav-link">
            <span>←</span>
            <span>{t('nav.home')}</span>
          </NavLink>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <span className="app-topbar-title">{t('admin.title')}</span>
          <NavLink to="/app" className="icon-btn" aria-label="خروج من لوحة الإدارة">
            ←
          </NavLink>
        </header>
        <main className="app-content" style={{ maxWidth: 1040 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
