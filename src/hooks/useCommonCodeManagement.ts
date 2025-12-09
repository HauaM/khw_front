/**
 * 공통코드 관리 페이지의 상태 관리 훅
 */
import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/hooks/useToast';
import {
  CommonCodeGroup,
  CommonCodeItem,
  CommonCodeGroupPayload,
  CommonCodeItemPayload,
  fetchCommonCodeGroups,
  createCommonCodeGroup,
  updateCommonCodeGroup,
  deleteCommonCodeGroup,
  fetchCommonCodeItemsForAdmin,
  createCommonCodeItem,
  updateCommonCodeItem,
  deactivateCommonCodeItem,
  getErrorMessage,
} from '@/lib/api/commonCodes';

export interface UseCommonCodeManagementResult {
  // 데이터
  groups: CommonCodeGroup[];
  filteredGroups: CommonCodeGroup[];
  selectedGroup: CommonCodeGroup | null;
  codeItems: CommonCodeItem[];

  // 로딩 상태
  isLoadingGroups: boolean;
  isLoadingItems: boolean;
  isSaving: boolean;

  // 검색
  searchTerm: string;
  setSearchTerm: (value: string) => void;

  // 그룹 선택
  selectGroup: (groupId: string) => void;

  // 그룹 모달
  groupModalState: {
    open: boolean;
    editingGroup: CommonCodeGroup | null;
  };
  openGroupModalForCreate: () => void;
  openGroupModalForEdit: (groupId: string) => void;
  closeGroupModal: () => void;

  // 항목 모달
  itemModalState: {
    open: boolean;
    editingItem: CommonCodeItem | null;
  };
  openItemModalForCreate: () => void;
  openItemModalForEdit: (itemId: string) => void;
  closeItemModal: () => void;

  // 항목 삭제 다이얼로그
  deleteDialogState: {
    open: boolean;
    targetItem: CommonCodeItem | null;
  };
  openDeleteDialog: (itemId: string) => void;
  closeDeleteDialog: () => void;

  // 그룹 삭제 다이얼로그
  deleteGroupDialogState: {
    open: boolean;
    targetGroup: CommonCodeGroup | null;
  };
  openDeleteGroupDialog: (groupId: string) => void;
  closeDeleteGroupDialog: () => void;

  // 저장/삭제 작업
  saveGroup: (payload: CommonCodeGroupPayload) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;

  saveItem: (payload: CommonCodeItemPayload) => Promise<void>;
  deactivateItem: (itemId: string) => Promise<void>;
}

