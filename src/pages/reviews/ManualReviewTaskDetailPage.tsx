/**
 * 메뉴얼 검토 Task 상세 페이지
 * 기존 메뉴얼과 신규 초안을 비교하여 검토합니다
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchManualReviewDetail } from '@/lib/api/manualReviewTasks';
import { ManualReviewDetail } from '@/types/reviews';
import { useToast } from '@/components/common/Toast';

const ManualReviewTaskDetailPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [detail, setDetail] = useState<ManualReviewDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDetail = async () => {
      if (!taskId) {
        setError('Task ID가 없습니다');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchManualReviewDetail(taskId);
        setDetail(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load task detail';
        setError(errorMessage);
        showToast(`오류: ${errorMessage}`, 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadDetail();
  }, [taskId, showToast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="rounded-lg bg-red-50 p-6">
        <h2 className="text-lg font-bold text-red-900">오류 발생</h2>
        <p className="mt-2 text-red-700">{error || '데이터를 불러올 수 없습니다'}</p>
        <button
          onClick={() => navigate('/reviews/tasks')}
          className="mt-4 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      TODO: '대기중',
      IN_PROGRESS: '검토중',
      DONE: '완료',
      REJECTED: '반려',
    };
    return labels[status] || status;
  };

  return (
    <main className="space-y-6">
      {/* 헤더 */}
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">검토 Task 상세</h1>
          <p className="mt-2 text-sm text-gray-600">Task ID: {detail.task_id}</p>
        </div>
        <button
          onClick={() => navigate('/reviews/tasks')}
          className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
        >
          목록으로 돌아가기
        </button>
      </section>

      {/* 상태 정보 */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">상태</p>
          <p className="mt-2 text-lg font-semibold text-gray-900">
            {getStatusLabel(detail.status)}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">유사도</p>
          <p className="mt-2 text-lg font-semibold text-gray-900">
            {detail.similarity ? (detail.similarity * 100).toFixed(1) : 'N/A'}%
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">생성일</p>
          <p className="mt-2 text-sm text-gray-900">
            {detail.created_at ? new Date(detail.created_at).toLocaleDateString('ko-KR') : 'N/A'}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">검토자</p>
          <p className="mt-2 text-sm text-gray-900">{detail.reviewer || 'N/A'}</p>
        </div>
      </section>

      {/* 메뉴얼 비교 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 기존 메뉴얼 */}
        <section className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-gray-900">기존 메뉴얼</h2>
          {detail.old_manual ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-600">Manual ID</p>
                <p className="mt-1 font-mono text-sm text-blue-600">{detail.old_manual.id}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">주제</p>
                <p className="mt-1 text-gray-900">{detail.old_manual.topic}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">배경</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                  {detail.old_manual.background}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">가이드라인</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                  {detail.old_manual.guideline}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">기존 메뉴얼 없음</p>
          )}
        </section>

        {/* 신규 초안 */}
        <section className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-gray-900">신규 초안</h2>
          {detail.new_manual ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-600">Manual ID</p>
                <p className="mt-1 font-mono text-sm text-blue-600">{detail.new_manual.id}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">주제</p>
                <p className="mt-1 text-gray-900">{detail.new_manual.topic}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">배경</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                  {detail.new_manual.background}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">가이드라인</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                  {detail.new_manual.guideline}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">신규 초안 없음</p>
          )}
        </section>
      </div>

      {/* 변경 사항 요약 */}
      {detail.diff_text && (
        <section className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-gray-900">변경 사항 요약</h2>
          <p className="whitespace-pre-wrap text-sm text-gray-700">{detail.diff_text}</p>
        </section>
      )}

      {/* 검토 의견 */}
      {detail.review_notes && (
        <section className="rounded-lg bg-blue-50 p-6">
          <h2 className="mb-2 text-lg font-bold text-blue-900">검토 의견</h2>
          <p className="text-blue-800">{detail.review_notes}</p>
        </section>
      )}

      {/* 액션 버튼 (상태가 TODO인 경우만 표시) */}
      {detail.status === 'TODO' && (
        <section className="flex gap-4">
          <button
            onClick={() => {
              showToast('승인 기능은 추후 구현됩니다', 'info');
            }}
            className="flex-1 rounded-md bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
          >
            승인
          </button>
          <button
            onClick={() => {
              showToast('반려 기능은 추후 구현됩니다', 'info');
            }}
            className="flex-1 rounded-md bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700"
          >
            반려
          </button>
        </section>
      )}
    </main>
  );
};

export default ManualReviewTaskDetailPage;
