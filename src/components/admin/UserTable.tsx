// User Table Component
import React from 'react';
import type { UserResponse } from '@/types/users';

interface UserTableProps {
  users: UserResponse[];
  onEdit: (userId: number) => void;
  onDelete?: (userId: number) => void;
  rowRefs: React.MutableRefObject<Record<string, HTMLTableRowElement | null>>;
  highlightedId: string | null;
  deleteDisabled?: boolean;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  onEdit,
  onDelete,
  rowRefs,
  highlightedId,
  deleteDisabled = false,
}) => {
  const getRoleBadge = (role: string) => {
    const roleMap: Record<
      string,
      { label: string; variant: 'error' | 'info' | 'neutral' }
    > = {
      ADMIN: { label: '관리자', variant: 'error' },
      CONSULTANT: { label: '상담사', variant: 'info' },
      REVIEWER: { label: '검토자', variant: 'neutral' },
    };

    const config = roleMap[role] || { label: role, variant: 'neutral' as const };

    const variantClass = {
      error: 'bg-red-100 text-red-600',
      info: 'bg-blue-100 text-blue-600',
      neutral: 'bg-gray-100 text-gray-600',
    }[config.variant];

    return (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${variantClass}`}
      >
        {config.label}
      </span>
    );
  };

  const renderDepartments = (departments: UserResponse['departments']) => {
    if (!departments || departments.length === 0) {
      return '-';
    }

    return departments.map((dept) => dept.department_name).join(', ');
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-blue-50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-semibold text-primary-600">
              직번
            </th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-primary-600">
              사용자 한글명
            </th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-primary-600">
              역할
            </th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-primary-600">
              부서명
            </th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-primary-600">
              사용 여부
            </th>
            <th className="px-3 py-2 text-center text-xs font-semibold text-primary-600">
              관리
            </th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-3 py-6 text-center text-sm text-gray-500"
              >
                조회된 데이터가 없습니다
              </td>
            </tr>
          ) : (
            users.map((user) => {
              const isHighlighted = highlightedId === user.employee_id;
              return (
                <tr
                  key={user.id}
                  ref={(el) => (rowRefs.current[user.employee_id] = el)}
                  id={`user-row-${user.employee_id}`}
                  className={`hover:bg-gray-50 transition-colors ${
                    isHighlighted ? 'bg-primary-50 ring-2 ring-primary-500' : ''
                  }`}
                >
                  <td className="px-3 py-2 text-sm text-gray-900 border-t border-gray-200">
                    {user.employee_id}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900 border-t border-gray-200">
                    {user.name}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900 border-t border-gray-200">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900 border-t border-gray-200">
                    {renderDepartments(user.departments)}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900 border-t border-gray-200">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                        user.is_active
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {user.is_active ? '사용' : '미사용'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900 border-t border-gray-200 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEdit(user.id)}
                        className="px-2 py-1 text-xs font-semibold bg-white text-primary-500 border border-primary-500 rounded hover:bg-primary-50 transition"
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete?.(user.id)}
                        disabled={deleteDisabled}
                        className={`px-2 py-1 text-xs font-semibold rounded transition ${
                          deleteDisabled
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
