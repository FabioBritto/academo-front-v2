import { Component, HostListener, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import type { GroupDTO } from '../../model/groups.model';
import { GroupDetailsModalComponent } from '../group-details-modal/group-details-modal.component';

@Component({
  selector: 'app-view-group-card',
  templateUrl: './view-group-card.component.html',
  styleUrls: ['./view-group-card.component.scss']
})
export class ViewGroupCardComponent {
  @Input({ required: true }) group!: GroupDTO;

  @Input() iconClass = 'bi bi-people-fill';

  constructor(private readonly modalService: NgbModal) {}

  @HostListener('click')
  onHostClick(): void {
    this.openDetails();
  }

  openDetails(): void {
    console.debug('[ViewGroupCard] openDetails', { groupId: this.group?.id });

    const modalRef = this.modalService.open(GroupDetailsModalComponent, {
      centered: true,
      size: 'xl'
    });

    modalRef.componentInstance.groupId = this.group.id;
  }
}
