import { Component, Input, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import type { GroupDTO } from '../../model/groups.model';
import { GroupFormComponent } from '../group-form/group-form.component';

@Component({
  selector: 'app-group-upsert-modal',
  templateUrl: './group-upsert-modal.component.html',
  styleUrls: ['./group-upsert-modal.component.scss']
})
export class GroupUpsertModalComponent {
  @Input() group: GroupDTO | null = null;

  @ViewChild(GroupFormComponent) groupForm?: GroupFormComponent;

  imageSrc = 'assets/images/study-02.jpeg';
  imageAlt = 'Ilustração de estudo';

  get title(): string {
    return this.group ? 'Editar Grupo' : 'Novo Grupo';
  }

  get isSubmitting(): boolean {
    return this.groupForm?.isSubmitting ?? false;
  }

  constructor(public readonly activeModal: NgbActiveModal) {}

  close(): void {
    if (this.isSubmitting) {
      return;
    }

    this.activeModal.dismiss('close');
  }

  onSaveClick(): void {
    this.groupForm?.submit();
  }

  onSaved(saved: GroupDTO): void {
    this.activeModal.close(saved);
  }
}
