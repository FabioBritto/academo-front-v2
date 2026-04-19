import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type { Page } from '../model/common.model';
import type { CreateSubjectDTO, SubjectDTO, UpdateSubjectDTO } from '../model/subjects.model';
import { API_BASE_URL } from './api.config';
import type { PageRequest } from '../utils/pagination.util';
import { withPageParams } from '../utils/pagination.util';

@Injectable({
  providedIn: 'root'
})
export class SubjectsService {
  constructor(private readonly http: HttpClient) {}

  create(body: CreateSubjectDTO): Observable<SubjectDTO> {
    return this.http.post<SubjectDTO>(`${API_BASE_URL}/subjects`, body);
  }

  listPaged(pageRequest?: PageRequest): Observable<Page<SubjectDTO>> {
    const params = withPageParams(new HttpParams(), pageRequest);
    return this.http.get<Page<SubjectDTO>>(`${API_BASE_URL}/subjects`, { params });
  }

  getById(subjectId: number): Observable<SubjectDTO> {
    return this.http.get<SubjectDTO>(`${API_BASE_URL}/subjects/${subjectId}`);
  }

  update(subjectId: number, body: UpdateSubjectDTO): Observable<SubjectDTO> {
    return this.http.put<SubjectDTO>(`${API_BASE_URL}/subjects/${subjectId}`, body);
  }

  delete(subjectId: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/subjects/${subjectId}`);
  }

  listInGroupPaged(groupId: number, pageRequest?: PageRequest): Observable<Page<SubjectDTO>> {
    const params = withPageParams(new HttpParams(), pageRequest);
    return this.http.get<Page<SubjectDTO>>(`${API_BASE_URL}/subjects/in-group/${groupId}`, { params });
  }
}
