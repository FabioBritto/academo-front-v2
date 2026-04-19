import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type { Page } from '../model/common.model';
import type { AssociateSubjectsDTO, CreateGroupDTO, GroupDTO, UpdateGroupDTO } from '../model/groups.model';
import { API_BASE_URL } from './api.config';
import type { PageRequest } from '../utils/pagination.util';
import { withPageParams } from '../utils/pagination.util';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {
  constructor(private readonly http: HttpClient) {}

  listPaged(pageRequest?: PageRequest): Observable<Page<GroupDTO>> {
    const params = withPageParams(new HttpParams(), pageRequest);
    return this.http.get<Page<GroupDTO>>(`${API_BASE_URL}/groups`, { params });
  }

  getById(groupId: number): Observable<GroupDTO> {
    return this.http.get<GroupDTO>(`${API_BASE_URL}/groups/${groupId}`);
  }

  create(body: CreateGroupDTO): Observable<GroupDTO> {
    return this.http.post<GroupDTO>(`${API_BASE_URL}/groups`, body);
  }

  update(groupId: number, body: UpdateGroupDTO): Observable<GroupDTO> {
    return this.http.put<GroupDTO>(`${API_BASE_URL}/groups/${groupId}`, body);
  }

  delete(groupId: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/groups/${groupId}`);
  }

  addSubject(groupId: number, subjectId: number): Observable<GroupDTO> {
    return this.http.post<GroupDTO>(`${API_BASE_URL}/groups/add-subject/${groupId}/${subjectId}`, null);
  }

  deleteSubject(groupId: number, subjectId: number): Observable<GroupDTO> {
    return this.http.delete<GroupDTO>(`${API_BASE_URL}/groups/delete-subject/${groupId}/${subjectId}`);
  }

  associateSubjects(groupId: number, body: AssociateSubjectsDTO): Observable<GroupDTO> {
    return this.http.put<GroupDTO>(`${API_BASE_URL}/groups/associate-subjects/${groupId}`, body);
  }
}
