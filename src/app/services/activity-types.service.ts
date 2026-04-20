import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type { Page } from '../model/common.model';
import type { ActivityTypeDTO, SaveActivityTypeDTO, UpdateActivityTypeDTO } from '../model/activity-types.model';
import { API_BASE_URL } from './api.config';
import type { PageRequest } from '../utils/pagination.util';
import { withPageParams } from '../utils/pagination.util';

@Injectable({
  providedIn: 'root'
})
export class ActivityTypesService {
  constructor(private readonly http: HttpClient) {}

  listAllByPeriodPaged(periodId: number, pageRequest?: PageRequest): Observable<Page<ActivityTypeDTO>> {
    const params = withPageParams(new HttpParams(), pageRequest);
    return this.http.get<Page<ActivityTypeDTO>>(`${API_BASE_URL}/activity-types/all/${periodId}`, { params });
  }

  getById(id: number): Observable<ActivityTypeDTO> {
    return this.http.get<ActivityTypeDTO>(`${API_BASE_URL}/activity-types/${id}`);
  }

  create(body: SaveActivityTypeDTO): Observable<ActivityTypeDTO> {
    return this.http.post<ActivityTypeDTO>(`${API_BASE_URL}/activity-types`, body);
  }

  update(id: number, body: UpdateActivityTypeDTO): Observable<ActivityTypeDTO> {
    return this.http.put<ActivityTypeDTO>(`${API_BASE_URL}/activity-types/${id}`, body);
  }

  delete(activityTypeId: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/activity-types/${activityTypeId}`);
  }
}
