import { Component, Input } from '@angular/core';

import type { CardLevel, FlashcardDTO } from '../../model/flashcards.model';

@Component({
  selector: 'app-flashcard-card',
  templateUrl: './flashcard-card.component.html',
  styleUrls: ['./flashcard-card.component.scss']
})
export class FlashcardCardComponent {
  @Input({ required: true }) flashcard!: FlashcardDTO;
  @Input() subjectName = '';

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
