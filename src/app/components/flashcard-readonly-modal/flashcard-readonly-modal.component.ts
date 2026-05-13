import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import type { CardLevel, FlashcardDTO } from '../../model/flashcards.model';

@Component({
  selector: 'app-flashcard-readonly-modal',
  templateUrl: './flashcard-readonly-modal.component.html',
  styleUrls: ['./flashcard-readonly-modal.component.scss']
})
export class FlashcardReadonlyModalComponent {
  @Input({ required: true }) flashcard!: FlashcardDTO;
  @Input() subjectName = '';

  get displaySubjectName(): string {
    const name = this.subjectName ?? '';
    const maxLen = 80;

    if (name.length <= maxLen) {
      return name;
    }

    return `${name.slice(0, maxLen).trimEnd()}...`;
  }

  constructor(
    public readonly activeModal: NgbActiveModal,
    private readonly router: Router
  ) {}

  close(): void {
    this.activeModal.dismiss('close');
  }

  accessFlashcard(): void {
    const subjectId = Number(this.flashcard?.subjectId);
    const flashcardId = Number(this.flashcard?.id);

    if (!Number.isFinite(subjectId) || subjectId <= 0) {
      return;
    }

    if (!Number.isFinite(flashcardId) || flashcardId <= 0) {
      return;
    }

    this.activeModal.dismiss('access');
    this.router.navigate([`/app/materias/${subjectId}`], {
      queryParams: {
        tab: 'flashcards',
        editFlashcardId: flashcardId
      }
    });
  }

  levelLabel(level: CardLevel): string {
    switch (level) {
      case 'FACIL':
        return 'Fácil';
      case 'MEDIO':
        return 'Médio';
      case 'DIFICIL':
        return 'Difícil';
      case 'MUITO_DIFICIL':
        return 'Muito difícil';
      case 'SEM_NIVEL':
        return 'Sem nível';
      default:
        return String(level);
    }
  }
}
