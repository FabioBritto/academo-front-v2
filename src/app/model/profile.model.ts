export interface UpdateProfileDTO {
  fullName: string;
  birthDate: string;
  gender: string;
}

export interface ProfileEntity {
  id: number;
  fullName: string | null;
  birthDate: string | null;
  gender: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileDTO {
  profile: ProfileEntity;
  userUseStorage: number;
}
