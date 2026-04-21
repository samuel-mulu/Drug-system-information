import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { medicationsApi, MedicationFilters } from '../api';
import { ChangeMedicationStatusInput, CreateMedicationInput, UpdateMedicationInput } from '../types';

export function useMedications(filters: MedicationFilters = {}) {
  return useQuery({
    queryKey: queryKeys.medications.list(filters),
    queryFn: () => medicationsApi.list(filters),
  });
}

export function useMedication(id: string) {
  return useQuery({
    queryKey: queryKeys.medications.detail(id),
    queryFn: async () => {
      const response = await medicationsApi.get(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useMedicationStatusHistory(id: string) {
  return useQuery({
    queryKey: queryKeys.medications.statusHistory(id),
    queryFn: async () => {
      const response = await medicationsApi.getStatusHistory(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: medicationsApi.getLocations,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateMedicationInput) => medicationsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.medications.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateMedication(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateMedicationInput) => medicationsApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.medications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.medications.detail(id) });
    },
  });
}

export function useChangeMedicationStatus(medicationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ChangeMedicationStatusInput) => medicationsApi.changeStatus(medicationId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.medications.detail(medicationId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.medications.statusHistory(medicationId) });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
