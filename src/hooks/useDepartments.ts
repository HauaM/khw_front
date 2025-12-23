/**
 * 부서 관리 커스텀 훅
 */

import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery } from './useApiQuery';
import { useApiMutation } from './useApiMutation';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '@/lib/api/departments';
import type { DepartmentResponse } from '@/types/users';

/**
 * 부서 목록 조회 훅
 */
export const useDepartments = (params?: {
  is_active?: boolean;
  department_code?: string;
  department_name?: string;
}) => {
  return useApiQuery<DepartmentResponse[]>(
    ['departments', params],
    () => getDepartments(params) as any,
    {
      autoShowError: true,
      autoShowFeedback: false,
    }
  );
};

/**
 * 부서 생성 훅
 */
export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  return useApiMutation(
    (data: { department_code: string; department_name: string; is_active?: boolean }) =>
      createDepartment(data) as any,
    {
      successMessage: '부서가 성공적으로 등록되었습니다.',
      autoShowError: true,
      autoShowFeedback: true,
      onApiSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['departments'] });
      },
      errorMessages: {
        'VALIDATION.ERROR': '입력값이 올바르지 않습니다.',
        'RESOURCE.ALREADY_EXISTS': '이미 존재하는 부서 코드입니다.',
      },
    }
  );
};

/**
 * 부서 수정 훅
 */
export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();

  return useApiMutation(
    ({ id, data }: {
      id: string;
      data: { department_code: string; department_name: string; is_active?: boolean };
    }) => updateDepartment(id, data) as any,
    {
      successMessage: '부서가 성공적으로 수정되었습니다.',
      autoShowError: true,
      autoShowFeedback: true,
      onApiSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['departments'] });
      },
      errorMessages: {
        'VALIDATION.ERROR': '입력값이 올바르지 않습니다.',
        'RESOURCE.NOT_FOUND': '부서를 찾을 수 없습니다.',
      },
    }
  );
};

/**
 * 부서 삭제 훅
 */
export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();

  return useApiMutation(
    (id: string) => deleteDepartment(id),
    {
      successMessage: '부서가 성공적으로 삭제되었습니다.',
      autoShowError: true,
      autoShowFeedback: true,
      onApiSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['departments'] });
      },
      errorMessages: {
        'RESOURCE.NOT_FOUND': '부서를 찾을 수 없습니다.',
        'RESOURCE.IN_USE': '사용 중인 부서는 삭제할 수 없습니다.',
      },
    }
  );
};
