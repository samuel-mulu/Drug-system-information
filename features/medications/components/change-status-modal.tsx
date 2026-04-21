import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { getApiErrorMessage } from '../../../lib/api-client';
import { MedicationStatus } from '../types';

interface ChangeStatusModalProps {
  currentStatus: MedicationStatus;
  onSubmit: (newStatus: MedicationStatus, reason: string) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

export default function ChangeStatusModal({ currentStatus, onSubmit, onClose, loading }: ChangeStatusModalProps) {
  const [newStatus, setNewStatus] = useState<MedicationStatus>(currentStatus);
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!reason.trim()) newErrors.reason = 'Reason is required';
    if (newStatus === currentStatus) newErrors.status = 'New status must be different from current status';

    setErrors(newErrors);
    setSubmitError('');
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setSubmitError('');

    try {
      await onSubmit(newStatus, reason.trim());
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Failed to change status'));
    }
  };

  const clearFieldError = (field: string) => {
    setErrors((prev) => ({ ...prev, [field]: '' }));
    setSubmitError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <h2 className="text-lg font-semibold text-slate-900">Change Medication Status</h2>
        </CardHeader>
        <CardContent>
          {submitError && (
            <div className="mb-4 rounded-md bg-danger/10 p-3 text-sm text-danger">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Current Status</label>
                <div className="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700">
                  {currentStatus}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">New Status *</label>
                <select
                  value={newStatus}
                  onChange={(e) => {
                    setNewStatus(e.target.value as MedicationStatus);
                    clearFieldError('status');
                  }}
                  disabled={loading}
                  className={`flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    errors.status ? 'border-danger' : 'border-slate-200'
                  }`}
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                  <option value="UNAVAILABLE">Unavailable</option>
                </select>
                {errors.status && <p className="mt-1 text-xs text-danger">{errors.status}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Reason *</label>
                <Input
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    clearFieldError('reason');
                  }}
                  placeholder="Reason for status change"
                  disabled={loading}
                  error={!!errors.reason}
                />
                {errors.reason && <p className="mt-1 text-xs text-danger">{errors.reason}</p>}
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Changing...' : 'Change Status'}
                </Button>
                <Button variant="secondary" onClick={onClose} disabled={loading}>
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
