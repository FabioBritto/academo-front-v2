import { HttpParams } from '@angular/common/http';

export interface PageRequest {
  page?: number;
  size?: number;
  sort?: string[];
}

export function withPageParams(params: HttpParams = new HttpParams(), pageRequest?: PageRequest): HttpParams {
  if (!pageRequest) return params;

  let next = params;

  if (pageRequest.page !== undefined) {
    next = next.set('page', String(pageRequest.page));
  }

  if (pageRequest.size !== undefined) {
    next = next.set('size', String(pageRequest.size));
  }

  if (pageRequest.sort?.length) {
    pageRequest.sort.forEach((s) => {
      next = next.append('sort', s);
    });
  }

  return next;
}
