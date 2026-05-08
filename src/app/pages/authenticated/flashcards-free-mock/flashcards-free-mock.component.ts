import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface MockFlashcardDeck {
  title: string;
  count: number;
  levelHint: string;
}

@Component({
  selector: 'app-flashcards-free-mock',
  templateUrl: './flashcards-free-mock.component.html',
  styleUrls: ['./flashcards-free-mock.component.scss']
})
export class FlashcardsFreeMockComponent {
  readonly decks: MockFlashcardDeck[] = [
    { title: 'Matemática - Funções', count: 24, levelHint: 'FÁCIL • MÉDIO • DIFÍCIL' },
    { title: 'Matemática - Limites', count: 18, levelHint: 'MÉDIO • DIFÍCIL' },
    { title: 'Matemática - Derivadas', count: 30, levelHint: 'FÁCIL • MÉDIO • DIFÍCIL' },
    { title: 'Matemática - Matrizes', count: 16, levelHint: 'FÁCIL • MÉDIO' }
  ];

  constructor(private readonly router: Router) {}

  goToPremium(): void {
    void this.router.navigate(['/app/profile-subscription']);
  }
}
