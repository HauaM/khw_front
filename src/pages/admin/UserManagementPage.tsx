// User Management Page (Main Content Only)
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUsers } from '@/hooks/useUsers';
import { useScrollToRow } from '@/hooks/useScrollToRow';
import { useToast } from '@/contexts/ToastContext';
import { useApiQuery } from '@/hooks/useApiQuery';
import { getDepartments } from '@/lib/api/departments';
import type { UserResponse } from '@/types/users';
import type { TypeAheadOption } from '@/components/common/TypeAheadSelectBox';
import UserSearchPanel from '@/components/admin/UserSearchPanel';
import UserTable from '@/components/admin/UserTable';
import UserRegistrationModal from '@/components/admin/UserRegistrationModal';
import UserEditModal from '@/components/admin/UserEditModal';

const UserManagementPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const toast = useToast();

  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [manualIdInput, setManualIdInput] = useState('');

  // Hooks
  const {
    users,
    total,
    isLoading,
    searchParams: currentParams,
    handleSearch,
    handleReset,
    refetch,
  } = useUsers();

  const departmentQuery = useApiQuery(['departments'], () => getDepartments({ is_active: true }), {
    autoShowFeedback: false,
    autoShowError: true,
    queryOptions: {
      staleTime: 5 * 60 * 1000,
    },
  });

  const departments = departmentQuery.data || [];

  const searchDepartmentOptions: TypeAheadOption[] = useMemo(() => {
    return [
      { code: '', label: '전체' },
      ...departments.map((dept) => ({
        code: dept.department_code,
        label: dept.department_name,
      })),
    ];
  }, [departments]);

  const formDepartmentOptions: TypeAheadOption[] = useMemo(() => {
    return departments.map((dept) => ({
      code: dept.id,
      label: `${dept.department_name} (${dept.department_code})`,
    }));
  }, [departments]);

  // Scroll & Highlight
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const didAutoScrollRef = useRef(false);

  const { scrollToRow, highlightedIdRef } = useScrollToRow({
    highlightDuration: 3000,
    onToast: (message, type) => {
      if (type === 'error') toast.error(message);
      else if (type === 'info') toast.info(message);
      else toast.success(message);
    },
  });

  // Manual ID 기반 스크롤 함수
  const handleScrollToManualId = (manualId: string) => {
    // TODO: manualId → employee_id 매핑 로직
    // 현재는 manualId === employee_id로 처리
    const availableIds = users.map((u) => u.employee_id);
    scrollToRow(manualId, rowRefs, availableIds);
  };

  // 자동 스크롤 트리거 (페이지 진입 시 query 파라미터 확인)
  useEffect(() => {
    const manualIdTarget = searchParams.get('manual_id');

    if (manualIdTarget && users.length > 0 && !didAutoScrollRef.current) {
      handleScrollToManualId(manualIdTarget);
      didAutoScrollRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, searchParams]);

  // 수정 버튼
  const handleEdit = (userId: number) => {
    const target = users.find((user) => user.id === userId) || null;
    if (!target) {
      toast.error('선택한 사용자를 찾을 수 없습니다.');
      return;
    }
    setEditingUser(target);
  };

  const handleEditClose = () => {
    setEditingUser(null);
  };

  // 삭제 버튼 (API 미지원)
  const handleDeleteClick = () => {
    toast.info('삭제 API가 제공되지 않아 현재 비활성화되어 있습니다.');
  };

  // 신규 등록 성공
  const handleRegistrationSuccess = () => {
    refetch();
  };

  // 수정 성공
  const handleEditSuccess = () => {
    refetch();
  };

  // Manual ID 수동 입력 + 이동
  const handleManualIdGo = () => {
    if (!manualIdInput.trim()) {
      toast.error('Manual ID를 입력해주세요.');
      return;
    }
    handleScrollToManualId(manualIdInput.trim());
  };

  const handleManualIdKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleManualIdGo();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between bg-white border-b border-gray-200 px-6 h-14">
        <h1 className="text-xl font-bold text-gray-900">사용자 관리</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">광주은행 관리시스템</span>
        </div>
      </header>

      {/* Manual ID 이동 패널 */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-700">Manual ID 이동:</label>
          <input
            type="text"
            value={manualIdInput}
            onChange={(e) => setManualIdInput(e.target.value)}
            onKeyPress={handleManualIdKeyPress}
            placeholder="예) E001"
            className="h-9 w-48 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
          <button
            onClick={handleManualIdGo}
            className="px-4 py-2 text-sm font-semibold bg-primary-500 text-white rounded-md hover:bg-primary-600 transition"
          >
            이동
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto px-6 py-6">
        <div className="space-y-6">
          {/* 검색 패널 */}
          <UserSearchPanel
            searchParams={currentParams}
            onSearch={handleSearch}
            onReset={handleReset}
            departmentOptions={searchDepartmentOptions}
            isDepartmentLoading={departmentQuery.isLoading}
          />

          {/* 조회 결과 패널 */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="space-y-1">
                <h2 className="text-base font-semibold text-gray-900">
                  조회 결과 <span className="text-primary-500">({total}건)</span>
                </h2>
                <p className="text-xs text-gray-500">
                  삭제 API 미지원으로 삭제 기능은 비활성화됩니다.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 text-sm font-semibold bg-primary-500 text-white rounded-md hover:bg-primary-600 transition"
              >
                + 신규 등록
              </button>
            </div>

            {/* 로딩 상태 */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-sm text-gray-600">로딩 중...</div>
              </div>
            ) : (
              <UserTable
                users={users}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                rowRefs={rowRefs}
                highlightedId={highlightedIdRef.current}
                deleteDisabled
              />
            )}
          </div>
        </div>
      </main>

      {/* 사용자 등록 모달 */}
      <UserRegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleRegistrationSuccess}
        departmentOptions={formDepartmentOptions}
        isDepartmentLoading={departmentQuery.isLoading}
      />

      {/* 사용자 수정 모달 */}
      <UserEditModal
        isOpen={editingUser !== null}
        user={editingUser}
        onClose={handleEditClose}
        onSuccess={handleEditSuccess}
        departmentOptions={formDepartmentOptions}
        isDepartmentLoading={departmentQuery.isLoading}
      />
    </div>
  );
};

export default UserManagementPage;
