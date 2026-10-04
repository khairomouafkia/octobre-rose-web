import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEnsureLoggedIn } from '../../utils/authGuard';
import { useCancelEventRegistration, useEvents, useMyEventRegistrations, useRegisterForEvent } from '../../hooks/queries';
import { formatArabicLongDate } from '../../utils/formatDate';
import { AuthService } from '../../service/authService';

export default function EventsPage() {
  const { t } = useTranslation();
  const ensureLoggedIn = useEnsureLoggedIn();
  const { data: events, isLoading, isError } = useEvents();
  const [userId, setUserId] = useState(() => AuthService.currentUser?.uid ?? '');
  const registrations = useMyEventRegistrations(userId);
  const registerMutation = useRegisterForEvent();
  const cancelMutation = useCancelEventRegistration();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => AuthService.onAuthStateChanged((user) => setUserId(user?.uid ?? '')), []);

  const handleRegister = async (eventId: string) => {
    if (!(await ensureLoggedIn(t('events.registerReason')))) return;
    setUserId(AuthService.currentUser?.uid ?? '');
    registerMutation.mutate(eventId, {
      onSuccess: (success) => {
        window.alert(success ? t('events.registerSuccess') : t('events.registerError'));
      },
      onError: () => window.alert(t('events.registerError')),
    });
  };

  const handleCancelRegistration = async (eventId: string) => {
    if (!(await ensureLoggedIn(t('events.registerReason')))) return;
    if (!window.confirm('هل تريدين إلغاء تسجيلك في هذه الفعالية؟')) return;
    cancelMutation.mutate(eventId, {
      onSuccess: () => window.alert('تم إلغاء تسجيلك في الفعالية.'),
      onError: (error) => window.alert(error instanceof Error ? error.message : 'تعذر إلغاء التسجيل.'),
    });
  };

  const toggleDetails = (eventId: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(eventId)) next.delete(eventId);
      else next.add(eventId);
      return next;
    });
  };

  return (
    <div>
      <div className="section-head">
        <span className="section-eyebrow">فعاليات المجتمع</span>
        <h1 className="page-title">قريباً في مجتمعكِ</h1>
        <p className="page-subtitle">تعرّفي على الفعاليات القادمة وسجّلي للحضور من هذه الصفحة.</p>
      </div>

      <div className="toolbar-row"><span className="section-badge">جميع الفعاليات</span></div>

      {isLoading ? (
        <div className="state-block"><div className="spinner" /></div>
      ) : isError ? (
        <p className="operation-error" role="alert">تعذر تحميل الفعاليات. تحققي من اتصال الخادم ثم أعيدي المحاولة.</p>
      ) : (events ?? []).length === 0 ? (
        <div className="empty-card">
          <span className="empty-card-icon">📅</span>
          <h3>لا توجد فعاليات متاحة الآن</h3>
          <p>ستظهر الفعاليات الجديدة هنا عند توفرها في منطقتكِ.</p>
          <span className="empty-tag">قريباً</span>
        </div>
      ) : (
        <div className="stack-grid">
          {(events ?? []).map((event) => {
            const rawDate = event.event_date ?? event.eventDate;
            const date = rawDate ? new Date(rawDate) : null;
            const eventId = String(event.id);
            const isRegistered = (registrations.data ?? []).includes(eventId);
            const isExpanded = expandedIds.has(eventId);
            const location = event.location?.trim();
            const mapUrl = location
              ? /^https?:\/\//i.test(location)
                ? location
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
              : null;
            const mutationPending = registerMutation.isPending || cancelMutation.isPending;
            return (
              <article className="event-card" key={eventId}>
                <h2 className="event-card-title">{event.title}</h2>
                {date && !Number.isNaN(date.getTime()) && <p className="meta-row">{formatArabicLongDate(date)}</p>}
                {location && (
                  <p className="meta-row">
                    📍 <a className="event-location-link" href={mapUrl ?? undefined} target="_blank" rel="noopener noreferrer">{location}</a>
                  </p>
                )}
                {event.description && (
                  <>
                    <p className={`event-description${isExpanded ? ' is-expanded' : ''}`}>{event.description}</p>
                    <button className="event-details-toggle" type="button" onClick={() => toggleDetails(eventId)} aria-expanded={isExpanded}>
                      {isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                    </button>
                  </>
                )}
                <div className="event-actions">
                  {isRegistered ? (
                    <button className="ghost-btn" type="button" onClick={() => handleCancelRegistration(eventId)} disabled={mutationPending}>
                      {cancelMutation.isPending ? 'جارٍ إلغاء التسجيل...' : 'مسجلة، إلغاء التسجيل'}
                    </button>
                  ) : (
                    <button
                      className="primary-btn"
                      type="button"
                      onClick={() => handleRegister(eventId)}
                      disabled={mutationPending || (userId.length > 0 && registrations.isLoading)}
                    >
                      {registerMutation.isPending ? 'جارٍ التسجيل...' : userId.length > 0 && registrations.isLoading ? 'جارٍ التحقق...' : 'سجّلي للحضور'}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {registerMutation.error instanceof Error && <p className="operation-error" role="alert">{registerMutation.error.message}</p>}

      <div className="page-card" style={{ marginTop: 20 }}>
        <div className="page-warning" style={{ marginTop: 0 }}>
          <span className="icon-wrap">👤</span>
          <span>التسجيل يحتاج إلى تسجيل الدخول أو حساب مفعّل.</span>
        </div>
      </div>

      <div className="callout-bar" style={{ marginTop: 20 }}>
        يمكنك متابعة الفعاليات المحلية عند ظهورها في هذه الصفحة.
      </div>
    </div>
  );
}
