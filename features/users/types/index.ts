export type RoleName = 'SYSTEM_ADMIN' | 'MEDICATION_MANAGER' | 'VIEWER';

export interface Role {
  id: string;
  name: RoleName;
  description?: string;
}

export interface UserDepartment {
  id: string;
  name: string;
}

export interface UserListItem {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  departmentId?: string | null;
  departmentIds: string[];
  role: Pick<Role, 'name'>;
  department?: UserDepartment | null;
  departments: UserDepartment[];
  createdAt: string;
}

export interface UserDetail extends UserListItem {
  departmentId?: string | null;
  department?: UserDepartment | null;
  departments: UserDepartment[];
  role: Role;
  updatedAt: string;
}

export interface CreateUserInput {
  fullName: string;
  email: string;
  password: string;
  roleId: string;
  departmentId?: string;
  departmentIds?: string[];
}

export interface UpdateUserInput {
  fullName?: string;
  email?: string;
  roleId?: string;
  departmentId?: string | null;
  departmentIds?: string[];
}

export interface GetUsersFilters {
  search?: string;
  role?: RoleName;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface UserListResponse {
  data: UserListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface UserDetailResponse {
  data: UserDetail;
}
