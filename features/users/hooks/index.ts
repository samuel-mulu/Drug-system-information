import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { usersApi, CreateUserInput, GetUsersFilters, UpdateUserInput } from '../api';

export function useUsers(filters: GetUsersFilters = {}) {
  return useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: () => usersApi.list(filters),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => usersApi.get(id),
    enabled: !!id,
  });
}

export function useRoles() {
  return useQuery({
    queryKey: queryKeys.roles.all,
    queryFn: usersApi.getRoles,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateUserInput) => usersApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateUserInput) => usersApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
    },
  });
}

export function useActivateUser(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => usersApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
    },
  });
}

export function useDeactivateUser(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => usersApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
    },
  });
}
