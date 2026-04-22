export type MedicationStatus = 'AVAILABLE' | 'OUT_OF_STOCK' | 'UNAVAILABLE';

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface Location {
  id: string;
  name: string;
  description?: string;
}

export interface UserInfo {
  id: string;
  fullName: string;
}

export interface MedicationListItem {
  id: string;
  genericName: string;
  strength: string;
  dosageForm: string;
  status: MedicationStatus;
  updatedAt: string;
  location: Pick<Location, 'id' | 'name'>;
}

export interface MedicationDetail extends MedicationListItem {
  locationId: string;
  createdBy: UserInfo;
  updatedBy: UserInfo;
  createdAt: string;
}

export interface MedicationListResponse extends PaginatedResponse<MedicationListItem> {}

export interface MedicationResponse {
  data: MedicationDetail;
}

export interface StatusHistoryResponse {
  data: StatusHistoryRecord[];
}

export interface StatusHistoryRecord {
  id: string;
  medicationId: string;
  oldStatus: MedicationStatus;
  newStatus: MedicationStatus;
  reason?: string;
  changedById: string;
  changedBy: UserInfo;
  changedAt: string;
}

export interface CreateMedicationInput {
  genericName: string;
  strength: string;
  dosageForm: string;
  locationId: string;
  status?: MedicationStatus;
}

export interface UpdateMedicationInput {
  genericName?: string;
  strength?: string;
  dosageForm?: string;
  locationId?: string;
}

export interface ChangeMedicationStatusInput {
  newStatus: MedicationStatus;
  reason: string;
}
