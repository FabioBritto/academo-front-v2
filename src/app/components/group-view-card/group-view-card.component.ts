import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import type { GroupDTO } from '../../model/groups.model';
import { GroupsService } from '../../services/groups.service';
import { GroupUpsertModalComponent } from '../group-upsert-modal/group-upsert-modal.component';

@Component({
  selector: 'app-group-view-card',
  templateUrl: './group-view-card.component.html',
  styleUrls: ['./group-view-card.component.scss']
})
export class GroupViewCardComponent {
  @Input() emptyMessage = 'Nenhum grupo por aqui ainda.';

  groups: GroupDTO[] = [];

  page = 0;
  pageSize = 12;
  totalPages = 0;

  constructor(
    private readonly modalService: NgbModal,
    private readonly groupsService: GroupsService
  ) {}

  get hasItems(): boolean {
    return this.groups.length > 0;
  }

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    this.groupsService.listPaged({ page: this.page, size: this.pageSize }).subscribe({
      next: (page) => {
        this.groups = page.content;
        this.totalPages = page.totalPages;
      },
      error: () => {
        this.groups = [];
        this.totalPages = 0;
      }
    });
  }

  onPageChange(nextPage: number): void {
    if (nextPage === this.page) {
      return;
    }

    this.page = nextPage;
    this.loadGroups();
  }

  openNewGroupModal(): void {
    const modalRef = this.modalService.open(GroupUpsertModalComponent, {
      centered: true,
      size: 'xl'
    });

    modalRef.closed.subscribe((result) => {
      if (result) {
        this.loadGroups();
      }
    });
  }
}
