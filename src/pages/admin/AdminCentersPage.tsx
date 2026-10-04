import React, { useState } from 'react';
import { CircleMarker, MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import 'leaflet/dist/leaflet.css';
import { useCenters, useCreateCenter, useDeleteCenter, useUpdateCenter } from '../../hooks/queries';
import type { ScreeningCenter } from '../../types';

interface FormState {
  name: string;
  address: string;
  phone: string;
  city: string;
  latitude: string;
  longitude: string;
  locationUrl: string;
}

const emptyForm: FormState = { name: '', address: '', phone: '', city: '', latitude: '', longitude: '', locationUrl: '' };
const defaultMapCenter: [number, number] = [28.0339, 1.6596];

function MapClickHandler({ onSelect }: { onSelect: (latitude: number, longitude: number) => void }) {
  useMapEvents({
    click: (event) => onSelect(event.latlng.lat, event.latlng.lng),
  });
  return null;
}

export default function AdminCentersPage() {
  const { t } = useTranslation();
  const { data: centers, isLoading, isError: centersError } = useCenters();
  const createCenter = useCreateCenter();
  const updateCenter = useUpdateCenter();
  const deleteCenter = useDeleteCenter();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState('');
  const operationError = createCenter.error ?? updateCenter.error ?? deleteCenter.error;

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (item: ScreeningCenter) => {
    setEditingId(String(item.id));
    setForm({
      name: item.name ?? '',
      address: item.address ?? '',
      phone: item.phone ?? '',
      city: item.city ?? '',
      latitude: String(item.latitude ?? ''),
      longitude: String(item.longitude ?? ''),
      locationUrl: item.locationUrl ?? '',
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSave = () => {
    const name = form.name.trim();
    const address = form.address.trim();
    if (!name || !address) {
      setFormError('يرجى إدخال اسم المركز والعنوان.');
      return;
    }
    const locationUrl = form.locationUrl.trim();
    if (locationUrl && !/^https?:\/\//i.test(locationUrl)) {
      setFormError('يجب أن يبدأ رابط الموقع بـ https:// أو http://.');
      return;
    }

    const payload = {
      name,
      address,
      phone: form.phone.trim(),
      city: form.city.trim(),
      latitude: form.latitude && form.longitude ? Number(form.latitude) : undefined,
      longitude: form.latitude && form.longitude ? Number(form.longitude) : undefined,
      locationUrl: locationUrl || undefined,
    };
    if (editingId) {
      updateCenter.mutate({ id: editingId, updates: payload }, { onSuccess: () => setShowForm(false) });
    } else {
      createCenter.mutate(payload, { onSuccess: () => setShowForm(false) });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('common.confirmDeleteBody'))) deleteCenter.mutate(id);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h2 className="text-h2">{t('admin.centers')}</h2>
        <button className="btn btn-primary" onClick={openCreate}>
          + {t('common.add')}
        </button>
      </div>

      {centersError && <p className="operation-error" role="alert">تعذر تحميل مراكز الفحص من الخادم.</p>}
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
                <th>{t('admin.centerName')}</th>
                <th>{t('admin.centerAddress')}</th>
                <th>{t('admin.centerPhone')}</th>
                <th>الموقع</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(centers ?? []).map((item) => {
                const hasCoordinates = item.latitude !== undefined && item.latitude !== null
                  && item.longitude !== undefined && item.longitude !== null
                  && Number.isFinite(Number(item.latitude)) && Number.isFinite(Number(item.longitude));
                const mapQuery = hasCoordinates
                  ? `${item.latitude},${item.longitude}`
                  : [item.address, item.city].filter(Boolean).join(', ');
                const mapUrl = item.locationUrl || (mapQuery
                  ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`
                  : null);

                return (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.address}</td>
                    <td>{item.phone ?? '—'}</td>
                    <td>
                      {mapUrl ? (
                        <a
                          className="center-location-link"
                          href={mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`فتح موقع ${item.name} في خرائط Google`}
                        >
                          <span aria-hidden="true">📍</span>
                          <span>فتح في Google Maps</span>
                        </a>
                      ) : '—'}
                    </td>
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
              {(centers ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--ink-faint)' }}>
                    —
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
            <p>أدخلي بيانات المركز. تحديد موقعه على الخريطة اختياري.</p>
            {formError && <p className="operation-error" role="alert">{formError}</p>}
            {operationError instanceof Error && <p className="operation-error" role="alert">{operationError.message}</p>}
            <div className="field">
              <label>{t('admin.centerName')}</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="field">
              <label>{t('admin.centerAddress')}</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="field">
              <label>{t('admin.centerPhone')}</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="field">
              <label>{t('admin.centerCity')}</label>
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div className="field">
              <label>رابط موقع المركز (اختياري)</label>
              <input
                type="url"
                inputMode="url"
                placeholder="https://maps.google.com/..."
                value={form.locationUrl}
                onChange={(e) => setForm({ ...form, locationUrl: e.target.value })}
              />
            </div>
            <div className="field">
              <label>موقع المركز (اختياري)</label>
              <div className="center-map-picker" aria-label="اختيار موقع المركز على الخريطة">
                <MapContainer
                  center={form.latitude && form.longitude
                    ? [Number(form.latitude), Number(form.longitude)]
                    : defaultMapCenter}
                  zoom={form.latitude && form.longitude ? 13 : 5}
                  scrollWheelZoom
                  style={{ width: '100%', height: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapClickHandler onSelect={(latitude, longitude) => {
                    setForm((current) => ({
                      ...current,
                      latitude: latitude.toFixed(6),
                      longitude: longitude.toFixed(6),
                    }));
                    setFormError('');
                  }} />
                  {form.latitude && form.longitude && (
                    <CircleMarker
                      center={[Number(form.latitude), Number(form.longitude)]}
                      radius={9}
                      pathOptions={{ color: '#fff', weight: 3, fillColor: '#d96c8a', fillOpacity: 1 }}
                    />
                  )}
                </MapContainer>
              </div>
              <div className="center-map-coordinate">
                {form.latitude && form.longitude
                  ? `الإحداثيات: ${form.latitude}، ${form.longitude}`
                  : 'يمكنك النقر على الخريطة لإضافة موقع، أو تركه فارغًا.'}
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" type="button" onClick={() => setShowForm(false)}>
                {t('common.cancel')}
              </button>
              <button
                className="btn btn-primary"
                type="button"
                onClick={handleSave}
                disabled={createCenter.isPending || updateCenter.isPending}
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
