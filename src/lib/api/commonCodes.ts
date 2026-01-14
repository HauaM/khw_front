/**
 * 공통코드 관리 API 레이어
 * - OpenAPI 스펙 기반으로 실제 백엔드 API와 연동
 * - axiosClient를 사용한 REST API 호출
 */

import { api } from '@/lib/api/axiosClient';
import { AxiosError } from 'axios';
import { ApiResponse } from '@/types/api';

interface BackendErrorDetail {
  msg?: string;
  message?: string;
  [key: string]: unknown;
}

interface BackendErrorResponse {
  detail?: string | BackendErrorDetail[];
  message?: string;
}

/**
 * 백엔드 에러 응답에서 메시지 추출
 */
export function getErrorMessage(
  error: AxiosError | Error | string | null | undefined
): string {
  if (error instanceof AxiosError) {
    const errorData = error.response?.data as BackendErrorResponse | undefined;

    if (errorData?.detail) {
      if (typeof errorData.detail === 'string') {
        return errorData.detail;
      }

      if (Array.isArray(errorData.detail) && errorData.detail.length > 0) {
        return errorData.detail
          .map((detail) => detail.msg ?? detail.message ?? JSON.stringify(detail))
          .join(', ');
      }
    }

    if (errorData?.message) {
      return errorData.message;
    }

    return error.message || `API 오류 (상태: ${error.response?.status})`;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return '알 수 없는 오류가 발생했습니다.';
}

/**
 * 공통코드 그룹 타입 (프론트엔드 표현)
 */
export interface CommonCodeGroup {
  id: string;             // UUID
  groupCode: string;      // BUSINESS_TYPE
  groupName: string;      // 업무구분
  description?: string;
  isActive: boolean;
  createdAt?: string;     // ISO 8601
  updatedAt?: string;     // ISO 8601
}

/**
 * 공통코드 항목 타입 (프론트엔드 표현)
 */
export interface CommonCodeItem {
  id: string;             // UUID
  groupId: string;        // UUID
  codeKey: string;        // DEPOSIT
  codeValue: string;      // 예금
  sortOrder: number;
  isActive: boolean;
  attributes?: Record<string, any>; // 메타데이터
  createdAt?: string;     // ISO 8601
  updatedAt?: string;     // ISO 8601
}

/**
 * 공통코드 그룹 생성/수정 요청 페이로드
 */
export interface CommonCodeGroupPayload {
  groupCode: string;
  groupName: string;
  description?: string;
  isActive: boolean;
}

/**
 * 공통코드 항목 생성/수정 요청 페이로드
 */
export interface CommonCodeItemPayload {
  codeKey: string;
  codeValue: string;
  sortOrder: number;
  isActive: boolean;
  attributes?: Record<string, any>;
}

/**
 * API 응답 타입 (snake_case)
 */
interface CommonCodeGroupResponse {
  id: string;
  group_code: string;
  group_name: string;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CommonCodeItemResponse {
  id: string;
  group_id: string;
  code_key: string;
  code_value: string;
  sort_order: number;
  is_active: boolean;
  attributes?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

interface CommonCodeGroupListResponse {
  items: CommonCodeGroupResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface CommonCodeItemListResponse {
  items: CommonCodeItemResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface CommonCodeItemsResponse {
  group_code: string;
  items: CommonCodeItemResponseV2[];
}

interface CommonCodeItemResponseV2 {
  id?: string;
  group_id?: string;
  code_key: string;
  code_value: string;
  sort_order?: number;
  is_active?: boolean;
  attributes?: Record<string, any> | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * API 응답을 프론트엔드 형식으로 변환
 */
function transformGroup(data: CommonCodeGroupResponse): CommonCodeGroup {
  return {
    id: data.id,
    groupCode: data.group_code,
    groupName: data.group_name,
    description: data.description || undefined,
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

function transformItem(data: CommonCodeItemResponse): CommonCodeItem {
  return {
    id: data.id,
    groupId: data.group_id,
    codeKey: data.code_key,
    codeValue: data.code_value,
    sortOrder: data.sort_order,
    isActive: data.is_active,
    attributes: data.attributes || undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

function buildGroupRequestBody(payload: CommonCodeGroupPayload) {
  return {
    group_code: payload.groupCode,
    group_name: payload.groupName,
    description: payload.description,
    is_active: payload.isActive,
  };
}

function buildItemRequestBody(payload: CommonCodeItemPayload) {
  return {
    code_key: payload.codeKey,
    code_value: payload.codeValue,
    sort_order: payload.sortOrder,
    is_active: payload.isActive,
    attributes: payload.attributes,
  };
}

/**
 * 모든 공통코드 그룹 조회 (페이징) - 일반용
 * API: GET /api/v1/common-codes/groups
 */
export async function fetchCommonCodeGroups(
  page: number = 1,
  pageSize: number = 100
): Promise<ApiResponse<CommonCodeGroup[]>> {
  const response = await api.get<ApiResponse<CommonCodeGroupListResponse>>(
    '/api/v1/common-codes/groups',
    {
      params: { page, page_size: pageSize },
    }
  );

  if (!response.success) {
    return response as ApiResponse<CommonCodeGroup[]>;
  }

  return {
    ...response,
    data: response.data.items.map(transformGroup),
  };
}

/**
 * 모든 공통코드 그룹 조회 (페이징) - 관리자용
 * API: GET /api/v1/admin/common-codes/groups
 */
export async function fetchCommonCodeGroupsForAdmin(
  page: number = 1,
  pageSize: number = 100
): Promise<ApiResponse<CommonCodeGroup[]>> {
  const response = await api.get<ApiResponse<CommonCodeGroupListResponse>>(
    '/api/v1/admin/common-codes/groups',
    {
      params: { page, page_size: pageSize },
    }
  );

  if (!response.success) {
    return response as ApiResponse<CommonCodeGroup[]>;
  }

  return {
    ...response,
    data: response.data.items.map(transformGroup),
  };
}

/**
 * 공통코드 그룹 생성
 * API: POST /api/v1/admin/common-codes/groups
 */
export async function createCommonCodeGroup(
  payload: CommonCodeGroupPayload
): Promise<ApiResponse<CommonCodeGroup>> {
  const response = await api.post<ApiResponse<CommonCodeGroup>>(
    '/api/v1/admin/common-codes/groups',
    buildGroupRequestBody(payload)
  );

  return response;
}

/**
 * 공통코드 그룹 수정
 * API: PUT /api/v1/admin/common-codes/groups/{group_id}
 */
export async function updateCommonCodeGroup(
  groupId: string,
  payload: CommonCodeGroupPayload
): Promise<ApiResponse<CommonCodeGroup>> {
  const response = await api.put<ApiResponse<CommonCodeGroup>>(
    `/api/v1/admin/common-codes/groups/${groupId}`,
    buildGroupRequestBody(payload)
  );

  return response;
}

/**
 * 공통코드 그룹 삭제
 * API: DELETE /api/v1/admin/common-codes/groups/{group_id}
 */
export async function deleteCommonCodeGroup(groupId: string): Promise<ApiResponse<null>> {
  const response = await api.delete<ApiResponse<null>>(
    `/api/v1/admin/common-codes/groups/${groupId}`
  );

  return response;
}

/**
 * 특정 그룹의 공통코드 항목 조회 (일반용 - groupCode 사용)
 * API: GET /api/v1/common-codes/{group_code}
 * 사용처: 상담등록, TypeAheadSelectBox 등 일반 사용자 화면
 */
export async function fetchCommonCodeItems(
  groupCode: string
): Promise<ApiResponse<CommonCodeItem[]>> {
  const response = await api.get<ApiResponse<CommonCodeItemsResponse>>(
    `/api/v1/common-codes/${groupCode}`
  );

  if (!response.success) {
    // ✅ 실패 응답은 그대로 반환 (meta/error/feedback 보존)
    return response as ApiResponse<CommonCodeItem[]>;
  }

  const rawItems = response.data.items || [];
  const commonCodeItems = rawItems.map((item, index) => {
    const transformed = transformItem({
      id: item.id || `${groupCode}-${item.code_key}-${index}`,
      group_id: item.group_id || groupCode,
      code_key: item.code_key || '',
      code_value: item.code_value || '',
      sort_order: typeof item.sort_order === 'number' ? item.sort_order : index,
      is_active: item.is_active !== false,
      attributes: item.attributes || undefined,
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.updated_at || new Date().toISOString(),
    });
    return transformed;
  });

  return {
    ...response,
    data: commonCodeItems.sort((a, b) => a.sortOrder - b.sortOrder),
  };

}

/**
 * 특정 그룹의 공통코드 항목 조회 (관리자용 - groupId 사용)
 * API: GET /api/v1/admin/common-codes/groups/{group_id}/items
 * 사용처: 관리자 - 공통코드관리 페이지의 코드 항목 조회
 */
export async function fetchCommonCodeItemsForAdmin(
  groupId: string,
  page: number = 1,
  pageSize: number = 100
): Promise<ApiResponse<CommonCodeItem[]>> {
  const response = await api.get<ApiResponse<CommonCodeItemListResponse>>(
    `/api/v1/admin/common-codes/groups/${groupId}/items`,
    {
      params: { page, page_size: pageSize },
    }
  );

  if (!response.success) {
    return response as ApiResponse<CommonCodeItem[]>;
  }

  return {
    ...response,
    data: response.data.items
      .map(transformItem)
      .sort((a, b) => a.sortOrder - b.sortOrder),
  };
}

/**
 * 공통코드 항목 생성
 * API: POST /api/v1/admin/common-codes/groups/{group_id}/items
 */
export async function createCommonCodeItem(
  groupId: string,
  payload: CommonCodeItemPayload
): Promise<ApiResponse<CommonCodeItem>> {
  const response = await api.post<ApiResponse<CommonCodeItemResponse>>(
    `/api/v1/admin/common-codes/groups/${groupId}/items`,
    buildItemRequestBody(payload)
  );

  if (!response.success) {
    return response as ApiResponse<CommonCodeItem>;
  }

  return {
    ...response,
    data: transformItem(response.data),
  };
}

/**
 * 공통코드 항목 수정
 * API: PUT /api/v1/admin/common-codes/items/{item_id}
 */
export async function updateCommonCodeItem(
  itemId: string,
  payload: CommonCodeItemPayload
): Promise<ApiResponse<CommonCodeItem>> {
  const response = await api.put<ApiResponse<CommonCodeItemResponse>>(
    `/api/v1/admin/common-codes/items/${itemId}`,
    buildItemRequestBody(payload)
  );

  if (!response.success) {
    return response as ApiResponse<CommonCodeItem>;
  }

  return {
    ...response,
    data: transformItem(response.data),
  };
}

/**
 * 공통코드 항목 삭제 (비활성화)
 * API: DELETE /api/v1/admin/common-codes/items/{item_id}
 */
export async function deactivateCommonCodeItem(itemId: string): Promise<ApiResponse<null>> {
  const response = await api.delete<ApiResponse<null>>(
    `/api/v1/admin/common-codes/items/${itemId}`
  );

  return response;
}
