import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-form-card',
  templateUrl: './form-card.component.html',
  styleUrls: ['./form-card.component.scss']
})
export class FormCardComponent {
  @Input({ required: true }) formGroup!: FormGroup;

  @Input() title = '';

  @Input() subtitle = '';

  @Input() icon = 'bi bi-send-fill';

  @Input() submitLabel = '';

  @Input() submitIcon = 'bi bi-arrow-right-circle-fill';

  @Input() secureNote = '';

  @Input() secureIcon = 'bi bi-lock-fill';

  @Output() formSubmit = new EventEmitter<Record<string, unknown>>();

  onSubmit(): void {
    if (!this.formGroup) {
      return;
    }

    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    this.formSubmit.emit(this.formGroup.value as Record<string, unknown>);
  }
}
