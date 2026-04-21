import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { GroupUpsertModalComponent } from '../group-upsert-modal/group-upsert-modal.component';

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
    this.modalService.open(GroupUpsertModalComponent, {
      centered: true,
      size: 'xl'
    });
  }
}
