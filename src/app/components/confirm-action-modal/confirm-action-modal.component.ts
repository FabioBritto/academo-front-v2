import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-action-modal',
  templateUrl: './confirm-action-modal.component.html',
  styleUrls: ['./confirm-action-modal.component.scss']
})
export class ConfirmActionModalComponent {
  @Input() title = 'Confirmar ação';

  @Input() message = '';

  @Input() confirmLabel = 'Confirmar';

  @Input() cancelLabel = 'Cancelar';

  @Input() isSubmitting = false;

  constructor(public readonly activeModal: NgbActiveModal) {}

  confirm(): void {
    if (this.isSubmitting) {
      return;
    }

    this.activeModal.close(true);
  }

  cancel(): void {
    if (this.isSubmitting) {
      return;
    }

    this.activeModal.dismiss(false);
  }
}
