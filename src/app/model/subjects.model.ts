export type CalculationType = 'MEDIA_ARITMETICA' | 'MEDIA_PONDERADA';

export interface CreateSubjectDTO {
  name: string;
  description: string;
}

export interface UpdateSubjectDTO {
  name: string;
  description: string;
  passingGrade: number;
  calculationType: CalculationType;
  isActive: boolean;
}

export interface SubjectDTO {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  calculationType: CalculationType;
  passingGrade: number;
  finalGrade: number;
  createdAt: string;
  updatedAt: string;
}
