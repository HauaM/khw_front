// User Management Hook
import { useMemo, useState } from 'react';
import type { UserListParams, UserListResponse, UserSearchFormParams } from '@/types/users';
import { getUsers } from '@/lib/api/users';
import { useApiQuery } from '@/hooks/useApiQuery';

const defaultSearchParams: UserSearchFormParams = {
  employee_id: '',
  name: '',
  role: '',
  is_active: '',
  department_code: '',
  page: 1,
  page_size: 20,
  sort_by: 'created_at',
  sort_order: 'desc',
};

const buildUserListParams = (params: UserSearchFormParams): UserListParams => {
  const mapped: UserListParams = {
    employee_id: params.employee_id?.trim() || undefined,
    name: params.name?.trim() || undefined,
    department_code: params.department_code?.trim() || undefined,
    role: params.role || undefined,
    page: params.page || 1,
    page_size: params.page_size || 20,
    sort_by: params.sort_by || 'created_at',
    sort_order: params.sort_order || 'desc',
  };

  if (params.is_active === 'true') {
    mapped.is_active = true;
  } else if (params.is_active === 'false') {
    mapped.is_active = false;
  }

  return mapped;
};

export const useUsers = (initialParams?: UserSearchFormParams) => {
  const [searchParams, setSearchParams] = useState<UserSearchFormParams>(
    initialParams ? { ...defaultSearchParams, ...initialParams } : defaultSearchParams
  );

  const apiParams = useMemo(() => buildUserListParams(searchParams), [searchParams]);

  const query = useApiQuery<UserListResponse>(['users', apiParams], () => getUsers(apiParams), {
    autoShowFeedback: false,
    autoShowError: true,
    queryOptions: {
      keepPreviousData: true,
    },
  });

  const handleSearch = (params: UserSearchFormParams) => {
    setSearchParams((prev) => ({ ...prev, ...params }));
  };

  const handleReset = () => {
    setSearchParams(defaultSearchParams);
  };

  return {
    users: query.data?.items || [],
    total: query.data?.total || 0,
    page: query.data?.page || searchParams.page || 1,
    pageSize: query.data?.page_size || searchParams.page_size || 20,
    totalPages: query.data?.total_pages || 0,
    isLoading: query.isLoading || query.isFetching,
    error: query.error instanceof Error ? query.error : null,
    searchParams,
    setSearchParams,
    handleSearch,
    handleReset,
    refetch: query.refetch,
  };
};
