import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthService } from '../service/authService';
import { useAdmin } from '../hooks/useAdmin';
import LanguageSwitcher from '../components/LanguageSwitcher';
import LoginScreen from '../pages/LoginScreen';

const NAV_ITEMS = [
  { to: '/app', end: true, icon: '🏠', key: 'home' as const },
  { to: '/app/assistant', end: false, icon: '✨', key: 'assistant' as const },
  { to: '/app/screenings', end: false, icon: '🗓️', key: 'screenings' as const },
  { to: '/app/community', end: false, icon: '💬', key: 'community' as const },
  { to: '/app/events', end: false, icon: '📰', key: 'events' as const },
  { to: '/app/centers', end: false, icon: '📍', key: 'centers' as const },
];

export default function AppLayout() {
  const { t } = useTranslation();
  const isAdmin = useAdmin();
  const [authVersion, setAuthVersion] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isLoggedIn = AuthService.isLoggedIn;
  const user = AuthService.currentUser;

  const handleAccount = () => {
    if (isLoggedIn) {
      if (window.confirm(`${user?.displayName ?? ''}\n${user?.email ?? ''}\n\n${t('nav.logout')}?`)) {
        AuthService.signOut().then(() => setAuthVersion((v) => v + 1));
      }
    } else {
      setShowLogin(true);
    }
  };

  const navLabel = (key: (typeof NAV_ITEMS)[number]['key']) => t(`nav.${key}`);

  return (
    <div className="app-shell" key={authVersion}>
      <header className="site-header">
        <div className="site-header-inner">
          <div className="brand-lockup">
            <div className="brand-copy">
              <span className="brand-title-line">
                <button
                  type="button"
                  className="menu-toggle"
                  aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
                  aria-expanded={menuOpen}
                  aria-controls="user-navigation-drawer"
                  onClick={() => setMenuOpen((v) => !v)}
                >
                  {menuOpen ? '✕' : '☰'}
                </button>
                <span className="brand-name">طمانينة</span>
                <span className="brand-ribbon" role="img" aria-label="شريط التوعية بسرطان الثدي">🎗️</span>
              </span>
              <span className="brand-tag">للتوعية بسرطان الثدي</span>
            </div>
          </div>

          <nav className="desktop-nav" aria-label="التنقل الرئيسي">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-pill${isActive ? ' active' : ''}`}
              >
                <span aria-hidden="true">{item.icon}</span>
                <span>{navLabel(item.key)}</span>
              </NavLink>
            ))}
          </nav>

          <div className="header-actions">
            <div className="lang-switch">
              <LanguageSwitcher />
            </div>
            <button type="button" className="header-login" onClick={handleAccount}>
              {isLoggedIn ? user?.displayName ?? t('common.guest') : t('nav.login')}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <button
          type="button"
          className="drawer-backdrop"
          aria-label="إغلاق القائمة الجانبية"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div className="app-workspace">
        <aside
          id="user-navigation-drawer"
          className={`app-sidebar user-sidebar${menuOpen ? ' is-open' : ''}`}
          aria-hidden={!menuOpen}
        >
          <div className="brand">
            <span aria-hidden="true">🎗️</span>
            <span>طمانينة</span>
          </div>
          <nav aria-label="التنقل الجانبي">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                tabIndex={menuOpen ? 0 : -1}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                <span aria-hidden="true">{item.icon}</span>
                <span>{navLabel(item.key)}</span>
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink
                to="/admin"
                tabIndex={menuOpen ? 0 : -1}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                <span aria-hidden="true">🛠️</span>
                <span>{t('nav.admin')}</span>
              </NavLink>
            )}
          </nav>
        </aside>

        <main className="page-shell app-page-shell">
          <Outlet />
        </main>
      </div>

      <nav className="bottom-nav" aria-label="التنقل السفلي">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span>{navLabel(item.key)}</span>
          </NavLink>
        ))}
      </nav>

      {showLogin && (
        <div className="modal-overlay" onClick={() => setShowLogin(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <LoginScreen
              onSuccess={() => {
                setShowLogin(false);
                setAuthVersion((v) => v + 1);
              }}
              onCancel={() => setShowLogin(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
