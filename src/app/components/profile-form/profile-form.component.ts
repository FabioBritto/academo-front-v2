import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import type { ProfileDTO, UpdateProfileDTO } from '../../model/profile.model';
import { ProfileService } from '../../services/profile.service';
import { toIsoDateFromPtBr, toPtBrFromIsoDate } from '../../utils/date.util';
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

  constructor(
    private readonly fb: FormBuilder,
    private readonly profileService: ProfileService
  ) {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      birthDate: ['', Validators.required],
      gender: ['', Validators.required]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('profile' in changes) {
      const profile = this.profile;

      if (profile) {
        this.form.patchValue({
          fullName: profile.fullName ?? '',
          birthDate: profile.birthDate ? toPtBrFromIsoDate(profile.birthDate) : '',
          gender: profile.gender ?? ''
        });
      } else {
        this.form.reset({
          fullName: '',
          birthDate: '',
          gender: ''
        });
      }

      this.validationMessage = '';
      this.errorMessage = '';
    }
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

    const birthDatePtBr = String(this.form.value['birthDate'] ?? '').trim();
    const birthDateValid = /^\d{2}\/\d{2}\/\d{4}$/.test(birthDatePtBr);

    if (!birthDateValid) {
      this.isSubmitting = false;
      this.validationMessage = 'Informe a data de nascimento no formato dd/mm/aaaa.';
      return;
    }

    const birthDateIso = toIsoDateFromPtBr(birthDatePtBr);

    const payload: UpdateProfileDTO = {
      fullName: String(this.form.value['fullName'] ?? '').trim(),
      birthDate: birthDateIso,
      gender: this.form.value['gender']
    };

    this.profileService.updateProfile(payload).subscribe({
      next: (updated) => {
        this.isSubmitting = false;
        this.saved.emit(updated);
      },
      error: (err: unknown) => {
        this.isSubmitting = false;
        this.errorMessage = getHttpErrorMessage(err, {
          fallback: 'Não foi possível salvar o perfil. Tente novamente.'
        });
      }
    });
  }
}
