import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type { Page } from '../model/common.model';
import type { PeriodDTO, SavePeriodDTO, UpdatePeriodDTO } from '../model/periods.model';
import { API_BASE_URL } from './api.config';
import type { PageRequest } from '../utils/pagination.util';
import { withPageParams } from '../utils/pagination.util';

@Injectable({
  providedIn: 'root'
})
export class PeriodsService {
  constructor(private readonly http: HttpClient) {}

  listAllBySubjectPaged(subjectId: number, pageRequest?: PageRequest): Observable<Page<PeriodDTO>> {
    const params = withPageParams(new HttpParams(), pageRequest);
    return this.http.get<Page<PeriodDTO>>(`${API_BASE_URL}/periods/all/${subjectId}`, { params });
  }

  getBySubjectAndPeriodId(subjectId: number, periodId: number): Observable<PeriodDTO> {
    return this.http.get<PeriodDTO>(`${API_BASE_URL}/periods/${subjectId}/${periodId}`);
  }

  create(body: SavePeriodDTO): Observable<PeriodDTO> {
    return this.http.post<PeriodDTO>(`${API_BASE_URL}/periods`, body);
  }

  update(periodId: number, body: UpdatePeriodDTO): Observable<PeriodDTO> {
    return this.http.put<PeriodDTO>(`${API_BASE_URL}/periods/${periodId}`, body);
  }

  delete(subjectId: number, periodId: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/periods/${subjectId}/${periodId}`);
  }
}
