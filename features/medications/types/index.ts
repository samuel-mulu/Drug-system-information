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
  email: string;
}

export interface Medication {
  id: string;
  code: string;
  genericName: string;
  brandName: string;
  strength: string;
  dosageForm: string;
  category: string;
  manufacturer: string;
  description?: string;
  status: MedicationStatus;
  locationId: string;
  location: Location;
  createdById: string;
  createdBy: UserInfo;
  updatedById: string;
  updatedBy: UserInfo;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationListResponse extends PaginatedResponse<Medication> {}

export interface MedicationResponse {
  data: Medication;
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
  code: string;
  genericName: string;
  brandName: string;
  strength: string;
  dosageForm: string;
  category: string;
  manufacturer: string;
  description?: string;
  locationId: string;
  status?: MedicationStatus;
}

export interface UpdateMedicationInput {
  code?: string;
  genericName?: string;
  brandName?: string;
  strength?: string;
  dosageForm?: string;
  category?: string;
  manufacturer?: string;
  description?: string;
  locationId?: string;
}

export interface ChangeMedicationStatusInput {
  newStatus: MedicationStatus;
  reason: string;
}
