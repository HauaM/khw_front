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
 * Mock 데이터: 개발/테스트용 버전 목록
 * TODO: API 연동 시 제거
 */
const mockVersions: ManualVersionInfo[] = [
  { value: 'v2.1', label: 'v2.1 (현재 버전)', date: '2024-01-15' },
  { value: 'v2.0', label: 'v2.0', date: '2024-01-01' },
  { value: 'v1.8', label: 'v1.8', date: '2023-12-10' },
  { value: 'v1.5', label: 'v1.5', date: '2023-11-20' },
];

/**
 * Mock 데이터: 개발/테스트용 버전 상세 정보
 * TODO: API 연동 시 제거
 */
const mockManualVersions: Record<string, ManualVersionDetail> = {
  'v2.1': {
    manual_id: 'MAN-2024-001',
    version: 'v2.1',
    topic: '인터넷뱅킹 로그인 오류 처리 가이드',
    keywords: ['인터넷뱅킹', '로그인오류', 'E001', '비밀번호', '계정잠김', '보안', '2차인증'],
    background: `고객이 인터넷뱅킹 로그인 시 오류가 발생하는 경우는 다양한 원인이 있을 수 있습니다.

가장 일반적인 경우는 비밀번호 5회 이상 오입력으로 인한 계정 잠김 상태이며, 이 외에도 브라우저 호환성 문제, 보안프로그램 미설치, 인증서 만료 등의 원인이 있을 수 있습니다.

본 가이드는 인터넷뱅킹 로그인 오류 발생 시 상담사가 고객에게 안내해야 할 표준 조치사항을 정리한 문서입니다. 각 단계별로 순차적으로 진행하며, 문제가 해결되지 않을 경우 상위 담당자에게 에스컬레이션하시기 바랍니다.

v2.1 업데이트: 2차 인증 관련 문제 해결 절차가 추가되었습니다.`,
    guidelines: [
      {
        title: '계정 상태 확인',
        description:
          '고객의 아이디를 확인하여 계정 잠김 여부를 확인합니다. 비밀번호 5회 이상 오입력 시 자동으로 계정이 잠기며, 본인 확인 후 즉시 해제 가능합니다.',
      },
      {
        title: '브라우저 및 보안프로그램 점검',
        description:
          '고객이 사용 중인 브라우저 버전을 확인하고, 보안프로그램(키보드보안, 방화벽)이 정상적으로 설치되어 있는지 확인합니다. 필요 시 재설치를 안내합니다.',
      },
      {
        title: '인증서 유효성 확인',
        description:
          '공동인증서 또는 간편인증 수단의 유효기간을 확인합니다. 만료된 경우 재발급 절차를 안내하며, 인증서 위치(하드디스크/이동식디스크)도 함께 확인합니다.',
      },
      {
        title: '2차 인증 문제 해결 (신규)',
        description:
          'SMS나 OTP를 통한 2차 인증에서 문제가 발생한 경우, 고객의 등록된 휴대폰 번호를 확인하고 인증번호 재발송을 시도합니다. OTP 기기의 시간 동기화 상태도 확인합니다.',
      },
      {
        title: '캐시 및 쿠키 삭제 안내',
        description:
          '브라우저의 캐시와 쿠키를 삭제하도록 안내합니다. 이는 많은 로그인 오류의 원인이 되며, 삭제 후 브라우저를 재시작하여 다시 시도하도록 합니다.',
      },
      {
        title: '임시 비밀번호 발급',
        description:
          '위 조치사항으로 해결되지 않을 경우, 본인 확인 후 임시 비밀번호를 발급합니다. 고객에게 SMS 또는 ARS를 통해 전달되며, 최초 로그인 시 비밀번호 변경이 필요함을 안내합니다.',
      },
      {
        title: '에스컬레이션',
        description:
          '모든 조치사항을 시도했음에도 문제가 해결되지 않을 경우, 시스템 장애 가능성이 있으므로 2차 지원팀으로 에스컬레이션합니다. 티켓 번호와 함께 상세 내역을 전달합니다.',
      },
    ],
    status: 'APPROVED',
    updated_at: '2024-01-15T14:30:00Z',
  },
  'v2.0': {
    manual_id: 'MAN-2024-001',
    version: 'v2.0',
    topic: '인터넷뱅킹 로그인 오류 처리 가이드',
    keywords: ['인터넷뱅킹', '로그인오류', 'E001', '비밀번호', '계정잠김', '보안'],
    background: `고객이 인터넷뱅킹 로그인 시 오류가 발생하는 경우는 다양한 원인이 있을 수 있습니다.

가장 일반적인 경우는 비밀번호 5회 이상 오입력으로 인한 계정 잠김 상태이며, 이 외에도 브라우저 호환성 문제, 보안프로그램 미설치, 인증서 만료 등의 원인이 있을 수 있습니다.

본 가이드는 인터넷뱅킹 로그인 오류 발생 시 상담사가 고객에게 안내해야 할 표준 조치사항을 정리한 문서입니다. 각 단계별로 순차적으로 진행하며, 문제가 해결되지 않을 경우 상위 담당자에게 에스컬레이션하시기 바랍니다.`,
    guidelines: [
      {
        title: '계정 상태 확인',
        description:
          '고객의 아이디를 확인하여 계정 잠김 여부를 확인합니다. 비밀번호 5회 이상 오입력 시 자동으로 계정이 잠기며, 본인 확인 후 즉시 해제 가능합니다.',
      },
      {
        title: '브라우저 및 보안프로그램 점검',
        description:
          '고객이 사용 중인 브라우저 버전을 확인하고, 보안프로그램(키보드보안, 방화벽)이 정상적으로 설치되어 있는지 확인합니다. 필요 시 재설치를 안내합니다.',
      },
      {
        title: '인증서 유효성 확인',
        description:
          '공동인증서 또는 간편인증 수단의 유효기간을 확인합니다. 만료된 경우 재발급 절차를 안내하며, 인증서 위치(하드디스크/이동식디스크)도 함께 확인합니다.',
      },
      {
        title: '캐시 및 쿠키 삭제 안내',
        description:
          '브라우저의 캐시와 쿠키를 삭제하도록 안내합니다. 이는 많은 로그인 오류의 원인이 되며, 삭제 후 브라우저를 재시작하여 다시 시도하도록 합니다.',
      },
      {
        title: '임시 비밀번호 발급',
        description:
          '위 조치사항으로 해결되지 않을 경우, 본인 확인 후 임시 비밀번호를 발급합니다. 고객에게 SMS 또는 ARS를 통해 전달되며, 최초 로그인 시 비밀번호 변경이 필요함을 안내합니다.',
      },
      {
        title: '에스컬레이션',
        description:
          '모든 조치사항을 시도했음에도 문제가 해결되지 않을 경우, 시스템 장애 가능성이 있으므로 2차 지원팀으로 에스컬레이션합니다. 티켓 번호와 함께 상세 내역을 전달합니다.',
      },
    ],
    status: 'APPROVED',
    updated_at: '2024-01-01T10:00:00Z',
  },
};

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
        // API 연동: GET /api/v1/manuals/{manualId}/versions
        let versionList: ManualVersionInfo[];

        try {
          versionList = await getManualVersions(manualId);
        } catch (apiErr) {
          // API 연동이 아직 준비되지 않은 경우 mock 데이터 사용
          console.warn('Version API not available, using mock data:', apiErr);
          versionList = mockVersions;
        }

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
        setError(err instanceof Error ? err : new Error('Failed to load versions'));
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
        // API 연동: GET /api/v1/manuals/{manualId}/versions/{version}
        // Promise.all로 병렬 로딩
        let oldDetail: ManualVersionDetail;
        let newDetail: ManualVersionDetail;

        try {
          const results = await Promise.all([
            getManualVersionDetail(manualId, oldVersion),
            getManualVersionDetail(manualId, newVersion),
          ]);
          oldDetail = results[0];
          newDetail = results[1];
        } catch (apiErr) {
          // API 연동이 아직 준비되지 않은 경우 mock 데이터 사용
          console.warn('Version detail API not available, using mock data:', apiErr);
          oldDetail = mockManualVersions[oldVersion];
          newDetail = mockManualVersions[newVersion];
        }

        if (!oldDetail || !newDetail) {
          throw new Error('Version data not found');
        }

        setOldData(oldDetail);
        setNewData(newDetail);
      } catch (err) {
        setIsError(true);
        setError(err instanceof Error ? err : new Error('Failed to load version data'));
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
