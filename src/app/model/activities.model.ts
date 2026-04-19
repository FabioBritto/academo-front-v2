export interface SaveActivityDTO {
  activityDate: string;
  name: string;
  description: string;
  grade: number;
  subjectId: number;
  activityTypeId: number;
}

export interface ActivityDTO {
  id: number;
  activityDate: string;
  name: string;
  grade: number;
  description: string;
  subjectName: string;
  activityTypeName: string;
  createdAt: string;
  updateAt: string;
}
