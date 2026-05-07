import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ProfileDTO, UpdateProfileDTO } from '../../model/profile.model';
import { ProfileService } from '../../services/profile.service';
import { toPtBrFromIsoDate } from '../../utils/date.util';
import { getHttpErrorMessage } from '../../utils/http-error.util';

@Component({
  selector: 'app-profile-form',
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.scss']
})
export class ProfileFormComponent implements OnChanges {
  @Input() profile: ProfileDTO | null = null;

  @Output() saved = new EventEmitter<ProfileDTO>();

  form: FormGroup;

  isSubmitting = false;
  validationMessage = '';
  errorMessage = '';

  readonly maxTextLen = 255;

  constructor(
    private readonly fb: FormBuilder,
    private readonly profileService: ProfileService
  ) {
    this.form = this.fb.group({
      fullName: ['', [Validators.maxLength(255)]],
      birthDate: [''],
      gender: ['']
    });
  }

  get fullNameLength(): number {
    return String(this.form.get('fullName')?.value ?? '').length;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('profile' in changes) {
      const profile = this.profile;

      if (profile) {
        const birthDatePtBr = profile.birthDate ? toPtBrFromIsoDate(profile.birthDate) : '';
        this.form.patchValue({
          fullName: profile.fullName ?? '',
          birthDate: birthDatePtBr,
          gender: profile.gender ?? ''
        });

        this.form.get('birthDate')?.setValue(birthDatePtBr, { emitEvent: false });
      } else {
        this.form.reset({
          fullName: '',
          birthDate: '',
          gender: ''
        });

        this.form.get('birthDate')?.setValue('', { emitEvent: false });
      }

      this.validationMessage = '';
      this.errorMessage = '';
    }
  }

  onBirthDateBlur(): void {
    const control = this.form.get('birthDate');
    if (!control) {
      return;
    }

    control.markAsTouched();

    const value = control.value;
    if (value == null || String(value).trim() === '') {
      const errors = { ...(control.errors ?? {}) };
      delete errors['invalidDate'];
      control.setErrors(Object.keys(errors).length ? errors : null);
      return;
    }

    const isValid = this.parseBrToIsoDate(value) != null;
    const errors = { ...(control.errors ?? {}) };
    if (!isValid) {
      errors['invalidDate'] = true;
    } else {
      delete errors['invalidDate'];
    }

    control.setErrors(Object.keys(errors).length ? errors : null);
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
    this.form.disable({ emitEvent: false });
    this.validationMessage = '';
    this.errorMessage = '';

    const birthDatePtBr = String(this.form.value['birthDate'] ?? '').trim();
    const birthDateIso = birthDatePtBr ? (this.parseBrToIsoDate(birthDatePtBr) ?? '') : '';

    if (birthDatePtBr && !birthDateIso) {
      this.isSubmitting = false;
      this.form.enable({ emitEvent: false });
      this.form.get('birthDate')?.setErrors({ ...(this.form.get('birthDate')?.errors ?? {}), invalidDate: true });
      this.form.get('birthDate')?.markAsTouched();
      this.validationMessage = 'Confira os campos do formulário e tente novamente.';
      return;
    }

    const fullName = String(this.form.value['fullName'] ?? '').trim();
    const payload: UpdateProfileDTO = {
      fullName: fullName,
      birthDate: birthDateIso,
      gender: this.form.value['gender'] || null
    };

    this.profileService.updateProfile(payload).subscribe({
      next: (updated) => {
        this.isSubmitting = false;
        this.form.enable({ emitEvent: false });
        this.saved.emit(updated);
      },
      error: (err: unknown) => {
        this.isSubmitting = false;
        this.form.enable({ emitEvent: false });
        this.errorMessage = getHttpErrorMessage(err, {
          fallback: 'Não foi possível salvar o perfil. Tente novamente.'
        });
      }
    });
  }

  private parseBrToIsoDate(value: unknown): string | null {
    if (value == null) {
      return null;
    }

    const str = String(value).trim();
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
      return null;
    }

    const [ddStr, mmStr, yyyyStr] = str.split('/');
    const dd = Number(ddStr);
    const mm = Number(mmStr);
    const yyyy = Number(yyyyStr);

    if (!Number.isInteger(dd) || !Number.isInteger(mm) || !Number.isInteger(yyyy)) {
      return null;
    }

    if (yyyy < 1900 || yyyy > 2100) {
      return null;
    }

    if (mm < 1 || mm > 12) {
      return null;
    }

    if (dd < 1 || dd > 31) {
      return null;
    }

    const dt = new Date(yyyy, mm - 1, dd);
    if (dt.getFullYear() !== yyyy || dt.getMonth() !== mm - 1 || dt.getDate() !== dd) {
      return null;
    }

    const isoMonth = String(mm).padStart(2, '0');
    const isoDay = String(dd).padStart(2, '0');
    return `${yyyy}-${isoMonth}-${isoDay}`;
  }
}
