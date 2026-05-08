import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ConfirmActionModalComponent } from '../components/confirm-action-modal/confirm-action-modal.component';
import { AuthService } from './auth.service';

@Injectable()
export class UnauthorizedInterceptor implements HttpInterceptor {
  private readonly publicPaths = [
    '/auth/login',
    '/auth/register',
    '/auth/activate',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/payment/receive'
  ];

  private isHandling401 = false;

  constructor(
    private readonly modalService: NgbModal,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly zone: NgZone
  ) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((err: unknown) => {
        if (err instanceof HttpErrorResponse && err.status === 401 && !this.isPublicRequest(req.url)) {
          this.handleUnauthorized();
        }

        return throwError(() => err);
      })
    );
  }

  private handleUnauthorized(): void {
    this.zone.run(() => {
      if (this.isHandling401) {
        return;
      }

      this.isHandling401 = true;

      const modalRef = this.modalService.open(ConfirmActionModalComponent, {
        centered: true
      });

      modalRef.componentInstance.title = 'Sessão expirada';
      modalRef.componentInstance.message = 'Sua sessão expirou. Você será redirecionado para a página inicial.';
      modalRef.componentInstance.confirmLabel = 'OK';
      modalRef.componentInstance.showCancel = false;

      const finalize = async (): Promise<void> => {
        this.authService.logout();
        await this.router.navigate(['/'], { replaceUrl: true });
        this.isHandling401 = false;
      };

      const timerId = setTimeout(() => {
        try {
          modalRef.close(true);
        } catch {
          void finalize();
        }
      }, 2500);

      modalRef.closed.subscribe(() => {
        clearTimeout(timerId);
        void finalize();
      });

      modalRef.dismissed.subscribe(() => {
        clearTimeout(timerId);
        void finalize();
      });
    });
  }

  private isPublicRequest(url: string): boolean {
    return this.publicPaths.some((path) => url.includes(path));
  }
}
