import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { EntityUpsertModalComponent } from '../entity-upsert-modal/entity-upsert-modal.component';

@Component({
  selector: 'app-group-view-card',
  templateUrl: './group-view-card.component.html',
  styleUrls: ['./group-view-card.component.scss']
})
export class GroupViewCardComponent {
  @Input() hasItems = false;

  @Input() emptyMessage = 'Nenhum grupo por aqui ainda.';

  constructor(private readonly modalService: NgbModal) {}

  openNewGroupModal(): void {
    const modalRef = this.modalService.open(EntityUpsertModalComponent, {
      centered: true
    });

    modalRef.componentInstance.title = 'Novo Grupo';
    modalRef.componentInstance.isEdit = false;
  }
}
