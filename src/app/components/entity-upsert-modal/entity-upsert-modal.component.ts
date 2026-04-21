import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-entity-upsert-modal',
  templateUrl: './entity-upsert-modal.component.html',
  styleUrls: ['./entity-upsert-modal.component.scss']
})
export class EntityUpsertModalComponent {
  @Input() title = '';

  @Input() isEdit = false;

  @Input() imageSrc = 'assets/images/study-02.jpeg';

  @Input() imageAlt = 'Ilustração de estudo';

  @Input() cancelLabel = 'Cancelar';

  @Input() saveLabel = '';

  @Input() isSubmitting = false;

  @Output() save = new EventEmitter<void>();

  constructor(public readonly activeModal: NgbActiveModal) {}

  close(): void {
    if (this.isSubmitting) {
      return;
    }

    this.activeModal.dismiss('close');
  }

  onSaveClick(): void {
    if (this.isSubmitting) {
      return;
    }

    this.save.emit();
  }

  get computedSaveLabel(): string {
    if (this.saveLabel) {
      return this.saveLabel;
    }

    return this.isEdit ? 'Salvar' : 'Criar';
  }
}
