import { Component } from '@angular/core';

import { AuthSessionService } from '../../../services/auth-session.service';

@Component({
  selector: 'app-flashcards',
  templateUrl: './flashcards.component.html',
  styleUrls: ['./flashcards.component.scss']
})
export class FlashcardsComponent {
  constructor(private readonly sessionService: AuthSessionService) {}

  get isPremium(): boolean {
    return this.sessionService.isPremium();
  }
}
