import { api } from '../../../lib/api-client';
import { 
  Medication, 
  CreateMedicationInput, 
  UpdateMedicationInput, 
  ChangeMedicationStatusInput,
  MedicationStatus,
  PaginatedResponse,
  Location,
  StatusHistoryRecord,
  MedicationResponse,
  StatusHistoryResponse,
} from '../types';

export interface MedicationFilters {
  search?: string;
  status?: MedicationStatus;
  locationId?: string;
  page?: number;
  limit?: number;
}

function buildMedicationQuery(filters: MedicationFilters = {}) {
  const params = new URLSearchParams();

  if (filters.search) params.append('search', filters.search);
  if (filters.status) params.append('status', filters.status);
  if (filters.locationId) params.append('locationId', filters.locationId);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));

  const queryString = params.toString();
  return `/api/medications${queryString ? `?${queryString}` : ''}`;
}

export const medicationsApi = {
  list: (filters: MedicationFilters = {}) =>
    api.get<PaginatedResponse<Medication>>(buildMedicationQuery(filters)),
  
  get: (id: string) => 
    api.get<MedicationResponse>(`/api/medications/${id}`),
  
  create: (input: CreateMedicationInput) => 
    api.post<MedicationResponse>('/api/medications', input),
  
  update: (id: string, input: UpdateMedicationInput) => 
    api.put<MedicationResponse>(`/api/medications/${id}`, input),
  
  changeStatus: (id: string, input: ChangeMedicationStatusInput) => 
    api.patch<MedicationResponse>(`/api/medications/${id}/status`, input),
  
  getStatusHistory: (id: string) => 
    api.get<StatusHistoryResponse>(`/api/medications/${id}/status-history`),

  getLocations: () =>
    api.get<{ data: Location[] }>('/api/locations'),
};