export function useCommonCodeManagement(): UseCommonCodeManagementResult {
  const { showToast } = useToast();

  // 데이터 상태
  const [groups, setGroups] = useState<CommonCodeGroup[]>([]);
  const [codeItems, setCodeItems] = useState<CommonCodeItem[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 로딩 상태
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 모달 상태
  const [groupModalState, setGroupModalState] = useState<{
    open: boolean;
    editingGroup: CommonCodeGroup | null;
  }>({
    open: false,
    editingGroup: null,
  });

  const [itemModalState, setItemModalState] = useState<{
    open: boolean;
    editingItem: CommonCodeItem | null;
  }>({
    open: false,
    editingItem: null,
  });

  // 삭제 다이얼로그 상태
  const [deleteDialogState, setDeleteDialogState] = useState<{
    open: boolean;
    targetItem: CommonCodeItem | null;
  }>({
    open: false,
    targetItem: null,
  });

  const [deleteGroupDialogState, setDeleteGroupDialogState] = useState<{
    open: boolean;
    targetGroup: CommonCodeGroup | null;
  }>({
    open: false,
    targetGroup: null,
  });

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) || null;

  // 필터링된 그룹 목록
  const filteredGroups = groups.filter(
    (g) =>
      g.groupCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.groupName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 초기 로드: 그룹 목록 조회
  useEffect(() => {
    loadGroups();
  }, []);

  // 선택 그룹 변경 시 코드 항목 조회
  useEffect(() => {
    if (selectedGroupId) {
      (async () => {
        try {
          setIsLoadingItems(true);
          const items = await fetchCommonCodeItemsForAdmin(selectedGroupId);
          setCodeItems(items);
        } catch (error) {
          console.error('Failed to load code items:', error);
          showToast('코드 항목 조회에 실패했습니다.', 'error');
        } finally {
          setIsLoadingItems(false);
        }
      })();
    }
  }, [selectedGroupId, showToast]);

  const loadGroups = useCallback(async () => {
    try {
      setIsLoadingGroups(true);
      const fetchedGroups = await fetchCommonCodeGroups();
      setGroups(fetchedGroups);
    } catch (error) {
      console.error('Failed to load groups:', error);
      const errorMessage = getErrorMessage(error);
      showToast(`그룹 목록 조회 실패: ${errorMessage}`, 'error');
    } finally {
      setIsLoadingGroups(false);
    }
  }, [showToast]);

  const loadCodeItems = useCallback(
    async (groupId: string) => {
      try {
        setIsLoadingItems(true);
        const items = await fetchCommonCodeItemsForAdmin(groupId);
        setCodeItems(items);
      } catch (error) {
        console.error('Failed to load code items:', error);
        const errorMessage = getErrorMessage(error);
        showToast(`코드 항목 조회 실패: ${errorMessage}`, 'error');
      } finally {
        setIsLoadingItems(false);
      }
    },
    [showToast]
  );

  // 그룹 선택
  const selectGroup = useCallback((groupId: string) => {
    setSelectedGroupId(groupId);
  }, []);

  // 그룹 모달 함수들
  const openGroupModalForCreate = useCallback(() => {
    setGroupModalState({
      open: true,
      editingGroup: null,
    });
  }, []);

  const openGroupModalForEdit = useCallback((groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (group) {
      setGroupModalState({
        open: true,
        editingGroup: group,
      });
    }
  }, [groups]);

  const closeGroupModal = useCallback(() => {
    setGroupModalState({
      open: false,
      editingGroup: null,
    });
  }, []);

  // 항목 모달 함수들
  const openItemModalForCreate = useCallback(() => {
    setItemModalState({
      open: true,
      editingItem: null,
    });
  }, []);

  const openItemModalForEdit = useCallback(
    (itemId: string) => {
      const item = codeItems.find((i) => i.id === itemId);
      if (item) {
        setItemModalState({
          open: true,
          editingItem: item,
        });
      }
    },
    [codeItems]
  );

  const closeItemModal = useCallback(() => {
    setItemModalState({
      open: false,
      editingItem: null,
    });
  }, []);

  // 삭제 다이얼로그 함수들
  const openDeleteDialog = useCallback((itemId: string) => {
    const item = codeItems.find((i) => i.id === itemId);
    if (item) {
      setDeleteDialogState({
        open: true,
        targetItem: item,
      });
    }
  }, [codeItems]);

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialogState({
      open: false,
      targetItem: null,
    });
  }, []);

  const openDeleteGroupDialog = useCallback((groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (group) {
      setDeleteGroupDialogState({
        open: true,
        targetGroup: group,
      });
    }
  }, [groups]);

  const closeDeleteGroupDialog = useCallback(() => {
    setDeleteGroupDialogState({
      open: false,
      targetGroup: null,
    });
  }, []);

  // 그룹 저장 (생성 또는 수정)
  const saveGroup = useCallback(
    async (payload: CommonCodeGroupPayload) => {
      try {
        setIsSaving(true);
        if (groupModalState.editingGroup) {
          // 수정
          await updateCommonCodeGroup(groupModalState.editingGroup.id, payload);
          showToast('그룹이 수정되었습니다.', 'success');
        } else {
          // 생성
          await createCommonCodeGroup(payload);
          showToast('그룹이 추가되었습니다.', 'success');
        }
        await loadGroups();
        closeGroupModal();
      } catch (error) {
        console.error('Failed to save group:', error);
        const errorMessage = getErrorMessage(error);
        showToast(`그룹 저장 실패: ${errorMessage}`, 'error');
      } finally {
        setIsSaving(false);
      }
    },
    [groupModalState.editingGroup, loadGroups, closeGroupModal, showToast]
  );

  // 그룹 삭제
  const deleteGroup = useCallback(
    async (groupId: string) => {
      try {
        setIsSaving(true);
        await deleteCommonCodeGroup(groupId);
        showToast('그룹이 삭제되었습니다.', 'success');
        if (selectedGroupId === groupId) {
          setSelectedGroupId(null);
          setCodeItems([]);
        }
        await loadGroups();
        closeDeleteGroupDialog();
      } catch (error) {
        console.error('Failed to delete group:', error);
        const errorMessage = getErrorMessage(error);
        showToast(`그룹 삭제 실패: ${errorMessage}`, 'error');
      } finally {
        setIsSaving(false);
      }
    },
    [selectedGroupId, loadGroups, closeDeleteGroupDialog, showToast]
  );

  // 항목 저장 (생성 또는 수정)
  const saveItem = useCallback(
    async (payload: CommonCodeItemPayload) => {
      try {
        setIsSaving(true);
        if (itemModalState.editingItem) {
          // 수정
          await updateCommonCodeItem(itemModalState.editingItem.id, payload);
          showToast('코드가 수정되었습니다.', 'success');
        } else {
          // 생성
          if (!selectedGroupId) {
            showToast('그룹이 선택되지 않았습니다.', 'error');
            return;
          }
          await createCommonCodeItem(selectedGroupId, payload);
          showToast('코드가 추가되었습니다.', 'success');
        }
        if (selectedGroupId) {
          await loadCodeItems(selectedGroupId);
        }
        closeItemModal();
      } catch (error) {
        console.error('Failed to save item:', error);
        const errorMessage = getErrorMessage(error);
        showToast(`코드 저장 실패: ${errorMessage}`, 'error');
      } finally {
        setIsSaving(false);
      }
    },
    [itemModalState.editingItem, selectedGroupId, loadCodeItems, closeItemModal, showToast]
  );

  // 항목 비활성화
  const deactivateItem = useCallback(
    async (itemId: string) => {
      try {
        setIsSaving(true);
        await deactivateCommonCodeItem(itemId);
        showToast('코드가 비활성화되었습니다.', 'success');
        if (selectedGroupId) {
          await loadCodeItems(selectedGroupId);
        }
        closeDeleteDialog();
      } catch (error) {
        console.error('Failed to deactivate item:', error);
        const errorMessage = getErrorMessage(error);
        showToast(`코드 비활성화 실패: ${errorMessage}`, 'error');
      } finally {
        setIsSaving(false);
      }
    },
    [selectedGroupId, loadCodeItems, closeDeleteDialog, showToast]
  );

  return {
    // 데이터
    groups,
    filteredGroups,
    selectedGroup,
    codeItems,

    // 로딩 상태
    isLoadingGroups,
    isLoadingItems,
    isSaving,

    // 검색
    searchTerm,
    setSearchTerm,

    // 그룹 선택
    selectGroup,

    // 그룹 모달
    groupModalState,
    openGroupModalForCreate,
    openGroupModalForEdit,
    closeGroupModal,

    // 항목 모달
    itemModalState,
    openItemModalForCreate,
    openItemModalForEdit,
    closeItemModal,

    // 삭제 다이얼로그
    deleteDialogState,
    openDeleteDialog,
    closeDeleteDialog,

    deleteGroupDialogState,
    openDeleteGroupDialog,
    closeDeleteGroupDialog,

    // 작업
    saveGroup,
    deleteGroup,
    saveItem,
    deactivateItem,
  };
}
