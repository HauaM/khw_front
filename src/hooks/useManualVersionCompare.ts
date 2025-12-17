import { useState, useEffect } from 'react';
import {
  ManualVersionInfo,
  ManualVersionDetail,
  ManualGuideline,
  ChangeFlag,
} from '@/types/manuals';
import { getManualVersions, getManualVersionDetail } from '@/lib/api/manuals';

export interface UseManualVersionCompareResult {
  versions: ManualVersionInfo[];
  oldVersion: string;
  newVersion: string;
  oldData: ManualVersionDetail | null;
  newData: ManualVersionDetail | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  setOldVersion: (version: string) => void;
  setNewVersion: (version: string) => void;
  getKeywordStatus: (keyword: string, side: 'old' | 'new') => ChangeFlag;
  getGuidelineStatus: (guideline: ManualGuideline, side: 'old' | 'new') => ChangeFlag;
}


/**
 * 메뉴얼 버전 비교를 위한 훅
 *
 * @param manualId - 메뉴얼 ID
 * @param initialOld - 초기 이전 버전 (생략시 자동 선택)
 * @param initialNew - 초기 최신 버전 (생략시 자동 선택)
 * @returns 버전 비교 데이터 및 상태 관리
 */
export const useManualVersionCompare = (
  manualId: string,
  initialOld?: string,
  initialNew?: string,
): UseManualVersionCompareResult => {
  const [versions, setVersions] = useState<ManualVersionInfo[]>([]);
  const [oldVersion, setOldVersion] = useState<string>('');
  const [newVersion, setNewVersion] = useState<string>('');
  const [oldData, setOldData] = useState<ManualVersionDetail | null>(null);
  const [newData, setNewData] = useState<ManualVersionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * 버전 목록 초기 로드 및 기본값 설정
   */
  useEffect(() => {
    const loadVersions = async () => {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      try {
        // API: GET /api/v1/manuals/{manualId}/versions
        const versionList = await getManualVersions(manualId);
        setVersions(versionList);

        // 초기 버전 설정
        let initialOldVer = initialOld;
        let initialNewVer = initialNew;

        if (!initialNewVer && versionList.length > 0) {
          initialNewVer = versionList[0].value; // 최신 버전
        }
        if (!initialOldVer && versionList.length > 1) {
          initialOldVer = versionList[1].value; // 그 다음 버전
        } else if (!initialOldVer && versionList.length === 1) {
          initialOldVer = versionList[0].value;
        }

        if (initialNewVer) setNewVersion(initialNewVer);
        if (initialOldVer) setOldVersion(initialOldVer);
      } catch (err) {
        setIsError(true);
        setError(err instanceof Error ? err : new Error('버전 목록을 불러올 수 없습니다'));
        console.error('Error loading versions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadVersions();
  }, [manualId, initialOld, initialNew]);

  /**
   * 버전 데이터 로드
   */
  useEffect(() => {
    const loadVersionData = async () => {
      if (!oldVersion || !newVersion) return;

      setIsLoading(true);
      setIsError(false);
      setError(null);

      try {
        // API: GET /api/v1/manuals/{manualId}/versions/{version}
        // 병렬 로딩 (Promise.all)
        const [oldResponse, newResponse] = await Promise.all([
          getManualVersionDetail(manualId, oldVersion),
          getManualVersionDetail(manualId, newVersion),
        ]);

        if (!oldResponse.data || !newResponse.data) {
          throw new Error('버전 데이터를 찾을 수 없습니다');
        }

        setOldData(oldResponse.data);
        setNewData(newResponse.data);
      } catch (err) {
        setIsError(true);
        setError(err instanceof Error ? err : new Error('버전 데이터를 불러올 수 없습니다'));
        console.error('Error loading version data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadVersionData();
  }, [manualId, oldVersion, newVersion]);

  /**
   * 키워드 변경 상태 확인
   */
  const getKeywordStatus = (keyword: string, side: 'old' | 'new'): ChangeFlag => {
    if (!oldData || !newData) return '';

    const oldKeywords = oldData.keywords || [];
    const newKeywords = newData.keywords || [];

    if (side === 'old') {
      // 이전 버전에는 있고 새 버전에는 없으면 "제거됨"
      return newKeywords.includes(keyword) ? '' : 'REMOVED';
    } else {
      // 새 버전에는 있고 이전 버전에는 없으면 "추가됨"
      return oldKeywords.includes(keyword) ? '' : 'ADDED';
    }
  };

  /**
   * 가이드라인 변경 상태 확인
   */
  const getGuidelineStatus = (guideline: ManualGuideline, side: 'old' | 'new'): ChangeFlag => {
    if (!oldData || !newData) return '';

    const oldGuidelines = oldData.guidelines || [];
    const newGuidelines = newData.guidelines || [];

    if (side === 'old') {
      // 이전 버전에는 있고 새 버전에는 없으면 "제거됨"
      const existsInNew = newGuidelines.some((g) => g.title === guideline.title);
      if (!existsInNew) return 'REMOVED';

      // 제목은 같지만 설명이 다르면 "수정됨"
      const newGuideline = newGuidelines.find((g) => g.title === guideline.title);
      if (newGuideline && newGuideline.description !== guideline.description) {
        return 'MODIFIED';
      }
    } else {
      // 새 버전에는 있고 이전 버전에는 없으면 "추가됨"
      const existsInOld = oldGuidelines.some((g) => g.title === guideline.title);
      if (!existsInOld) return 'ADDED';

      // 제목은 같지만 설명이 다르면 "수정됨"
      const oldGuideline = oldGuidelines.find((g) => g.title === guideline.title);
      if (oldGuideline && oldGuideline.description !== guideline.description) {
        return 'MODIFIED';
      }
    }

    return '';
  };

  return {
    versions,
    oldVersion,
    newVersion,
    oldData,
    newData,
    isLoading,
    isError,
    error,
    setOldVersion,
    setNewVersion,
    getKeywordStatus,
    getGuidelineStatus,
  };
};
