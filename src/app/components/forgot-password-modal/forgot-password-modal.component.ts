import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import type { ForgotPasswordDTO } from '../../model/auth.model';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { getHttpErrorMessage } from '../../utils/http-error.util';

@Component({
  selector: 'app-forgot-password-modal',
  templateUrl: './forgot-password-modal.component.html',
  styleUrls: ['./forgot-password-modal.component.scss']
})
export class ForgotPasswordModalComponent {
  form: FormGroup;

  isSubmitting = false;
  validationMessage = '';
  errorMessage = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly toastService: ToastService,
    public readonly activeModal: NgbActiveModal
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
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
    this.validationMessage = '';
    this.errorMessage = '';

    const payload = this.form.value as ForgotPasswordDTO;

    this.authService.forgotPassword(payload).subscribe({
      next: () => {
        this.isSubmitting = false;

        this.toastService.show('Email de recuperação de senha foi enviado.', {
          classname: 'bg-success text-light',
          delay: 3000
        });

        window.setTimeout(() => {
          this.activeModal.close('sent');
        }, 2000);
      },
      error: (err: unknown) => {
        this.isSubmitting = false;

        this.errorMessage = getHttpErrorMessage(err, {
          fallback: 'Não foi possível enviar o email de recuperação.'
        });
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
