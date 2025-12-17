import { useState, useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { getManualDetail, updateManual } from '@/lib/api/manuals';
import {
  ManualDetail,
  ManualGuideline,
  ManualEditErrors,
  ManualUpdatePayload,
} from '@/types/manuals';

/**
 * 메뉴얼 편집 폼 훅
 * - 메뉴얼 데이터 로딩 및 guidelines 배열 변환
 * - 폼 상태 관리 (formData, keywordInput, errors)
 * - 입력 핸들러 제공
 * - 저장 로직 관리 (guidelines 배열을 문자열로 변환)
 */

/**
 * OpenAPI의 guideline 문자열을 ManualGuideline 배열로 변환
 * guideline은 쌍으로 된 라인 (제목\n설명\n제목\n설명...)
 */
const parseGuidelinesFromString = (guidelineStr: string): ManualGuideline[] => {
  const lines = guidelineStr
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const guidelines: ManualGuideline[] = [];

  for (let i = 0; i < lines.length; i += 2) {
    if (i + 1 < lines.length) {
      guidelines.push({
        title: lines[i],
        description: lines[i + 1],
      });
    } else if (i < lines.length) {
      // 마지막 라인이 홀수개인 경우
      guidelines.push({
        title: lines[i],
        description: '',
      });
    }
  }

  return guidelines.length > 0 ? guidelines : [{ title: '', description: '' }];
};

/**
 * ManualGuideline 배열을 OpenAPI guideline 문자열로 변환
 */
const serializeGuidelinesToString = (guidelines: ManualGuideline[]): string => {
  return guidelines
    .filter((g) => g.title.trim() || g.description.trim())
    .flatMap((g) => [g.title.trim() || '(제목 없음)', g.description.trim() || '(설명 없음)'])
    .join('\n');
};

export const useManualEditForm = (manualId: string) => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<ManualDetail | null>(null);
  const [guidelines, setGuidelines] = useState<ManualGuideline[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [errors, setErrors] = useState<ManualEditErrors>({});

  // 메뉴얼 데이터 로드
  useEffect(() => {
    loadManualData();
  }, [manualId]);

  /**
   * 메뉴얼 데이터 로드
   * - API에서 메뉴얼 상세 정보 조회
   * - guideline 문자열을 배열로 변환
   */
  const loadManualData = async () => {
    setIsLoading(true);
    try {
      // API 호출: GET /api/v1/manuals/{manual_id}
      const response = await getManualDetail(manualId);

      if (!response.data) {
        throw new Error('메뉴얼 조회 실패: 응답 데이터 없음');
      }

      // guideline 문자열을 배열로 변환
      const parsedGuidelines = parseGuidelinesFromString(response.data.guideline);

      setFormData(response.data);
      setGuidelines(parsedGuidelines);
      setErrors({});
    } catch (error) {
      console.error('Failed to load manual:', error);
      showToast('메뉴얼을 불러오는데 실패했습니다.', 'error');
      setFormData(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 폼 입력값 변경
   */
  const handleInputChange = (field: keyof ManualUpdatePayload, value: string) => {
    setFormData((prev) => {
      if (!prev) return null;
      return { ...prev, [field]: value } as any;
    });

    // 에러 제거
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  /**
   * 키워드 추가
   */
  const handleAddKeyword = () => {
    if (!formData) return;

    const trimmedKeyword = keywordInput.trim();
    if (!trimmedKeyword) return;

    if (formData.keywords.includes(trimmedKeyword)) {
      showToast('이미 존재하는 키워드입니다.', 'error');
      return;
    }

    setFormData({
      ...formData,
      keywords: [...formData.keywords, trimmedKeyword],
    });
    setKeywordInput('');
  };

  /**
   * 키워드 제거
   */
  const handleRemoveKeyword = (keyword: string) => {
    setFormData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        keywords: prev.keywords.filter((k) => k !== keyword),
      };
    });
  };

  /**
   * 조치사항 변경
   */
  const handleGuidelineChange = (index: number, field: keyof ManualGuideline, value: string) => {
    setGuidelines((prev) => {
      const newGuidelines = [...prev];
      newGuidelines[index] = { ...newGuidelines[index], [field]: value };
      return newGuidelines;
    });
  };

  /**
   * 조치사항 추가
   */
  const handleAddGuideline = () => {
    setGuidelines((prev) => [...prev, { title: '', description: '' }]);
  };

  /**
   * 조치사항 제거
   */
  const handleRemoveGuideline = (index: number) => {
    setGuidelines((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * 폼 유효성 검사
   */
  const validateForm = (): boolean => {
    if (!formData) return false;

    const newErrors: ManualEditErrors = {};

    // topic 검증
    if (!formData.topic.trim()) {
      newErrors.topic = '주제는 필수 항목입니다.';
    }

    // keywords 검증
    if (formData.keywords.length === 0) {
      newErrors.keywords = '최소 1개의 키워드를 입력해주세요.';
    }

    // background 검증
    if (!formData.background.trim()) {
      newErrors.background = '배경 정보는 필수 항목입니다.';
    }

    // guidelines 검증
    if (guidelines.length === 0) {
      newErrors.guidelines = '최소 1개의 조치사항을 입력해주세요.';
    } else {
      guidelines.forEach((guideline, index) => {
        if (!guideline.title.trim()) {
          newErrors[`guideline_title_${index}`] = '조치사항 제목은 필수입니다.';
        }
        if (!guideline.description.trim()) {
          newErrors[`guideline_desc_${index}`] = '조치사항 설명은 필수입니다.';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * 저장
   * - API PUT /api/v1/manuals/{manual_id}로 전송
   * - guidelines 배열을 문자열로 변환
   */
  const handleSave = async (): Promise<boolean> => {
    if (!validateForm()) {
      showToast('필수 항목을 모두 입력해주세요.', 'error');
      return false;
    }

    if (!formData) return false;

    setIsSaving(true);

    try {
      // 저장할 데이터 준비
      // guideline을 문자열로 직렬화 (OpenAPI 형식)
      const guidelineString = serializeGuidelinesToString(guidelines);

      const payload = {
        topic: formData.topic,
        keywords: formData.keywords,
        background: formData.background,
        guideline: guidelineString,
        status: formData.status,
      };

      // API 호출: PUT /api/v1/manuals/{manual_id}
      console.log('Sending payload:', JSON.stringify(payload, null, 2));
      await updateManual(manualId, payload);

      console.log('Manual saved successfully:', payload);
      return true;
    } catch (error: any) {
      console.error('Failed to save manual:', error);
      console.error('Error response:', error.response?.data);

      // 백엔드 검증 오류 메시지 추출
      const errorMessage = error.response?.data?.detail?.[0]?.msg || '저장에 실패했습니다. 다시 시도해주세요.';
      showToast(errorMessage, 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isLoading,
    isSaving,
    formData,
    guidelines,
    keywordInput,
    errors,
    setKeywordInput,
    handleInputChange,
    handleAddKeyword,
    handleRemoveKeyword,
    handleGuidelineChange,
    handleAddGuideline,
    handleRemoveGuideline,
    handleSave,
  };
};
