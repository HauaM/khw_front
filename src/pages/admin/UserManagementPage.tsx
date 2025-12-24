// User Management Page (Main Content Only)
import React, { useMemo, useRef, useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { useToast } from '@/contexts/ToastContext';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useApiMutation } from '@/hooks/useApiMutation';
import { getDepartments } from '@/lib/api/departments';
import { deleteUser } from '@/lib/api/users';
import type { UserResponse, DepartmentResponse } from '@/types/users';
import type { TypeAheadOption } from '@/components/common/TypeAheadSelectBox';
import UserSearchPanel from '@/components/admin/UserSearchPanel';
import UserTable from '@/components/admin/UserTable';
import UserRegistrationModal from '@/components/admin/UserRegistrationModal';
import UserEditModal from '@/components/admin/UserEditModal';
import ConfirmDialog from '@/components/common/ConfirmDialog';

const UserManagementPage: React.FC = () => {
  const toast = useToast();

  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

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

  const departmentQuery = useApiQuery(['departments'], () => getDepartments({ is_active: true }) as any, {
    autoShowFeedback: false,
    autoShowError: true,
    queryOptions: {
      staleTime: 5 * 60 * 1000,
    },
  });

  const departments = useMemo(() => (departmentQuery.data as DepartmentResponse[]) || [], [departmentQuery.data]);

  const searchDepartmentOptions: TypeAheadOption[] = useMemo(() => {
    return [
      { code: '', label: '전체' },
      ...departments.map((dept: DepartmentResponse) => ({
        code: dept.department_code,
        label: dept.department_name,
      })),
    ];
  }, [departments]);

  const formDepartmentOptions: TypeAheadOption[] = useMemo(() => {
    return departments.map((dept: DepartmentResponse) => ({
      code: dept.id,
      label: `${dept.department_name} (${dept.department_code})`,
    }));
  }, [departments]);

  // Scroll & Highlight (Manual ID 기능 제거)
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const highlightedIdRef = useRef<string | null>(null);

  // 삭제 Mutation
  const deleteMutation = useApiMutation(deleteUser, {
    successMessage: '사용자가 삭제되었습니다.',
    autoShowFeedback: true,
    onApiSuccess: async () => {
      refetch();
    },
  });

  // 수정 버튼
  const handleEdit = (userId: number) => {
    const target = users.find((user: UserResponse) => user.id === userId) || null;
    if (!target) {
      toast.error('선택한 사용자를 찾을 수 없습니다.');
      return;
    }
    setEditingUser(target);
  };

  const handleEditClose = () => {
    setEditingUser(null);
  };

  // 삭제 버튼
  const handleDeleteClick = (userId: number) => {
    setDeletingUserId(userId);
  };

  const handleDeleteConfirm = () => {
    if (deletingUserId !== null) {
      deleteMutation.mutate(deletingUserId);
      setDeletingUserId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingUserId(null);
  };

  // 신규 등록 성공
  const handleRegistrationSuccess = () => {
    refetch();
  };

  // 수정 성공
  const handleEditSuccess = () => {
    refetch();
  };

  return (
    <div className="flex-1 overflow-auto">
      {/* Page Header */}
      <div className='mb-6 gap-2'>
        <h1 className="text-2xl font-bold text-gray-900">사용자 관리</h1>
        <p className="text-sm text-gray-600 mt-1">
          시스템에서 사용하는 사용자 그룹 및 사용자 정보를 관리합니다.
        </p>
      </div>
      <div className="">

        {/* Main Content */}
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
              />
            )}
          </div>
        </div>

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

        {/* 삭제 확인 다이얼로그 */}
        <ConfirmDialog
          isOpen={deletingUserId !== null}
          title="사용자 삭제"
          message="선택한 사용자를 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다."
          confirmText="삭제"
          cancelText="취소"
          variant="danger"
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      </div>
    </div>

  );
};

export default UserManagementPage;
