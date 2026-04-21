import { api } from '../../../lib/api-client';
import { CurrentUser, LoginInput, LoginResponse } from '../types';

export type { CurrentUser, LoginInput, LoginResponse };

export const authApi = {
  login: (input: LoginInput) => 
    api.post<LoginResponse>('/api/auth/login', input),
  
  me: () => 
    api.get<CurrentUser>('/api/auth/me'),

  logout: () =>
    api.post<{ success: boolean }>('/api/auth/logout', {}),
};
