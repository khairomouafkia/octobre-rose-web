import React from 'react';
import { useNavigate } from 'react-router-dom';

interface QuickCardProps {
  title: string;
  subtitle: string;
  icon: string;
  onClick: () => void;
}

function QuickCard({ title, subtitle, icon, onClick }: QuickCardProps) {
  return (
    <button className="quick-card" onClick={onClick}>
      <span className="quick-card-icon">{icon}</span>
      <span className="quick-card-title">{title}</span>
      <span className="quick-card-subtitle">{subtitle}</span>
      <span className="quick-card-arrow">←</span>
    </button>
  );
}

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <section className="hero-card">
        <div className="hero-inner">
          <div className="hero-copy">
            <div className="hero-badge">💗 توعية صحية وداعمة</div>
            <h1 className="hero-main-title">
              <span>خطوة صغيرة،</span>
              <span>طمأنينة أكبر.</span>
            </h1>
            <p className="hero-description">
              اكتشفي معلومات موثوقة عن سرطان الثدي، تبقّي على اطلاع بوقت الفحوص، ووجّهي أسئلتكِ بثقة في مساحة آمنة.
            </p>
            <div className="hero-actions">
              <button className="primary-btn" onClick={() => navigate('/app/assistant')}>ابدئي بالتعرّف</button>
              <button className="secondary-btn" onClick={() => navigate('/app/centers')}>استكشفي مراكز الفحص</button>
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

      <div className="paths-box">
        <div className="section-intro">
          <h2 className="section-title">اختاري خطوتكِ</h2>
          <span className="section-badge">خصوصية • دعم</span>
        </div>

        <div className="quick-grid">
          <QuickCard
            title="المساعد التوعوي"
            subtitle="أسئلة مباشرة حول التوعية والفحص المبكر"
            icon="💬"
            onClick={() => navigate('/app/assistant')}
          />
          <QuickCard
            title="مواعيد الفحوص"
            subtitle="تتبعي مواعيدكِ وتذكيراتكِ بسهولة"
            icon="🗓️"
            onClick={() => navigate('/app/screenings')}
          />
          <QuickCard
            title="المجتمع"
            subtitle="مساحة آمنة للقراءة والدعم الاجتماعي"
            icon="👥"
            onClick={() => navigate('/app/community')}
          />
          <QuickCard
            title="مراكز الفحص"
            subtitle="معلومات عن المدن والمراكز الموثوقة"
            icon="📍"
            onClick={() => navigate('/app/centers')}
          />
        </div>
      </div>

      <div className="trust-strip">
        <div className="trust-copy">
          <strong>تذكير توعوي</strong>
          <span>الوعي المبكر يبني طمأنينة أكبر.</span>
        </div>
        <div className="status-pill">
          <span className="status-dot connected" />
          متصل
        </div>
      </div>

      <div className="page-warning">
        <span className="icon-wrap">🛡️</span>
        <span>المحتوى توعوي عام لا يوضح التشخيص الطبي.</span>
      </div>
    </div>
  );
}
