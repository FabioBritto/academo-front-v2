import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { getHttpErrorMessage } from '../../utils/http-error.util';

type ActivationStatus = 'loading' | 'success' | 'error';

@Component({
  selector: 'app-activate-account-page',
  templateUrl: './activate-account-page.component.html',
  styleUrls: ['./activate-account-page.component.scss']
})
export class ActivateAccountPageComponent implements OnInit, OnDestroy {
  status: ActivationStatus = 'loading';
  message = 'Estamos ativando sua conta...';

  private subscription?: Subscription;
  private redirectTimeoutId?: number;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const token = String(this.route.snapshot.queryParamMap.get('token') ?? '').trim();

    if (!token) {
      this.status = 'error';
      this.message = 'Token de ativação inválido.';
      return;
    }

    this.subscription = this.authService.activate(token).subscribe({
      next: () => {
        this.status = 'success';
        this.message = 'Conta ativada com sucesso. Você será redirecionado em instantes.';

        this.redirectTimeoutId = window.setTimeout(() => {
          void this.router.navigate(['/']);
        }, 8000);
      },
      error: (err: unknown) => {
        this.status = 'error';
        this.message = getHttpErrorMessage(err, {
          fallback: 'Não foi possível ativar sua conta.'
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();

    if (this.redirectTimeoutId) {
      window.clearTimeout(this.redirectTimeoutId);
    }
  }
}
