import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ConfirmActionModalComponent } from '../confirm-action-modal/confirm-action-modal.component';

@Component({
  selector: 'app-delete-button',
  templateUrl: './delete-button.component.html',
  styleUrls: ['./delete-button.component.scss']
})
export class DeleteButtonComponent {
  @Input() label = 'Excluir';

  @Input() icon = 'bi bi-trash-fill';

  @Input() disabled = false;

  @Input({ required: true }) confirmTitle!: string;

  @Input({ required: true }) confirmMessage!: string;

  @Input() confirmLabel = 'Excluir';

  @Input() cancelLabel = 'Cancelar';

  @Input() isSubmitting = false;

  @Output() confirmed = new EventEmitter<void>();

  constructor(private readonly modalService: NgbModal) {}

  openConfirm(): void {
    if (this.disabled || this.isSubmitting) {
      return;
    }

    const modalRef = this.modalService.open(ConfirmActionModalComponent, {
      centered: true
    });

    modalRef.componentInstance.title = this.confirmTitle;
    modalRef.componentInstance.message = this.confirmMessage;
    modalRef.componentInstance.confirmLabel = this.confirmLabel;
    modalRef.componentInstance.cancelLabel = this.cancelLabel;
    modalRef.componentInstance.isSubmitting = this.isSubmitting;

    modalRef.closed.subscribe((confirmed) => {
      if (confirmed === true) {
        this.confirmed.emit();
      }
    });
  }
}
