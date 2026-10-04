import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthService } from '../../service/authService';
import { useAddScreening, useDeleteScreening, useScreenings, useUpdateScreening } from '../../hooks/queries';
import { useEnsureLoggedIn } from '../../utils/authGuard';
import type { Screening } from '../../types';
import { formatDateTime } from '../../utils/formatDate';

type ScreeningType = 'screening' | 'mammogram' | 'ultrasound' | 'clinical_exam' | 'mri';

function toLocalInputValue(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export default function ScreeningsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const ensureLoggedIn = useEnsureLoggedIn();
  const [ready, setReady] = useState(AuthService.isLoggedIn);
  const userId = AuthService.currentUser?.uid ?? '';
  const { data: screenings, isLoading, isError } = useScreenings(userId);
  const addScreening = useAddScreening(userId);
  const updateScreening = useUpdateScreening(userId);
  const deleteScreening = useDeleteScreening(userId);

  const [showDialog, setShowDialog] = useState(false);
  const [editingScreening, setEditingScreening] = useState<Screening | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [type, setType] = useState<ScreeningType>('screening');
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  });
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (AuthService.isLoggedIn) {
      setReady(true);
      return;
    }
    ensureLoggedIn('سجّلي الدخول لعرض مواعيد الفحص الخاصة بكِ.').then((loggedIn) => {
      if (loggedIn) setReady(true);
      else navigate('/app', { replace: true });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openNewDialog = () => {
    setEditingScreening(null);
    setType('screening');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow);
    setNotes('');
    setShowDialog(true);
  };

  const openEditDialog = (screening: Screening) => {
    setEditingScreening(screening);
    setType(screening.screening_type ?? screening.screeningType ?? 'screening');
    const rawDate = screening.scheduled_date ?? screening.scheduledDate;
    const parsedDate = rawDate ? new Date(rawDate) : new Date();
    setSelectedDate(Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate);
    setNotes(screening.notes ?? '');
    setShowDialog(true);
  };

  const handleSave = () => {
    const params = { screeningType: type, scheduledDate: selectedDate.toISOString(), notes };
    const onSuccess = (success: boolean) => {
      setShowDialog(false);
      setEditingScreening(null);
      window.alert(success ? t('screenings.savedSuccess') : t('screenings.savedError'));
    };

    if (editingScreening) {
      updateScreening.mutate({ id: editingScreening.id, updates: params }, { onSuccess });
      return;
    }
    addScreening.mutate(params, { onSuccess });
  };

  const handleDelete = (screening: Screening) => {
    if (!window.confirm('هل تريدين حذف هذا الموعد؟')) return;
    deleteScreening.mutate(screening.id, {
      onSuccess: () => window.alert('تم حذف الموعد.'),
      onError: (error) => window.alert(error instanceof Error ? error.message : 'تعذر حذف الموعد.'),
    });
  };

  const upcoming = activeTab === 'upcoming';
  const visibleScreenings = (screenings ?? []).filter((screening) => {
    const completed = screening.is_completed ?? screening.isCompleted ?? false;
    return completed === !upcoming;
  });

  if (!ready) return null;

  return (
    <div>
      <div className="section-head">
        <span className="section-eyebrow">مواعيدكِ</span>
        <h1 className="page-title">مواعيد فحوصكِ</h1>
        <p className="page-subtitle">تتبعي مواعيدكِ القادمة أو المكتملة في مساحة منظمة وواضحة.</p>
      </div>

      <div className="toolbar-row">
        <div className="segmented">
          <button type="button" className={upcoming ? 'active' : ''} onClick={() => setActiveTab('upcoming')}>
            القادمة
          </button>
          <button type="button" className={!upcoming ? 'active' : ''} onClick={() => setActiveTab('completed')}>
            المكتملة
          </button>
        </div>

        <button className="primary-btn" type="button" onClick={openNewDialog}>
          + إضافة تذكير
        </button>
      </div>

      {isLoading ? (
        <div className="state-block"><div className="spinner" /></div>
      ) : isError ? (
        <p className="operation-error" role="alert">تعذر تحميل مواعيد الفحص. تحققي من اتصال الخادم ثم أعيدي المحاولة.</p>
      ) : visibleScreenings.length === 0 ? (
        <div className="empty-card">
          <span className="empty-card-icon">📅</span>
          <h3>{upcoming ? 'لا توجد مواعيد قادمة' : 'لا توجد مواعيد مكتملة'}</h3>
          <p>{upcoming ? 'ستظهر المواعيد القادمة هنا عند إضافتها.' : 'ستظهر الفحوص المكتملة هنا بعد إكمالها.'}</p>
          <span className="empty-tag">{upcoming ? 'قادمة' : 'مكتملة'}</span>
        </div>
      ) : (
        <div className="stack-grid">
          {visibleScreenings.map((screening) => {
            const rawDate = screening.scheduled_date ?? screening.scheduledDate;
            const date = rawDate ? new Date(rawDate) : null;
            const screeningType = screening.screening_type ?? screening.screeningType;
            return (
              <article className="page-card" key={screening.id}>
                <h2 className="event-card-title">{screeningType === 'mammogram' ? 'تصوير الثدي بالأشعة' : 'فحص ذاتي'}</h2>
                <p className="meta-row">{date && !Number.isNaN(date.getTime()) ? formatDateTime(date) : 'موعد غير محدد'}</p>
                {screening.notes && <p className="event-description">{screening.notes}</p>}
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button className="ghost-btn" type="button" onClick={() => openEditDialog(screening)}>تعديل</button>
                  <button className="ghost-btn" type="button" onClick={() => handleDelete(screening)} disabled={deleteScreening.isPending}>حذف</button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="callout-bar" style={{ marginTop: 20 }}>
        تذكير: يمكن إضافة مواعيدكِ في أي وقت من خلال زر «إضافة تذكير».
      </div>

      {showDialog && (
        <div className="modal-overlay" onClick={() => setShowDialog(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <h3>{editingScreening ? 'تعديل الموعد' : 'إضافة تذكير'}</h3>
            <p>{editingScreening ? 'حدّثي تفاصيل موعدكِ.' : 'سيُحفظ الموعد في حسابكِ لتتمكني من متابعته لاحقًا.'}</p>
            <div className="field">
              <label htmlFor="screening-type">نوع الفحص</label>
              <select id="screening-type" value={type} onChange={(event) => setType(event.target.value as ScreeningType)}>
                <option value="screening">فحص ذاتي</option>
                <option value="mammogram">تصوير الثدي بالأشعة</option>
                <option value="ultrasound">موجات فوق الصوتية</option>
                <option value="clinical_exam">فحص سريري</option>
                <option value="mri">MRI</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="screening-date">التاريخ والوقت</label>
              <input
                id="screening-date"
                type="datetime-local"
                value={toLocalInputValue(selectedDate)}
                onChange={(event) => setSelectedDate(new Date(event.target.value))}
              />
            </div>
            <div className="field">
              <label htmlFor="screening-notes">ملاحظات</label>
              <textarea id="screening-notes" rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} />
            </div>
            <div className="modal-actions">
              <button className="ghost-btn" type="button" onClick={() => { setShowDialog(false); setEditingScreening(null); }}>إغلاق</button>
              {(addScreening.error ?? updateScreening.error) instanceof Error && <p className="operation-error" role="alert">{(addScreening.error ?? updateScreening.error)?.message}</p>}
              <button
                className="primary-btn"
                type="button"
                onClick={handleSave}
                disabled={addScreening.isPending || updateScreening.isPending}
              >
                {addScreening.isPending || updateScreening.isPending ? 'جارٍ الحفظ...' : editingScreening ? 'حفظ التعديلات' : 'حفظ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
