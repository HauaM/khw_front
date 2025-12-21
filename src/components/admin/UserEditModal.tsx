// User Edit Modal Component
import React, { useEffect, useMemo, useState } from 'react';
import TypeAheadSelectBox, {
  type TypeAheadOption,
} from '@/components/common/TypeAheadSelectBox';
import type { UserResponse, UserRole, UserUpdatePayload } from '@/types/users';
import { useApiMutation } from '@/hooks/useApiMutation';
import { updateUser } from '@/lib/api/users';

interface UserEditModalProps {
  isOpen: boolean;
  user: UserResponse | null;
  onClose: () => void;
  onSuccess: () => void;
  departmentOptions: TypeAheadOption[];
  isDepartmentLoading?: boolean;
}

const roleOptions: Array<{ value: UserRole; label: string }> = [
  { value: 'ADMIN', label: '관리자' },
  { value: 'CONSULTANT', label: '상담사' },
  { value: 'REVIEWER', label: '검토자' },
];

const passwordPolicyMessage = '비밀번호는 12자 이상, 대/소문자/특수문자를 포함해야 합니다.';

const UserEditModal: React.FC<UserEditModalProps> = ({
  isOpen,
  user,
  onClose,
  onSuccess,
  departmentOptions,
  isDepartmentLoading = false,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('CONSULTANT');
  const [isActive, setIsActive] = useState(true);
  const [departmentId, setDepartmentId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateMutation = useApiMutation(
    (payload: UserUpdatePayload) => updateUser(user?.id ?? 0, payload),
    {
      successMessage: '사용자 정보가 수정되었습니다.',
      autoShowFeedback: true,
      onApiSuccess: async () => {
        onSuccess();
        handleClose();
      },
    }
  );

  const passwordRegex = useMemo(
    () => /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{12,}$/,
    []
  );

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setRole(user.role);
    setIsActive(user.is_active);
    setDepartmentId(user.departments?.[0]?.id || '');
    setPassword('');
    setPasswordConfirm('');
    setErrors({});
  }, [user]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = '사용자명을 입력하세요';
    }

    if (password) {
      if (!passwordRegex.test(password)) {
        newErrors.password = passwordPolicyMessage;
      }
      if (!passwordConfirm) {
        newErrors.password_confirm = '비밀번호 확인을 입력하세요';
      } else if (passwordConfirm !== password) {
        newErrors.password_confirm = '비밀번호가 일치하지 않습니다';
      }
    }

    if (!departmentId) {
      newErrors.department_ids = '부서를 선택하세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !validate()) return;

    const payload: UserUpdatePayload = {
      name: name.trim(),
      role,
      is_active: isActive,
      department_ids: departmentId ? [departmentId] : undefined,
    };

    if (password) {
      payload.password = password;
    }

    updateMutation.mutate(payload);
  };

  const handleClose = () => {
    setPassword('');
    setPasswordConfirm('');
    setErrors({});
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">사용자 수정</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">직번</label>
                <input
                  type="text"
                  value={user.employee_id}
                  disabled
                  className="h-9 w-full rounded-md border border-gray-200 bg-gray-100 px-3 text-sm text-gray-700"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">사용자 한글명 *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`h-9 w-full rounded-md border bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
                    errors.name
                      ? 'border-red-600 focus:ring-red-100 focus:border-red-600'
                      : 'border-gray-300 focus:ring-primary-500/20 focus:border-primary-500'
                  }`}
                />
                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">역할 *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                >
                  {roleOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">부서 *</label>
                <TypeAheadSelectBox
                  options={departmentOptions}
                  selectedCode={departmentId}
                  onChange={(code) => setDepartmentId(code)}
                  placeholder="부서를 선택하세요"
                  error={errors.department_ids}
                  allowCreate={false}
                  isLoading={isDepartmentLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">비밀번호 변경</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="변경 시에만 입력"
                  className={`h-9 w-full rounded-md border bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
                    errors.password
                      ? 'border-red-600 focus:ring-red-100 focus:border-red-600'
                      : 'border-gray-300 focus:ring-primary-500/20 focus:border-primary-500'
                  }`}
                />
                {errors.password && (
                  <p className="text-xs text-red-600 mt-1">{errors.password}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">비밀번호 확인</label>
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="비밀번호 확인"
                  className={`h-9 w-full rounded-md border bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
                    errors.password_confirm
                      ? 'border-red-600 focus:ring-red-100 focus:border-red-600'
                      : 'border-gray-300 focus:ring-primary-500/20 focus:border-primary-500'
                  }`}
                />
                {errors.password_confirm && (
                  <p className="text-xs text-red-600 mt-1">{errors.password_confirm}</p>
                )}
              </div>
            </div>

            <p className="text-xs text-gray-500">{passwordPolicyMessage}</p>

            <div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsActive((prev) => !prev)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    isActive ? 'bg-primary-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      isActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <label className="text-xs font-semibold text-gray-700">사용 여부</label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-semibold bg-white text-primary-500 border border-primary-500 rounded-md hover:bg-primary-50 transition"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition ${
                  updateMutation.isPending
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-primary-500 text-white hover:bg-primary-600'
                }`}
              >
                저장
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserEditModal;
