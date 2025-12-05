import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '@/layouts/AppLayout';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import ConsultationCreatePage from '@/pages/consultations/ConsultationCreatePage';
import ConsultationSearchPage from '@/pages/consultations/ConsultationSearchPage';
import ConsultationDetailPage from '@/pages/consultations/ConsultationDetailPage';
import ManualSearchPage from '@/pages/manuals/ManualSearchPage';
import ManualHistoryPage from '@/pages/manuals/ManualHistoryPage';
import ReviewTaskListPage from '@/pages/reviews/ReviewTaskListPage';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage';

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="consultations">
            <Route path="new" element={<ConsultationCreatePage />} />
            <Route path="search" element={<ConsultationSearchPage />} />
            <Route path=":id" element={<ConsultationDetailPage />} />
          </Route>
          <Route path="manuals">
            <Route path="search" element={<ManualSearchPage />} />
            <Route path="history" element={<ManualHistoryPage />} />
          </Route>
          <Route path="reviews">
            <Route path="tasks" element={<ReviewTaskListPage />} />
          </Route>
          <Route path="admin">
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
