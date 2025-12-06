import React, { useEffect, useRef, useState } from 'react';

export interface MetadataFieldsProps {
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
}

type MetadataRow = {
  id: string;
  key: string;
  value: string;
};

const MetadataFields: React.FC<MetadataFieldsProps> = ({ value, onChange }) => {
  const [rows, setRows] = useState<MetadataRow[]>([]);
  const isInternalUpdate = useRef(false);

  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    const entries = Object.entries(value || {});
    if (entries.length === 0) {
      setRows([]);
      return;
    }
    setRows(entries.map(([key, val], index) => ({ id: `row-${index}`, key, value: val })));
  }, [value]);

  const emitChange = (nextRows: MetadataRow[]) => {
    const metadata: Record<string, string> = {};
    nextRows.forEach((row) => {
      const key = row.key.trim();
      const val = row.value.trim();
      if (key && val) {
        metadata[key] = val;
      }
    });
    isInternalUpdate.current = true;
    onChange(metadata);
  };

  const handleAddRow = () => {
    setRows((prev) => [...prev, { id: `row-${Date.now()}`, key: '', value: '' }]);
  };

  const handleRemoveRow = (id: string) => {
    setRows((prev) => {
      const next = prev.filter((row) => row.id !== id);
      emitChange(next);
      return next;
    });
  };

  const handleChange = (id: string, field: 'key' | 'value', val: string) => {
    setRows((prev) => {
      const next = prev.map((row) => (row.id === id ? { ...row, [field]: val } : row));
      emitChange(next);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row) => (
        <div key={row.id} className="flex items-start gap-2">
          <input
            type="text"
            value={row.key}
            onChange={(e) => handleChange(row.id, 'key', e.target.value)}
            placeholder="키 (예: 고객번호)"
            className="min-h-[36px] w-full rounded border border-gray-400 px-3 text-[14px] text-gray-900 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-200"
          />
          <input
            type="text"
            value={row.value}
            onChange={(e) => handleChange(row.id, 'value', e.target.value)}
            placeholder="값 (예: 1234567890)"
            className="min-h-[36px] w-full rounded border border-gray-400 px-3 text-[14px] text-gray-900 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-200"
          />
          <button
            type="button"
            onClick={() => handleRemoveRow(row.id)}
            className="flex min-h-[36px] w-10 items-center justify-center rounded border border-red-600 text-[14px] font-semibold text-red-600 transition hover:bg-red-50"
            aria-label="메타데이터 행 삭제"
          >
            ✕
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAddRow}
        className="mt-1 inline-flex min-h-[36px] items-center gap-2 rounded-md border border-[#005BAC] px-3 text-[14px] font-semibold text-[#005BAC] transition hover:bg-[#E8F1FB]"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        필드 추가
      </button>
    </div>
  );
};

export default MetadataFields;
