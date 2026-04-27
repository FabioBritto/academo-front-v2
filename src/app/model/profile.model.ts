import type { PlanType } from './auth.model';

export interface UpdateProfileDTO {
  fullName: string;
  birthDate: string;
  gender: string;
}

export interface ProfileDTO {
  fullName: string | null;
  birthDate: string | null;
  gender: string | null;
  planType: PlanType;
  createdAt: string;
  updatedAt: string;
  userUseStorage: number;
}
