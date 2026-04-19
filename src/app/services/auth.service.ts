import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

import type {
  ForgotPasswordDTO,
  LoginResponseDTO,
  RegisterDTO,
  ResetPasswordDTO,
  UserAuthDTO,
  UserDTO
} from '../model/auth.model';
import { API_BASE_URL } from './api.config';
import { AuthTokenService } from './auth-token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private readonly http: HttpClient,
    private readonly tokenService: AuthTokenService
  ) {}

  login(body: UserAuthDTO): Observable<LoginResponseDTO> {
    return this.http
      .post<LoginResponseDTO>(`${API_BASE_URL}/auth/login`, body)
      .pipe(tap((res) => this.tokenService.setToken(res.token)));
  }

  register(body: RegisterDTO): Observable<void> {
    return this.http.post<void>(`${API_BASE_URL}/auth/register`, body);
  }

  activate(token: string): Observable<UserDTO> {
    const params = new HttpParams().set('token', token);
    return this.http.post<UserDTO>(`${API_BASE_URL}/auth/activate`, null, { params });
  }

  forgotPassword(body: ForgotPasswordDTO): Observable<void> {
    return this.http.post<void>(`${API_BASE_URL}/auth/forgot-password`, body);
  }

  resetPassword(token: string, body: ResetPasswordDTO): Observable<void> {
    const params = new HttpParams().set('token', token);
    return this.http.post<void>(`${API_BASE_URL}/auth/reset-password`, body, { params });
  }

  logout(): void {
    this.tokenService.clearToken();
  }
}
