export type UserRole = 'ADMIN' | 'MANAGER' | 'USER';

export interface UserDetail {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRequest {
  fullName?: string;
  email?: string;
  role?: UserRole;
  active?: boolean;
}