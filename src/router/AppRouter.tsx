import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import AppLayout from '../layouts/AppLayout';
import HomePage from '../pages/app/HomePage';
import AssistantPage from '../pages/app/AssistantPage';
import ScreeningsPage from '../pages/app/ScreeningsPage';
import CommunityPage from '../pages/app/CommunityPage';
import EventsPage from '../pages/app/EventsPage';
import NotFoundPage from '../pages/NotFoundPage';

// تحميل كسول للأجزاء الثقيلة (خرائط Google، لوحة الإدارة) حتى لا تُحمَّل إلا عند الحاجة إليها فعليًا
const CentersPage = lazy(() => import('../pages/app/CentersPage'));
const AdminLayout = lazy(() => import('../layouts/AdminLayout'));
const AdminEventsPage = lazy(() => import('../pages/admin/AdminEventsPage'));
const AdminCentersPage = lazy(() => import('../pages/admin/AdminCentersPage'));
const AdminCommunityPage = lazy(() => import('../pages/admin/AdminCommunityPage'));

function PageFallback() {
  return (
    <div className="state-block" style={{ minHeight: '50vh' }}>
      <div className="spinner" />
    </div>
  );
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/app" element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="assistant" element={<AssistantPage />} />
        <Route path="screenings" element={<ScreeningsPage />} />
        <Route
          path="centers"
          element={
            <Suspense fallback={<PageFallback />}>
              <CentersPage />
            </Suspense>
          }
        />
        <Route path="community" element={<CommunityPage />} />
        <Route path="events" element={<EventsPage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <Suspense fallback={<PageFallback />}>
            <AdminLayout />
          </Suspense>
        }
      >
        <Route index element={<Navigate to="/admin/events" replace />} />
        <Route path="events" element={<AdminEventsPage />} />
        <Route path="centers" element={<AdminCentersPage />} />
        <Route path="community" element={<AdminCommunityPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
