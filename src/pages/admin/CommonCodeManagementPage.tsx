/**
 * 공통코드 관리 페이지
 */
import React from 'react';
import CommonCodeGroupList from '@/components/commonCode/CommonCodeGroupList';
import CommonCodeItemTable from '@/components/commonCode/CommonCodeItemTable';
import CommonCodeGroupModal from '@/components/commonCode/CommonCodeGroupModal';
import CommonCodeItemModal from '@/components/commonCode/CommonCodeItemModal';
import {
  DeleteItemDialog,
  DeleteGroupDialog,
} from '@/components/commonCode/CommonCodeDeleteDialogs';
import { useCommonCodeManagement } from '@/hooks/useCommonCodeManagement';

const CommonCodeManagementPage: React.FC = () => {
  const {
    // 데이터
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
  } = useCommonCodeManagement();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">공통코드 관리</h1>
        <p className="text-sm text-gray-600 mt-1">
          시스템에서 사용하는 공통코드 그룹 및 코드 항목을 관리합니다.
        </p>
      </div>

      {/* Split Layout */}
      <div className="flex gap-6 h-[calc(100vh-280px)]">
        {/* Left Panel: Group List */}
        <CommonCodeGroupList
          filteredGroups={filteredGroups}
          selectedGroupId={selectedGroup?.id ?? null}
          searchTerm={searchTerm}
          isLoading={isLoadingGroups}
          onSearchChange={setSearchTerm}
          onSelectGroup={selectGroup}
          onCreateGroup={openGroupModalForCreate}
          onEditGroup={openGroupModalForEdit}
          onDeleteGroup={openDeleteGroupDialog}
        />

        {/* Right Panel: Item Table */}
        <CommonCodeItemTable
          selectedGroup={selectedGroup}
          codeItems={codeItems}
          isLoading={isLoadingItems}
          onCreateItem={openItemModalForCreate}
          onEditItem={openItemModalForEdit}
          onDeactivateItem={openDeleteDialog}
        />
      </div>

      {/* Modals */}
      <CommonCodeGroupModal
        open={groupModalState.open}
        editingGroup={groupModalState.editingGroup}
        isSaving={isSaving}
        onClose={closeGroupModal}
        onSave={saveGroup}
        onDelete={
          groupModalState.editingGroup
            ? () => {
                closeGroupModal();
                openDeleteGroupDialog(groupModalState.editingGroup!.id);
              }
            : undefined
        }
      />

      <CommonCodeItemModal
        open={itemModalState.open}
        editingItem={itemModalState.editingItem}
        groupId={selectedGroup?.id}
        isSaving={isSaving}
        onClose={closeItemModal}
        onSave={saveItem}
      />

      {/* Delete Dialogs */}
      <DeleteItemDialog
        open={deleteDialogState.open}
        targetItem={deleteDialogState.targetItem}
        isDeleting={isSaving}
        onClose={closeDeleteDialog}
        onConfirm={deactivateItem}
      />

      <DeleteGroupDialog
        open={deleteGroupDialogState.open}
        targetGroup={deleteGroupDialogState.targetGroup}
        isDeleting={isSaving}
        onClose={closeDeleteGroupDialog}
        onConfirm={deleteGroup}
      />
    </div>
  );
};

export default CommonCodeManagementPage;
