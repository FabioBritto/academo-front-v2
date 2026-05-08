import { Component, Input, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import type { FlashcardDTO } from '../../model/flashcards.model';
import { FlashcardFormComponent } from '../flashcard-form/flashcard-form.component';

@Component({
  selector: 'app-flashcard-upsert-modal',
  templateUrl: './flashcard-upsert-modal.component.html',
  styleUrls: ['./flashcard-upsert-modal.component.scss']
})
export class FlashcardUpsertModalComponent {
  @Input() subjectId: number | null = null;

  @Input() flashcard: FlashcardDTO | null = null;

  @ViewChild(FlashcardFormComponent) flashcardForm?: FlashcardFormComponent;

  get title(): string {
    return this.flashcard ? 'Editar Flashcard' : 'Novo Flashcard';
  }

  get isSubmitting(): boolean {
    return this.flashcardForm?.isSubmitting ?? false;
  }

  get isSaveDisabled(): boolean {
    const form = this.flashcardForm;
    if (!form) {
      return true;
    }

    const maxLength = form.maxLength;
    const frontLen = form.frontPartLength;
    const backLen = form.backPartLength;

    return (
      this.isSubmitting ||
      frontLen === 0 ||
      backLen === 0 ||
      frontLen >= maxLength ||
      backLen >= maxLength ||
      (form.form?.invalid ?? false)
    );
  }

  constructor(public readonly activeModal: NgbActiveModal) {}

  close(): void {
    if (this.isSubmitting) {
      return;
    }

    this.activeModal.dismiss('close');
  }

  onSaveClick(): void {
    if (this.isSubmitting) {
      return;
    }

    this.flashcardForm?.submit();
  }

  onSaved(saved: FlashcardDTO): void {
    this.activeModal.close(saved);
  }
}
