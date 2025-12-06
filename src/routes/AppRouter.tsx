import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '@/layouts/AppLayout';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import ConsultationCreatePage from '@/pages/consultations/ConsultationCreatePage';
import ConsultationSearchPage from '@/pages/consultations/ConsultationSearchPage';
import ConsultationDetailPage from '@/pages/consultations/ConsultationDetailPage';
import ManualSearchPage from '@/pages/manuals/ManualSearchPage';
import ManualHistoryPage from '@/pages/manuals/ManualHistoryPage';
import ManualDraftResultPage from '@/pages/manuals/ManualDraftResultPage';
import ReviewTaskListPage from '@/pages/reviews/ReviewTaskListPage';
import ManualReviewDetailPage from '@/pages/reviews/ManualReviewDetailPage';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage';
import AuthLayout from '@/components/common/AuthLayout';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* TODO: 보호가 필요한 경로는 추후 ProtectedRoute로 감싸기 */}
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
            <Route path="draft/:id" element={<ManualDraftResultPage />} />
            {/* TODO: 메뉴얼 검토 대기 목록 페이지 추가 예정 */}
            {/* <Route path="drafts" element={<ManualDraftListPage />} /> */}
          </Route>
          <Route path="reviews">
            <Route path="tasks" element={<ReviewTaskListPage />} />
            <Route path="tasks/:taskId" element={<ManualReviewDetailPage />} />
          </Route>
          <Route path="admin">
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
