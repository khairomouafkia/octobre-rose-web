import React from 'react';
import { Link } from 'react-router-dom';
import LanguageSwitcher from '../components/LanguageSwitcher';

const FEATURES = [
  { key: 'معلومات عامة', icon: '🗓️', accent: '#294740' },
  { key: 'مراكز الفحص', icon: '📍', accent: '#bc8268' },
  { key: 'محادثة آمنة', icon: '💬', accent: '#5f8b78' },
  { key: 'مجتمع داعم', icon: '👥', accent: '#294740' },
] as const;

export default function LandingPage() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="site-header-inner">
          <div className="brand-lockup">
            <div className="brand-copy">
              <span className="brand-title-line">
                <span className="brand-name">طمانينة</span>
                <span className="brand-ribbon" role="img" aria-label="شريط التوعية بسرطان الثدي">🎗️</span>
              </span>
              <span className="brand-tag">للتوعية بسرطان الثدي</span>
            </div>
          </div>

          <div className="header-actions">
            <div className="lang-switch">
              <LanguageSwitcher />
            </div>
            <Link to="/app" className="header-login">
              دخول التطبيق
            </Link>
          </div>
        </div>
      </header>

      <main className="page-shell">
        <section className="hero-card">
          <div className="hero-inner">
            <div className="hero-copy">
              <div className="hero-badge">💗 خطوة صغيرة، طمأنينة أكبر</div>
              <h1 className="hero-main-title">
                <span>خطوة صغيرة،</span>
                <span>طمأنينة أكبر.</span>
              </h1>
              <p className="hero-description">
                مساحة هادئة لتعلم سرطان الثدي، معرفة علامات الاكتشاف المبكر، ومتابعة خطواتكِ بثقة وخصوصية.
              </p>
              <div className="hero-actions">
                <Link to="/app" className="primary-btn">ابدئي بالتعرّف</Link>
                <Link to="/app/centers" className="secondary-btn">استكشفي مراكز الفحص</Link>
              </div>
            </div>

            <div className="hero-art" aria-hidden="true">
              <div className="hero-orbit" />
              <div className="hero-flower" />
              <div className="hero-tiny-dot" />
              <div className="hero-heart" />
            </div>
          </div>
        </section>

        <section className="paths-box" id="features">
          <div className="section-intro">
            <h2 className="section-title">اختاري خطوتكِ</h2>
            <span className="section-badge">خصوصية • معلومات عامة</span>
          </div>

          <div className="quick-grid">
            {FEATURES.map((item) => (
              <div key={item.key} className="quick-card" style={{ ['--accent' as string]: item.accent }}>
                <span className="quick-card-icon">{item.icon}</span>
                <span className="quick-card-title">{item.key}</span>
                <span className="quick-card-subtitle">معلومات موثوقة، مساعدة مريحة، وتوجيه واضح داخل بيئة داعمة.</span>
                <span className="quick-card-arrow">←</span>
              </div>
            ))}
          </div>
        </section>

        <div className="trust-strip">
          <div className="trust-copy">
            <strong>معلومات توعوية وأدوات دعم</strong>
            <span>التواصل الآمن، الفحوص المبكرة، والمجتمع الداعم</span>
          </div>
          <div className="status-pill">
            <span className="status-dot connected" />
            متصل
          </div>
        </div>

        <div className="page-warning">
          <span className="icon-wrap">🛡️</span>
          <span>محتوى توعوي عام، وليس تشخيصًا أو بديلاً عن المختص الطبي.</span>
        </div>
      </main>

      <footer className="footer">طمانينة • محتوى توعوي عام لا يحل محل التشخيص الطبي</footer>
    </div>
  );
}
