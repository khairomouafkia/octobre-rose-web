import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateEvent, useDeleteEvent, useEvents, useUpdateEvent } from '../../hooks/queries';
import type { EventItem } from '../../types';

interface FormState {
  title: string;
  description: string;
  location: string;
  eventDate: string;
}

const emptyForm: FormState = { title: '', description: '', location: '', eventDate: '' };

export default function AdminEventsPage() {
  const { t } = useTranslation();
  const { data: events, isLoading, isError: eventsError } = useEvents();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const operationError = createEvent.error ?? updateEvent.error ?? deleteEvent.error;

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (item: EventItem) => {
    setEditingId(String(item.id));
    setForm({
      title: item.title ?? '',
      description: item.description ?? '',
      location: item.location ?? '',
      eventDate: (item.event_date ?? item.eventDate ?? '').toString().slice(0, 16),
    });
    setShowForm(true);
  };

  const handleSave = () => {
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      eventDate: form.eventDate ? new Date(form.eventDate).toISOString() : new Date().toISOString(),
    };
    if (editingId) {
      updateEvent.mutate({ id: editingId, updates: payload }, { onSuccess: () => setShowForm(false) });
    } else {
      createEvent.mutate(payload, { onSuccess: () => setShowForm(false) });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('common.confirmDeleteBody'))) deleteEvent.mutate(id);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h2 className="text-h2">{t('admin.events')}</h2>
        <button className="btn btn-primary" onClick={openCreate}>
          + {t('common.add')}
        </button>
      </div>

      {eventsError && <p className="operation-error" role="alert">تعذر تحميل الفعاليات من الخادم.</p>}
      {operationError instanceof Error && !showForm && <p className="operation-error" role="alert">{operationError.message}</p>}

      {isLoading ? (
        <div className="state-block">
          <div className="spinner" />
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('admin.eventTitle')}</th>
                <th>{t('admin.eventDate')}</th>
                <th>{t('admin.eventLocation')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(events ?? []).map((item) => {
                const rawDate = item.event_date ?? item.eventDate;
                const date = rawDate ? new Date(rawDate) : null;
                return (
                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td>{date && !isNaN(date.getTime()) ? date.toLocaleString('ar') : '—'}</td>
                    <td>{item.location ?? '—'}</td>
                    <td>
                      <div className="row-actions">
                        <button className="icon-btn" onClick={() => openEdit(item)} aria-label="edit">
                          ✏️
                        </button>
                        <button
                          className="icon-btn"
                          onClick={() => handleDelete(String(item.id))}
                          aria-label="delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {(events ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--ink-faint)' }}>
                    {t('events.emptyTitle')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-h3">{editingId ? t('common.edit') : t('common.add')}</h3>
            {operationError instanceof Error && <p className="operation-error" role="alert">{operationError.message}</p>}
            <div className="field">
              <label>{t('admin.eventTitle')}</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="field">
              <label>{t('admin.eventDate')}</label>
              <input
                type="datetime-local"
                value={form.eventDate}
                onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
              />
            </div>
            <div className="field">
              <label>{t('admin.eventLocation')}</label>
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="field">
              <label>{t('admin.eventDescription')}</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowForm(false)}>
                {t('common.cancel')}
              </button>
              <button
                className="btn btn-primary"
                type="button"
                onClick={handleSave}
                disabled={createEvent.isPending || updateEvent.isPending}
              >
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
