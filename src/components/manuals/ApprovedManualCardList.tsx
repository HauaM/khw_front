import React from 'react';
import type { ManualCardItem } from '@/types/manuals';
import ApprovedManualCard from '@/components/manuals/ApprovedManualCard';

interface ApprovedManualCardListProps {
  manuals: ManualCardItem[];
  highlightedManualId: string | null;
  onViewConsultation: (consultationId: string) => void;
  cardRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
}

const ApprovedManualCardList: React.FC<ApprovedManualCardListProps> = ({
  manuals,
  highlightedManualId,
  onViewConsultation,
  cardRefs,
}) => {
  return (
    <div className="flex flex-col gap-4 overflow-auto">
      {manuals.map((manual) => (
        <div
          key={manual.id}
          ref={(element) => {
            if (element) {
              cardRefs.current[manual.id] = element;
            } else {
              delete cardRefs.current[manual.id];
            }
          }}
        >
          <ApprovedManualCard
            manual={manual}
            isHighlighted={highlightedManualId === manual.id}
            onViewConsultation={() => onViewConsultation(manual.source_consultation_id)}
          />
        </div>
      ))}
    </div>
  );
};

export default ApprovedManualCardList;
