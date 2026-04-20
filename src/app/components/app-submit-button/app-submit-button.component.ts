import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-submit-button',
  templateUrl: './app-submit-button.component.html',
  styleUrls: ['./app-submit-button.component.scss']
})
export class AppSubmitButtonComponent {
  @Input() label = '';

  @Input() icon = 'bi bi-arrow-right-circle-fill';

  @Input() disabled = false;

  @Input() type: 'button' | 'submit' | 'reset' = 'submit';
}
