import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { usersApi, CreateUserInput, GetUsersFilters, UpdateUserInput } from '../api';

export function useUsers(filters: GetUsersFilters = {}) {
  return useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: () => usersApi.list(filters),
    placeholderData: keepPreviousData,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: async () => {
      const response = await usersApi.get(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useRoles() {
  return useQuery({
    queryKey: queryKeys.roles.all,
    queryFn: async () => {
      const response = await usersApi.getRoles();
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateUserInput) => usersApi.create(input),
    onSuccess: (response) => {
      queryClient.setQueryData(queryKeys.users.detail(response.data.id), response.data);
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateUserInput) => usersApi.update(id, input),
    onSuccess: (response) => {
      queryClient.setQueryData(queryKeys.users.detail(id), response.data);
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
}

export function useActivateUser(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => usersApi.activate(id),
    onSuccess: (response) => {
      queryClient.setQueryData(queryKeys.users.detail(id), response.data);
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
}

export function useDeactivateUser(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => usersApi.deactivate(id),
    onSuccess: (response) => {
      queryClient.setQueryData(queryKeys.users.detail(id), response.data);
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
}
