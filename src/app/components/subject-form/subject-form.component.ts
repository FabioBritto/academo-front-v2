import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import type { CreateSubjectDTO, SubjectDTO, UpdateSubjectDTO } from '../../model/subjects.model';
import type { CalculationType } from '../../model/subjects.model';
import { SubjectsService } from '../../services/subjects.service';
import { getHttpErrorMessage } from '../../utils/http-error.util';

@Component({
  selector: 'app-subject-form',
  templateUrl: './subject-form.component.html',
  styleUrls: ['./subject-form.component.scss']
})
export class SubjectFormComponent implements OnChanges {
  @Input() subject: SubjectDTO | null = null;

  @Output() saved = new EventEmitter<SubjectDTO>();

  form: FormGroup;

  isSubmitting = false;
  validationMessage = '';
  errorMessage = '';

  readonly maxTextLen = 255;

  readonly calculationTypeOptions = [
    { label: 'Média Aritmética', value: 'MEDIA_ARITMETICA' },
    { label: 'Média Ponderada', value: 'MEDIA_PONDERADA' }
  ] as const;

  constructor(
    private readonly fb: FormBuilder,
    private readonly subjectsService: SubjectsService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(this.maxTextLen)]],
      description: ['', [Validators.maxLength(this.maxTextLen)]],
      passingGrade: [null],
      calculationType: ['MEDIA_ARITMETICA'],
      isActive: [true]
    });
  }

  isControlRequired(controlName: string): boolean {
    const control = this.form.get(controlName);
    if (!control) {
      return false;
    }

    const hasValidator = (control as unknown as { hasValidator?: (v: unknown) => boolean }).hasValidator;
    if (typeof hasValidator !== 'function') {
      return false;
    }

    return control.hasValidator(Validators.required);
  }

  onCalculationTypeChange(value: CalculationType): void {
    if (this.isSubmitting) {
      return;
    }

    this.form.get('calculationType')?.setValue(value);
    this.form.get('calculationType')?.markAsTouched();
    this.form.get('calculationType')?.updateValueAndValidity();
  }

  get nameLength(): number {
    return String(this.form.get('name')?.value ?? '').length;
  }

  get descriptionLength(): number {
    return String(this.form.get('description')?.value ?? '').length;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!('subject' in changes)) {
      return;
    }

    const subject = this.subject;

    if (subject) {
      this.form.patchValue({
        name: subject.name,
        description: subject.description,
        passingGrade: subject.passingGrade,
        calculationType: subject.calculationType,
        isActive: subject.isActive
      });

      this.form.get('passingGrade')?.setValidators([Validators.required, Validators.min(0.000001), Validators.max(10)]);
      this.form.get('calculationType')?.setValidators([Validators.required]);
    } else {
      this.form.reset({
        name: '',
        description: '',
        passingGrade: null,
        calculationType: 'MEDIA_ARITMETICA',
        isActive: true
      });

      this.form.get('passingGrade')?.clearValidators();
      this.form.get('calculationType')?.clearValidators();
    }

    this.form.get('passingGrade')?.updateValueAndValidity();
    this.form.get('calculationType')?.updateValueAndValidity();

    this.validationMessage = '';
    this.errorMessage = '';
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

    const name = String(this.form.value['name'] ?? '').trim();
    const description = String(this.form.value['description'] ?? '').trim();

    if (!this.subject) {
      const payload: CreateSubjectDTO = {
        name,
        description
      };

      let didSucceed = false;
      this.subjectsService
        .create(payload)
        .pipe(
          finalize(() => {
            if (!didSucceed) {
              this.isSubmitting = false;
            }
          })
        )
        .subscribe({
          next: (created) => {
            didSucceed = true;
            this.saved.emit(created);
          },
          error: (err: unknown) => {
            this.handleError(err, 'Não foi possível criar a matéria. Tente novamente.');
          }
        });

      return;
    }

    const passingGradeRaw = Number(this.form.value['passingGrade']);
    const passingGrade = Number.isFinite(passingGradeRaw) ? passingGradeRaw : 0;

    const calculationType = String(this.form.value['calculationType'] ?? 'MEDIA_ARITMETICA') as UpdateSubjectDTO['calculationType'];
    const isActive = Boolean(this.form.value['isActive']);

    const updatePayload: UpdateSubjectDTO = {
      name,
      description,
      passingGrade,
      calculationType,
      isActive
    };

    let didSucceed = false;
    this.subjectsService
      .update(this.subject.id, updatePayload)
      .pipe(
        finalize(() => {
          if (!didSucceed) {
            this.isSubmitting = false;
          }
        })
      )
      .subscribe({
        next: (updated) => {
          didSucceed = true;
          this.saved.emit(updated);
        },
        error: (err: unknown) => {
          this.handleError(err, 'Não foi possível salvar a matéria. Tente novamente.');
        }
      });
  }

  private handleError(err: unknown, fallback: string): void {
    this.errorMessage = getHttpErrorMessage(err, { fallback });
  }
}
