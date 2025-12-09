/**
 * 공통코드 관리 API 레이어
 * - OpenAPI 스펙 기반으로 실제 백엔드 API와 연동
 * - axiosClient를 사용한 REST API 호출
 */

import { api } from '@/lib/api/axiosClient';

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

/**
 * 모든 공통코드 그룹 조회 (페이징)
 * API: GET /api/v1/admin/common-codes/groups
 */
export async function fetchCommonCodeGroups(
  page: number = 1,
  pageSize: number = 100
): Promise<CommonCodeGroup[]> {
  const response = await api.get<CommonCodeGroupListResponse>(
    '/api/v1/admin/common-codes/groups',
    {
      params: { page, page_size: pageSize },
    }
  );
  return response.items.map(transformGroup);
}

/**
 * 공통코드 그룹 생성
 * API: POST /api/v1/admin/common-codes/groups
 */
export async function createCommonCodeGroup(
  payload: CommonCodeGroupPayload
): Promise<CommonCodeGroup> {
  const response = await api.post<CommonCodeGroupResponse>(
    '/api/v1/admin/common-codes/groups',
    {
      group_code: payload.groupCode,
      group_name: payload.groupName,
      description: payload.description,
      is_active: payload.isActive,
    }
  );
  return transformGroup(response);
}

/**
 * 공통코드 그룹 수정
 * API: PUT /api/v1/admin/common-codes/groups/{group_id}
 */
export async function updateCommonCodeGroup(
  groupId: string,
  payload: CommonCodeGroupPayload
): Promise<CommonCodeGroup> {
  const response = await api.put<CommonCodeGroupResponse>(
    `/api/v1/admin/common-codes/groups/${groupId}`,
    {
      group_code: payload.groupCode,
      group_name: payload.groupName,
      description: payload.description,
      is_active: payload.isActive,
    }
  );
  return transformGroup(response);
}

/**
 * 공통코드 그룹 삭제
 * API: DELETE /api/v1/admin/common-codes/groups/{group_id}
 */
export async function deleteCommonCodeGroup(groupId: string): Promise<void> {
  await api.delete(`/api/v1/admin/common-codes/groups/${groupId}`);
}

/**
 * 특정 그룹의 공통코드 항목 조회 (페이징)
 * API: GET /api/v1/admin/common-codes/groups/{group_id}/items
 */
export async function fetchCommonCodeItems(
  groupId: string,
  page: number = 1,
  pageSize: number = 100
): Promise<CommonCodeItem[]> {
  const response = await api.get<CommonCodeItemListResponse>(
    `/api/v1/admin/common-codes/groups/${groupId}/items`,
    {
      params: { page, page_size: pageSize },
    }
  );
  return response.items
    .map(transformItem)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * 공통코드 항목 생성
 * API: POST /api/v1/admin/common-codes/groups/{group_id}/items
 */
export async function createCommonCodeItem(
  groupId: string,
  payload: CommonCodeItemPayload
): Promise<CommonCodeItem> {
  const response = await api.post<CommonCodeItemResponse>(
    `/api/v1/admin/common-codes/groups/${groupId}/items`,
    {
      code_key: payload.codeKey,
      code_value: payload.codeValue,
      sort_order: payload.sortOrder,
      is_active: payload.isActive,
      attributes: payload.attributes,
    }
  );
  return transformItem(response);
}

/**
 * 공통코드 항목 수정
 * API: PUT /api/v1/admin/common-codes/items/{item_id}
 */
export async function updateCommonCodeItem(
  itemId: string,
  payload: CommonCodeItemPayload
): Promise<CommonCodeItem> {
  const response = await api.put<CommonCodeItemResponse>(
    `/api/v1/admin/common-codes/items/${itemId}`,
    {
      code_key: payload.codeKey,
      code_value: payload.codeValue,
      sort_order: payload.sortOrder,
      is_active: payload.isActive,
      attributes: payload.attributes,
    }
  );
  return transformItem(response);
}

/**
 * 공통코드 항목 삭제 (비활성화)
 * API: DELETE /api/v1/admin/common-codes/items/{item_id}
 */
export async function deactivateCommonCodeItem(itemId: string): Promise<void> {
  // 항목을 삭제하는 대신 비활성화하기 위해 PUT 사용
  await api.delete(`/api/v1/admin/common-codes/items/${itemId}`);
}
