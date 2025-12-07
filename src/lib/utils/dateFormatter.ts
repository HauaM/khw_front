/**
 * ISO datetime 문자열을 포맷팅합니다
 * @param dateString - ISO datetime 문자열 (예: "2024-01-15T14:30:00Z")
 * @param withTime - 시간 포함 여부 (default: false)
 * @returns 포맷된 문자열 (예: "2024-01-15" 또는 "2024-01-15 14:30")
 */
export function formatDate(dateString: string, withTime = false): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  if (!withTime) {
    return `${year}-${month}-${day}`;
  }

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}
