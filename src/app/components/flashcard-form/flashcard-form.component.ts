import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import type { CardLevel, CreateFlashcardDTO, FlashcardDTO, UpdateFlashcardDTO } from '../../model/flashcards.model';
import { FlashcardsService } from '../../services/flashcards.service';
import { ToastService } from '../../services/toast.service';
import { getHttpErrorMessage } from '../../utils/http-error.util';

@Component({
  selector: 'app-flashcard-form',
  templateUrl: './flashcard-form.component.html',
  styleUrls: ['./flashcard-form.component.scss']
})
export class FlashcardFormComponent implements OnChanges {
  @Input() subjectId: number | null = null;

  @Input() flashcard: FlashcardDTO | null = null;

  @Output() saved = new EventEmitter<FlashcardDTO>();

  form: FormGroup;

  isSubmitting = false;
  validationMessage = '';
  errorMessage = '';

  readonly maxLength = 1500;

  readonly levelOptions = [
    { label: 'FÁCIL', value: 'FACIL' },
    { label: 'MÉDIO', value: 'MEDIO' },
    { label: 'DIFÍCIL', value: 'DIFICIL' },
    { label: 'MUITO DIFÍCIL', value: 'MUITO_DIFICIL' }
  ] as const;

  constructor(
    private readonly fb: FormBuilder,
    private readonly flashcardsService: FlashcardsService,
    private readonly toastService: ToastService
  ) {
    this.form = this.fb.group({
      frontPart: ['', [Validators.required, Validators.maxLength(this.maxLength)]],
      backPart: ['', [Validators.required, Validators.maxLength(this.maxLength)]],
      level: ['FACIL']
    });

    this.form.get('level')?.disable();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!('flashcard' in changes)) {
      return;
    }

    const flashcard = this.flashcard;

    if (flashcard) {
      this.form.patchValue({
        frontPart: flashcard.frontPart,
        backPart: flashcard.backPart,
        level: flashcard.level
      });

      this.form.get('level')?.setValidators([Validators.required]);
      this.form.get('level')?.enable();
    } else {
      this.form.reset({
        frontPart: '',
        backPart: '',
        level: 'FACIL'
      });

      this.form.get('level')?.clearValidators();
      this.form.get('level')?.disable();
    }

    this.form.get('level')?.updateValueAndValidity();

    this.validationMessage = '';
    this.errorMessage = '';
  }

  get frontPartLength(): number {
    return String(this.form.get('frontPart')?.value ?? '').length;
  }

  get backPartLength(): number {
    return String(this.form.get('backPart')?.value ?? '').length;
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

    const frontPart = String(this.form.value['frontPart'] ?? '').trim();
    const backPart = String(this.form.value['backPart'] ?? '').trim();

    if (!this.flashcard) {
      const subjectId = this.subjectId == null ? NaN : Number(this.subjectId);

      if (Number.isNaN(subjectId) || subjectId <= 0) {
        this.isSubmitting = false;
        this.errorMessage = 'Não foi possível identificar a matéria deste flashcard. Recarregue a página e tente novamente.';
        return;
      }

      const payload: CreateFlashcardDTO = {
        subjectId,
        frontPart,
        backPart
      };

      let didSucceed = false;
      this.flashcardsService
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
            this.toastService.show('Flashcard criado com sucesso.', {
              classname: 'bg-success text-light',
              delay: 3500,
              autohide: true
            });
            this.saved.emit(created);
          },
          error: (err: unknown) => {
            this.handleError(err, 'Não foi possível criar o flashcard. Tente novamente.');
          }
        });

      return;
    }

    const level = String(this.form.value['level'] ?? 'FACIL') as UpdateFlashcardDTO['level'];

    const updatePayload: UpdateFlashcardDTO = {
      level,
      frontPart,
      backPart
    };

    let didSucceed = false;
    this.flashcardsService
      .update(this.flashcard.id, updatePayload)
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
          this.toastService.show('Flashcard atualizado com sucesso.', {
            classname: 'bg-success text-light',
            delay: 3500,
            autohide: true
          });
          this.saved.emit(updated);
        },
        error: (err: unknown) => {
          this.handleError(err, 'Não foi possível atualizar o flashcard. Tente novamente.');
        }
      });
  }

  setLevel(nextLevel: UpdateFlashcardDTO['level']): void {
    if (!this.flashcard || this.isSubmitting) {
      return;
    }

    this.form.get('level')?.setValue(nextLevel);
    this.form.get('level')?.markAsDirty();
  }

  levelBtnClass(level: CardLevel): string {
    switch (level) {
      case 'FACIL':
        return 'aa-difficulty-btn--easy';
      case 'MEDIO':
        return 'aa-difficulty-btn--medium';
      case 'DIFICIL':
        return 'aa-difficulty-btn--hard';
      case 'MUITO_DIFICIL':
        return 'aa-difficulty-btn--very-hard';
      default:
        return '';
    }
  }

  private handleError(err: unknown, fallback: string): void {
    this.errorMessage = getHttpErrorMessage(err, { fallback });
  }
}
