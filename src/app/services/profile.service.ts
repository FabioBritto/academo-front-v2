import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type { ProfileDTO, UpdateProfileDTO } from '../model/profile.model';
import { API_BASE_URL } from './api.config';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor(private readonly http: HttpClient) {}

  getProfile(): Observable<ProfileDTO> {
    return this.http.get<ProfileDTO>(`${API_BASE_URL}/profile`);
  }

  updateProfile(body: UpdateProfileDTO): Observable<ProfileDTO> {
    return this.http.put<ProfileDTO>(`${API_BASE_URL}/profile`, body);
  }
}
