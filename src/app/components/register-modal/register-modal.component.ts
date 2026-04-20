import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { AuthService } from '../../services/auth.service';
import type { RegisterDTO } from '../../model/auth.model';

@Component({
  selector: 'app-register-modal',
  templateUrl: './register-modal.component.html',
  styleUrls: ['./register-modal.component.scss']
})
export class RegisterModalComponent {
  form: FormGroup;

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  validationMessage = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    public readonly activeModal: NgbActiveModal
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  submit(): void {
    if (this.isSubmitting) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.validationMessage = 'Confira os campos do formulário e tente novamente.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.validationMessage = '';

    const payload = this.form.value as RegisterDTO;

    this.authService.register(payload).subscribe({
      next: () => {
        this.successMessage = 'Email para ativação da conta foi enviado.';
        this.isSubmitting = false;

        window.setTimeout(() => {
          this.activeModal.close('registered');
        }, 2000);
      },
      error: (err: unknown) => {
        this.isSubmitting = false;

        if (err instanceof HttpErrorResponse && err.status === 0) {
          this.errorMessage = 'Falha com servidor. Tente novamente mais tarde.';
          return;
        }

        const message =
          typeof err === 'object' && err && 'message' in err
            ? String((err as { message?: unknown }).message ?? '')
            : '';

        this.errorMessage = message || 'Não foi possível criar sua conta. Tente novamente.';
      }
    });
  }

  close(): void {
    if (this.isSubmitting) {
      return;
    }

    this.activeModal.dismiss('close');
  }
}
