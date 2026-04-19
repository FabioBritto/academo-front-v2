import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthTokenService } from './auth-token.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly publicPaths = [
    '/auth/login',
    '/auth/register',
    '/auth/activate',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/payment/receive',
    '/files/download'
  ];

  constructor(private readonly tokenService: AuthTokenService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (this.isPublicRequest(req.url)) {
      return next.handle(req);
    }

    const token = this.tokenService.getToken();
    if (!token) {
      return next.handle(req);
    }

    return next.handle(
      req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    );
  }

  private isPublicRequest(url: string): boolean {
    return this.publicPaths.some((path) => url.includes(path));
  }
}
