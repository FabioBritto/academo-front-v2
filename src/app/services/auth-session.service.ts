import { Injectable } from '@angular/core';

import type { UserRole } from '../model/auth.model';

const USER_ROLE_KEY = 'academo.userRole';
const USER_ID_KEY = 'academo.userId';
const USERNAME_KEY = 'academo.username';

@Injectable({
  providedIn: 'root'
})
export class AuthSessionService {
  getUserRole(): UserRole | null {
    const raw = String(localStorage.getItem(USER_ROLE_KEY) ?? '').trim();
    if (!raw) {
      return null;
    }

    const normalized = raw.toUpperCase();

    if (normalized === 'ROLE_FREE' || normalized === 'FREE') {
      return 'ROLE_FREE';
    }

    if (normalized === 'ROLE_PREMIUM' || normalized === 'PREMIUM') {
      return 'ROLE_PREMIUM';
    }

    return null;
  }

  setSession(data: { userRole: UserRole; userId: number; username: string }): void {
    localStorage.setItem(USER_ROLE_KEY, data.userRole);
    localStorage.setItem(USER_ID_KEY, String(data.userId));
    localStorage.setItem(USERNAME_KEY, String(data.username ?? ''));
  }

  clearSession(): void {
    localStorage.removeItem(USER_ROLE_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(USERNAME_KEY);
  }

  isFree(): boolean {
    return this.getUserRole() === 'ROLE_FREE';
  }

  isPremium(): boolean {
    return this.getUserRole() === 'ROLE_PREMIUM';
  }
}
