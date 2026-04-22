import { clsx } from 'clsx';
import { MedicationStatus } from '../types';

const STATUS_STYLES: Record<MedicationStatus, string> = {
  AVAILABLE: 'bg-success/10 text-success',
  OUT_OF_STOCK: 'bg-warning/10 text-warning',
  UNAVAILABLE: 'bg-danger/10 text-danger',
};

export function getMedicationStatusLabel(status: MedicationStatus) {
  const labels: Record<MedicationStatus, string> = {
    AVAILABLE: 'Available',
    OUT_OF_STOCK: 'NEAR STOCK OUT',
    UNAVAILABLE: 'STOCK OUT',
  };

  return labels[status];
}

interface MedicationStatusBadgeProps {
  status: MedicationStatus;
  className?: string;
}

export default function MedicationStatusBadge({
  status,
  className,
}: MedicationStatusBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        STATUS_STYLES[status],
        className
      )}
    >
      {getMedicationStatusLabel(status)}
    </span>
  );
}
