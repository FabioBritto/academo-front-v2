import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pill-button',
  templateUrl: './pill-button.component.html',
  styleUrls: ['./pill-button.component.scss']
})
export class PillButtonComponent {
  @Input() label = '';

  @Input() disabled = false;

  @Output() buttonClick = new EventEmitter<MouseEvent>();

  onClick(event: MouseEvent): void {
    if (this.disabled) {
      event.preventDefault();
      return;
    }

    this.buttonClick.emit(event);
  }
}
