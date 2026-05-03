import { Component, Input } from '@angular/core';
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

  constructor(public readonly activeModal: NgbActiveModal) {}

  close(): void {
    this.activeModal.dismiss('close');
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
