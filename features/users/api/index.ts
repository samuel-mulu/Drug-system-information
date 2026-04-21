import { api } from '@/lib/api-client';
import {
  CreateUserInput,
  GetUsersFilters,
  Role,
  RoleName,
  UpdateUserInput,
  UserDetailResponse,
  UserListResponse,
} from '../types';

interface RolesResponse {
  data: Role[];
}

function buildUserQuery(filters: GetUsersFilters = {}) {
  const params = new URLSearchParams();

  if (filters.search) params.append('search', filters.search);
  if (filters.role) params.append('role', filters.role);
  if (filters.isActive !== undefined) params.append('isActive', String(filters.isActive));
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));

  const queryString = params.toString();
  return `/api/users${queryString ? `?${queryString}` : ''}`;
}

export const usersApi = {
  list: (filters: GetUsersFilters = {}) =>
    api.get<UserListResponse>(buildUserQuery(filters)),

  get: (id: string) =>
    api.get<UserDetailResponse>(`/api/users/${id}`),

  create: (input: CreateUserInput) =>
    api.post<UserDetailResponse>('/api/users', input),

  update: (id: string, input: UpdateUserInput) =>
    api.put<UserDetailResponse>(`/api/users/${id}`, input),

  activate: (id: string) =>
    api.patch<UserDetailResponse>(`/api/users/${id}/activate`, {}),

  deactivate: (id: string) =>
    api.patch<UserDetailResponse>(`/api/users/${id}/deactivate`, {}),

  getRoles: () =>
    api.get<RolesResponse>('/api/roles'),
};

export type { CreateUserInput, GetUsersFilters, Role, RoleName, UpdateUserInput, UserDetailResponse, UserListResponse };
