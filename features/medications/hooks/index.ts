import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { medicationsApi, MedicationFilters } from '../api';
import { ChangeMedicationStatusInput, CreateMedicationInput, UpdateMedicationInput } from '../types';

export function useMedications(filters: MedicationFilters = {}) {
  return useQuery({
    queryKey: queryKeys.medications.list(filters),
    queryFn: () => medicationsApi.list(filters),
    placeholderData: keepPreviousData,
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
    queryKey: queryKeys.locations.all,
    queryFn: async () => {
      const response = await medicationsApi.getLocations();
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateMedicationInput) => medicationsApi.create(input),
    onSuccess: (response) => {
      queryClient.setQueryData(queryKeys.medications.detail(response.data.id), response.data);
      queryClient.invalidateQueries({ queryKey: queryKeys.medications.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}

export function useUpdateMedication(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateMedicationInput) => medicationsApi.update(id, input),
    onSuccess: (response) => {
      queryClient.setQueryData(queryKeys.medications.detail(id), response.data);
      queryClient.invalidateQueries({ queryKey: queryKeys.medications.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}

export function useChangeMedicationStatus(medicationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ChangeMedicationStatusInput) => medicationsApi.changeStatus(medicationId, input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.medications.lists() });
      await queryClient.cancelQueries({ queryKey: queryKeys.medications.detail(medicationId) });

      const previousDetail = queryClient.getQueryData(queryKeys.medications.detail(medicationId));
      const previousLists = queryClient.getQueriesData({ queryKey: queryKeys.medications.lists() });

      queryClient.setQueryData(queryKeys.medications.detail(medicationId), (current: any) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          status: input.newStatus,
          updatedAt: new Date().toISOString(),
        };
      });

      previousLists.forEach(([queryKey]) => {
        queryClient.setQueryData(queryKey, (current: any) => {
          if (!current?.data || !Array.isArray(current.data)) {
            return current;
          }

          return {
            ...current,
            data: current.data.map((medication: any) =>
              medication.id === medicationId
                ? {
                    ...medication,
                    status: input.newStatus,
                    updatedAt: new Date().toISOString(),
                  }
                : medication
            ),
          };
        });
      });

      return { previousDetail, previousLists };
    },
    onError: (_error, _input, context) => {
      if (!context) {
        return;
      }

      queryClient.setQueryData(queryKeys.medications.detail(medicationId), context.previousDetail);
      context.previousLists.forEach(([queryKey, previousData]) => {
        queryClient.setQueryData(queryKey, previousData);
      });
    },
    onSuccess: (response) => {
      queryClient.setQueryData(queryKeys.medications.detail(medicationId), response.data);
      queryClient.invalidateQueries({ queryKey: queryKeys.medications.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.medications.statusHistory(medicationId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.outOfStockInsights() });
    },
  });
}
