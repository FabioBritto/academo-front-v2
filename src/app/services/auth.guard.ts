import { Injectable } from '@angular/core';
import { CanActivateChild, Router, UrlTree } from '@angular/router';

import { AuthTokenService } from './auth-token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivateChild {
  constructor(
    private readonly tokenService: AuthTokenService,
    private readonly router: Router
  ) {}

  canActivateChild(): boolean | UrlTree {
    const token = this.tokenService.getToken();

    if (!token) {
      return this.router.createUrlTree(['/']);
    }

    return true;
  }
}
