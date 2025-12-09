import { useState, useEffect, useCallback } from 'react';
import { fetchCommonCodeItems, createCommonCodeItem } from '@/lib/api/commonCodes';
import type { CommonCodeItemPayload } from '@/lib/api/commonCodes';

export interface CommonCodeOption {
  code: string;
  label: string;
  description?: string;
}

const BUSINESS_TYPE_GROUP_ID = 'BUSINESS_TYPE_GROUP_ID';
const ERROR_CODE_GROUP_ID = 'ERROR_CODE_GROUP_ID';

export const useCommonCodes = (groupCode: 'BUSINESS_TYPE' | 'ERROR_CODE') => {
  const [options, setOptions] = useState<CommonCodeOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const groupId = groupCode === 'BUSINESS_TYPE' ? BUSINESS_TYPE_GROUP_ID : ERROR_CODE_GROUP_ID;

  // 공통코드 조회
  const fetchCodes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await fetchCommonCodeItems(groupId);
      const converted = items
        .filter((item) => item.isActive)
        .map((item) => ({
          code: item.codeKey,
          label: item.codeValue,
          description: typeof item.attributes === 'object'
            ? (item.attributes as Record<string, any>)?.description
            : undefined,
        }));
      setOptions(converted);
    } catch (err) {
      const message = err instanceof Error ? err.message : '공통코드 로드 실패';
      setError(message);
      console.error('Failed to fetch common codes:', err);
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  // 초기 로드
  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  // 새 코드 추가
  const addNewCode = useCallback(
    async (label: string, code: string, description: string) => {
      try {
        const payload: CommonCodeItemPayload = {
          codeKey: code,
          codeValue: label,
          sortOrder: options.length + 1,
          isActive: true,
          attributes: description ? { description } : undefined,
        };

        const newItem = await createCommonCodeItem(groupId, payload);

        const newOption: CommonCodeOption = {
          code: newItem.codeKey,
          label: newItem.codeValue,
          description: typeof newItem.attributes === 'object'
            ? (newItem.attributes as Record<string, any>)?.description
            : undefined,
        };

        setOptions((prev) => [...prev, newOption]);
        return newOption;
      } catch (err) {
        const message = err instanceof Error ? err.message : '코드 추가 실패';
        setError(message);
        throw err;
      }
    },
    [groupId, options.length]
  );

  return {
    options,
    isLoading,
    error,
    addNewCode,
    refetch: fetchCodes,
  };
};

export default useCommonCodes;
