import { Component, EventEmitter, Input, Output } from '@angular/core';

import type { CardLevel, FlashcardDTO } from '../../model/flashcards.model';

@Component({
  selector: 'app-flashcard-card',
  templateUrl: './flashcard-card.component.html',
  styleUrls: ['./flashcard-card.component.scss']
})
export class FlashcardCardComponent {
  @Input({ required: true }) flashcard!: FlashcardDTO;
  @Input() subjectName = '';

  @Output() selected = new EventEmitter<FlashcardDTO>();

  onSelect(): void {
    this.selected.emit(this.flashcard);
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
