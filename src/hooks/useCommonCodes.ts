import { useState, useEffect, useCallback } from 'react';
import { fetchCommonCodeGroups, fetchCommonCodeItems, createCommonCodeItem } from '@/lib/api/commonCodes';
import type { CommonCodeItemPayload } from '@/lib/api/commonCodes';

export interface CommonCodeOption {
  code: string;
  label: string;
  description?: string;
}

export const useCommonCodes = (groupCode: 'BUSINESS_TYPE' | 'ERROR_CODE') => {
  const [options, setOptions] = useState<CommonCodeOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groupId, setGroupId] = useState<string | null>(null);

  // 그룹 ID 초기화: groupCode로 해당 그룹의 ID 찾기
  useEffect(() => {
    (async () => {
      try {
        const response = await fetchCommonCodeGroups();
        console.log('response', response);
        if (response.data) {
          console.log('Fetched common code groups:', response.data);
          const group = response.data.find((g) => g.groupCode === groupCode);
          if (group) {
            setGroupId(group.id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch groups:', err);
      }
    })();
  }, [groupCode]);

  // 공통코드 조회
  const fetchCodes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
    const response = await fetchCommonCodeItems(groupCode);
      if (response.data) {
        const converted = response.data
          .filter((item) => item.isActive)
          .map((item) => ({
            code: item.codeKey,
            label: item.codeValue,
            description: typeof item.attributes === 'object'
              ? (item.attributes as Record<string, any>)?.description
              : undefined,
          }));
        setOptions(converted);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '공통코드 로드 실패';
      setError(message);
      console.error('Failed to fetch common codes:', err);
    } finally {
      setIsLoading(false);
    }
  }, [groupCode]);

  // 초기 로드
  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  // 새 코드 추가
  const addNewCode = useCallback(
    async (label: string, code: string, description: string) => {
      if (!groupId) {
        throw new Error('그룹 ID가 로드되지 않았습니다.');
      }

      try {
        const payload: CommonCodeItemPayload = {
          codeKey: code,
          codeValue: label,
          sortOrder: options.length + 1,
          isActive: true,
          attributes: description ? { description } : undefined,
        };

        const response = await createCommonCodeItem(groupId, payload);

        if (!response.data) {
          throw new Error('코드 추가 실패: 응답 데이터 없음');
        }

        const newOption: CommonCodeOption = {
          code: response.data.codeKey,
          label: response.data.codeValue,
          description: typeof response.data.attributes === 'object'
            ? (response.data.attributes as Record<string, any>)?.description
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
