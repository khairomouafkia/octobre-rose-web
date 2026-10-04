import React, { useState } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useCenters } from '../../hooks/queries';
import type { ScreeningCenter } from '../../types';

const defaultMapCenter: [number, number] = [28.0339, 1.6596];

function getCoordinates(center: ScreeningCenter): [number, number] | null {
  if (center.latitude === undefined || center.latitude === null || center.latitude === ''
    || center.longitude === undefined || center.longitude === null || center.longitude === '') {
    return null;
  }

  const latitude = Number(center.latitude);
  const longitude = Number(center.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return [latitude, longitude];
}

function getGoogleMapsUrl(center: ScreeningCenter): string | null {
  const coordinates = getCoordinates(center);
  const destination = coordinates
    ? `${coordinates[0]},${coordinates[1]}`
    : [center.address, center.city].filter(Boolean).join(', ');
  if (!destination) return null;

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

export default function CentersPage() {
  const { data: centers, isLoading, isError } = useCenters();
  const [search, setSearch] = useState('');
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const filteredCenters = (centers ?? []).filter((center) =>
    [center.name, center.address, center.city, center.phone]
      .some((value) => value?.toLocaleLowerCase().includes(normalizedSearch)),
  );
  const centersWithCoordinates = filteredCenters.flatMap((center) => {
    const coordinates = getCoordinates(center);
    return coordinates ? [{ center, coordinates }] : [];
  });
  const mapCenter = centersWithCoordinates[0]?.coordinates ?? defaultMapCenter;

  return (
    <div>
      <div className="section-head">
        <span className="section-eyebrow">مراكز الفحص</span>
        <h1 className="page-title">مراكز الفحص</h1>
        <p className="page-subtitle">ابحثي عن مركز قريب وافتحي موقعه مباشرةً في تطبيق الخرائط.</p>
      </div>

      <div className="page-card search-card">
        <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>ابحثي باسم المدينة أو المركز</h3>
        <div className="search-field">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="اسم المركز، المدينة، أو العنوان"
            aria-label="البحث عن مركز فحص"
          />
          {search && <button className="ghost-btn" type="button" onClick={() => setSearch('')}>مسح</button>}
        </div>
      </div>

      {isLoading ? (
        <div className="state-block"><div className="spinner" /></div>
      ) : isError ? (
        <p className="operation-error" role="alert">تعذر تحميل مراكز الفحص. تحققي من اتصال الخادم ثم أعيدي المحاولة.</p>
      ) : (
        <>
          {centersWithCoordinates.length > 0 && (
            <section className="centers-map-section" aria-label="خريطة مراكز الفحص">
              <MapContainer
                key={`${mapCenter[0]}-${mapCenter[1]}`}
                center={mapCenter}
                zoom={centersWithCoordinates.length === 1 ? 12 : 5}
                scrollWheelZoom
                className="centers-map"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {centersWithCoordinates.map(({ center, coordinates }) => (
                  <CircleMarker
                    key={center.id}
                    center={coordinates}
                    radius={9}
                    pathOptions={{ color: '#fff', weight: 3, fillColor: '#d96c8a', fillOpacity: 1 }}
                  >
                    <Popup>
                      <strong>{center.name}</strong>
                      <br />
                      {center.address}
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
              <p className="centers-map-caption">الخريطة من OpenStreetMap. افتحي أي مركز في Google Maps لبدء الاتجاهات.</p>
            </section>
          )}

          <section className="center-results" aria-labelledby="center-results-title">
            <div className="center-results-heading">
              <h2 id="center-results-title" className="section-title">مراكز الفحص</h2>
              <span className="section-badge">{filteredCenters.length} مركز</span>
            </div>
            {filteredCenters.length === 0 ? (
              <div className="empty-card">
                <span className="empty-card-icon">📍</span>
                <h3>{centers?.length ? 'لا توجد نتائج مطابقة' : 'لا توجد مراكز مضافة بعد'}</h3>
                <p>{centers?.length ? 'جرّبي اسم مركز أو مدينة أخرى.' : 'ستظهر هنا المراكز بعد إضافتها.'}</p>
              </div>
            ) : (
              <div className="center-list">
                {filteredCenters.map((center) => {
                  const mapsUrl = getGoogleMapsUrl(center);
                  return (
                    <article className="center-list-item" key={center.id}>
                      <div className="center-list-copy">
                        <h3>{center.name}</h3>
                        <p>{center.address}{center.city ? `، ${center.city}` : ''}</p>
                        {center.phone && <a className="center-phone-link" href={`tel:${center.phone}`}>{center.phone}</a>}
                      </div>
                      {mapsUrl ? (
                        <a className="primary-btn center-directions-btn" href={mapsUrl} target="_blank" rel="noopener noreferrer">
                          <span aria-hidden="true">📍</span>
                          <span>الاتجاهات</span>
                        </a>
                      ) : (
                        <span className="center-location-missing">الموقع غير محدد</span>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
