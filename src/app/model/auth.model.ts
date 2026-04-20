export interface UserAuthDTO {
  email: string;
  password: string;
}

export interface LoginResponseDTO {
  token: string;
  userId: number;
  username: string;
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
  storageUsage: number;
}
