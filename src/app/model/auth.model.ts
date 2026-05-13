export type PlanType = 'MONTHLY_RECURRENT' | 'YEARLY_RECURRENT' | 'FREE';
export type UserRole = 'ROLE_FREE' | 'ROLE_PREMIUM';

export interface UserAuthDTO {
  email: string;
  password: string;
}

export interface LoginResponseDTO {
  token: string;
  userId: number;
  username: string;
  userRole?: UserRole;
  role?: UserRole;
}

export interface RegisterDTO {
  name: string;
  password: string;
  email: string;
}

export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  newPassword: string;
  confirmNewPassword: string;
}

export interface UserDTO {
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  planType: PlanType;
  storageUsage: number;
}
