export interface FileDTO {
  uuid: string;
  fileName: string;
  path: string;
  fileType: string;
  size: number;
  subjectId: number;
  createdAt: string;
}

export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/csv',
  'text/plain'
] as const;

export const ALLOWED_FILE_TYPES_SET: ReadonlySet<string> = new Set(ALLOWED_FILE_TYPES);
