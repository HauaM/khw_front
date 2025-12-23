import React, { useState } from 'react';
import DepartmentSearchForm from '@/components/departments/DepartmentSearchForm';
import DepartmentTable from '@/components/departments/DepartmentTable';
import DepartmentModal from '@/components/departments/DepartmentModal';
import {
  useDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from '@/hooks/useDepartments';
import type { DepartmentResponse } from '@/types/users';

const DepartmentManagementPage: React.FC = () => {
  const [searchParams, setSearchParams] = useState<{
    department_name?: string;
    department_code?: string;
    is_active?: boolean;
  }>({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentResponse | null>(null);

  // React Query 훅들
  const { data: departmentsData, isLoading } = useDepartments(searchParams);
  const departments = (departmentsData as DepartmentResponse[]) || [];
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const deleteMutation = useDeleteDepartment();

  const handleSearch = (params: {
    department_name?: string;
    department_code?: string;
    is_active?: boolean;
  }) => {
    setSearchParams(params);
  };

  const handleReset = () => {
    setSearchParams({});
  };

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setSelectedDepartment(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (department: DepartmentResponse) => {
    setModalMode('edit');
    setSelectedDepartment(department);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDepartment(null);
  };

  const handleSubmit = (data: { department_code: string; department_name: string; is_active: boolean }) => {
    if (modalMode === 'create') {
      createMutation.mutate(data, {
        onSuccess: () => {
          handleCloseModal();
        },
      });
    } else if (modalMode === 'edit' && selectedDepartment) {
      updateMutation.mutate(
        { id: selectedDepartment.id, data },
        {
          onSuccess: () => {
            handleCloseModal();
          },
        }
      );
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      {/* 검색 패널 */}
      <DepartmentSearchForm onSearch={handleSearch} onReset={handleReset} />

      {/* 목록 패널 */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900">부서 목록</h3>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition bg-primary-500 text-white hover:bg-primary-600"
          >
            신규등록
          </button>
        </div>

        <DepartmentTable
          departments={departments}
          isLoading={isLoading}
          onEdit={handleOpenEditModal}
          onDelete={handleDelete}
        />

        <div className="mt-3 text-xs text-gray-600">
          총 <span className="font-semibold text-primary-600">{departments.length}</span>건
        </div>
      </div>

      {/* 등록/수정 모달 */}
      <DepartmentModal
        isOpen={isModalOpen}
        mode={modalMode}
        department={selectedDepartment}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};

export default DepartmentManagementPage;
