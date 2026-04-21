export interface CurrentUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  departmentId?: string | null;
  departmentName?: string | null;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: CurrentUser;
}
