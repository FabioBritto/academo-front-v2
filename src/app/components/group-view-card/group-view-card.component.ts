import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import type { GroupDTO } from '../../model/groups.model';
import { GroupsService } from '../../services/groups.service';
import { GroupUpsertModalComponent } from '../group-upsert-modal/group-upsert-modal.component';
import type { SortFilterOption } from '../sort-filters/sort-filters.component';

@Component({
  selector: 'app-group-view-card',
  templateUrl: './group-view-card.component.html',
  styleUrls: ['./group-view-card.component.scss']
})
export class GroupViewCardComponent {
  @Input() emptyMessage = 'Nenhum grupo por aqui ainda.';

  sort = 'updatedAt,desc';

  readonly sortOptions: SortFilterOption[] = [
    { label: 'Nome (A→Z)', value: 'name,asc' },
    { label: 'Nome (Z→A)', value: 'name,desc' },
    { label: 'Atualização (mais recente)', value: 'updatedAt,desc' },
    { label: 'Atualização (mais antiga)', value: 'updatedAt,asc' }
  ];

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
    this.groupsService.listPaged({
      page: this.page,
      size: this.pageSize,
      sort: [this.sort]
    }).subscribe({
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

  onSortChange(nextSort: string): void {
    if (nextSort === this.sort) {
      return;
    }

    this.sort = nextSort;
    this.page = 0;
    this.loadGroups();
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
