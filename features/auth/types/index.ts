import type { RoleName } from '@/features/users/types';

export interface CurrentUserDepartment {
  id: string;
  name: string;
}

export interface CurrentUser {
  id: string;
  fullName: string;
  email: string;
  role: RoleName;
  isActive: boolean;
  departmentId?: string | null;
  departmentName?: string | null;
  departmentIds: string[];
  departments: CurrentUserDepartment[];
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: CurrentUser;
}
