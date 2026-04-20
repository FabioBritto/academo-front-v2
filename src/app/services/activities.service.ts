import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type { Page } from '../model/common.model';
import type { ActivityDTO, SaveActivityDTO } from '../model/activities.model';
import { API_BASE_URL } from './api.config';
import type { PageRequest } from '../utils/pagination.util';
import { withPageParams } from '../utils/pagination.util';

@Injectable({
  providedIn: 'root'
})
export class ActivitiesService {
  constructor(private readonly http: HttpClient) {}

  listPaged(pageRequest?: PageRequest): Observable<Page<ActivityDTO>> {
    const params = withPageParams(new HttpParams(), pageRequest);
    return this.http.get<Page<ActivityDTO>>(`${API_BASE_URL}/activities`, { params });
  }

  getById(activityId: number): Observable<ActivityDTO> {
    return this.http.get<ActivityDTO>(`${API_BASE_URL}/activities/${activityId}`);
  }

  listBySubjectPaged(subjectId: number, pageRequest?: PageRequest): Observable<Page<ActivityDTO>> {
    const params = withPageParams(new HttpParams(), pageRequest);
    return this.http.get<Page<ActivityDTO>>(`${API_BASE_URL}/activities/by-subject/${subjectId}`, { params });
  }

  create(body: SaveActivityDTO): Observable<ActivityDTO> {
    return this.http.post<ActivityDTO>(`${API_BASE_URL}/activities`, body);
  }

  update(activityId: number, body: SaveActivityDTO): Observable<ActivityDTO> {
    return this.http.put<ActivityDTO>(`${API_BASE_URL}/activities/${activityId}`, body);
  }

  delete(activityId: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/activities/${activityId}`);
  }
}
