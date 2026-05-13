import type { ActivityTypeDTO } from './activity-types.model';

export interface SavePeriodDTO {
  subjectId: number;
  name: string;
  grade: number;
  weight: number;
}

export interface CreateExamDTO {
  subjectId: number;
}

export interface UpdatePeriodDTO {
  subjectId: number;
  name: string;
  grade: number;
  weight: number;
}

export interface PeriodDTO {
  id: number;
  subjectId: number;
  name: string;
  grade: number;
  weight: number;
  activityTypeList: ActivityTypeDTO[];
}

export interface UpdatePeriodsWeight {
  firstPeriodWeight: number;
  secondPeriodWeight: number;
}
