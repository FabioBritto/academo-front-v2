import type { PlanType } from './auth.model';

export type GenderType = 'M' | 'F';

export interface UpdateProfileDTO {
  fullName: string;
  birthDate: string;
  gender: GenderType | null;
}

export interface ProfileDTO {
  fullName: string | null;
  birthDate: string | null;
  gender: GenderType | null;
  planType: PlanType;
  createdAt: string;
  updatedAt: string;
  userUseStorage: number;
}
