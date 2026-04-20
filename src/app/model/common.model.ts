export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ExceptionDTO {
  message: string;
}

export interface ValidationErrors {
  errors: Record<string, string>;
}
