import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { Subscription } from 'rxjs';

import type { ResetPasswordDTO } from '../../model/auth.model';
import { AuthService } from '../../services/auth.service';
import { getHttpErrorMessage } from '../../utils/http-error.util';

type ResetPasswordStatus = 'ready' | 'success' | 'error';

const matchPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const group = control as FormGroup;
  const password = String(group.get('newPassword')?.value ?? '');
  const confirmPassword = String(group.get('confirmNewPassword')?.value ?? '');

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-reset-password-page',
  templateUrl: './reset-password-page.component.html',
  styleUrls: ['./reset-password-page.component.scss']
})
export class ResetPasswordPageComponent implements OnInit, OnDestroy {
  form: FormGroup;

  isSubmitting = false;

  status: ResetPasswordStatus = 'ready';
  message = '';

  private token = '';
  private subscription?: Subscription;
  private redirectTimeoutId?: number;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.form = this.fb.group(
      {
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmNewPassword: ['', [Validators.required, Validators.minLength(8)]]
      },
      {
        validators: [matchPasswordValidator]
      }
    );
  }

  ngOnInit(): void {
    this.token = String(this.route.snapshot.queryParamMap.get('token') ?? '').trim();

    if (!this.token) {
      this.status = 'error';
      this.message = 'Token de redefinição inválido.';
    }
  }

  get isTokenValid(): boolean {
    return this.token.length > 0;
  }

  get passwordMismatch(): boolean {
    return Boolean(this.form.errors && this.form.errors['passwordMismatch']);
  }

  submit(): void {
    if (!this.isTokenValid) {
      return;
    }

    if (this.isSubmitting) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.status = 'error';
      this.message = 'Confira os campos do formulário e tente novamente.';
      return;
    }

    this.isSubmitting = true;
    this.status = 'ready';
    this.message = '';

    const payload = this.form.value as ResetPasswordDTO;

    this.subscription = this.authService.resetPassword(this.token, payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.status = 'success';
        this.message = 'Senha redefinida com sucesso. Você será redirecionado em instantes.';

        this.redirectTimeoutId = window.setTimeout(() => {
          void this.router.navigate(['/']);
        }, 4000);
      },
      error: (err: unknown) => {
        this.isSubmitting = false;
        this.status = 'error';
        this.message = getHttpErrorMessage(err, {
          fallback: 'Não foi possível redefinir sua senha.'
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
