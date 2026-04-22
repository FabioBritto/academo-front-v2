import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import type { GroupDTO } from '../../model/groups.model';
import { GroupDetailsModalComponent } from '../group-details-modal/group-details-modal.component';

@Component({
  selector: 'app-group-card',
  templateUrl: './group-card.component.html',
  styleUrls: ['./group-card.component.scss']
})
export class GroupCardComponent {
  @Input({ required: true }) group!: GroupDTO;

  @Input() iconClass = 'bi bi-people-fill';

  @Output() changed = new EventEmitter<void>();

  constructor(private readonly modalService: NgbModal) {}

  @HostListener('click')
  onHostClick(): void {
    this.openDetails();
  }

  openDetails(): void {
    const modalRef = this.modalService.open(GroupDetailsModalComponent, {
      centered: true,
      size: 'xl'
    });

    modalRef.componentInstance.groupId = this.group.id;

    modalRef.closed.subscribe((result) => {
      if (result) {
        this.changed.emit();
      }
    });
  }
}
