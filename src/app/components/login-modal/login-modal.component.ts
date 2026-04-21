import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import type { UserAuthDTO } from '../../model/auth.model';
import { AuthService } from '../../services/auth.service';
import { getHttpErrorMessage } from '../../utils/http-error.util';
import { ForgotPasswordModalComponent } from '../forgot-password-modal/forgot-password-modal.component';

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss']
})
export class LoginModalComponent {
  form: FormGroup;

  isSubmitting = false;
  validationMessage = '';
  errorMessage = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly modalService: NgbModal,
    public readonly activeModal: NgbActiveModal
  ) {
    this.form = this.fb.group({
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
    this.validationMessage = '';
    this.errorMessage = '';

    const payload = this.form.value as UserAuthDTO;

    this.authService.login(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        console.log('Login realizado com sucesso');
        this.activeModal.close('logged');
      },
      error: (err: unknown) => {
        this.isSubmitting = false;

        this.errorMessage = getHttpErrorMessage(err, {
          fallback: 'Não foi possível fazer login. Verifique seus dados.'
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

  openForgotPasswordModal(): void {
    this.modalService.open(ForgotPasswordModalComponent, {
      centered: true,
      windowClass: 'forgot-password-modal'
    });
  }
}
