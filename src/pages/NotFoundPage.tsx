import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="not-found-card">
      <div className="not-found-icon">🔎</div>
      <div className="section-eyebrow">الرابط غير موجود</div>
      <h1>هذه الصفحة ليست هنا</h1>
      <p>قد يكون الرابط قد تغيّر أو أن الصفحة غير متاحة حاليًا. يمكنك العودة إلى الصفحة الرئيسية ومتابعة استكشاف خدمات طمانينة.</p>
      <Link to="/" className="primary-btn">
        العودة للرئيسية
      </Link>
    </div>
  );
}
