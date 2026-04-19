import type { SubjectDTO } from './subjects.model';

export interface CreateGroupDTO {
  name: string;
  description: string;
}

export interface UpdateGroupDTO {
  name: string;
  description: string;
  isActive: boolean;
}

export interface AssociateSubjectsDTO {
  subjectsIds: number[];
}

export interface GroupDTO {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  subjects: SubjectDTO[];
}
