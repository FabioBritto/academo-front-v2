import type { ActivityDTO } from './activities.model';

export interface SaveActivityTypeDTO {
  name: string;
  description: string;
  periodId: number;
}

export interface UpdateActivityTypeDTO {
  name: string;
  description: string;
  weight: number;
  periodId: number;
}

export interface ActivityTypeDTO {
  id: number;
  name: string;
  description: string;
  weight: number;
  activities: ActivityDTO[];
  periodId: number;
  createdAt: string;
  updatedAt: string;
}
