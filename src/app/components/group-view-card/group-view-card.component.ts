import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import type { GroupDTO } from '../../model/groups.model';
import { GroupsService } from '../../services/groups.service';
import { ToastService } from '../../services/toast.service';
import { GroupUpsertModalComponent } from '../group-upsert-modal/group-upsert-modal.component';
import type { SortFilterOption } from '../sort-filters/sort-filters.component';

@Component({
  selector: 'app-group-view-card',
  templateUrl: './group-view-card.component.html',
  styleUrls: ['./group-view-card.component.scss']
})
export class GroupViewCardComponent {
  @Input() emptyMessage = 'Nenhum grupo por aqui ainda.';

  showInactive = false;

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
    private readonly groupsService: GroupsService,
    private readonly toastService: ToastService
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
      sort: [this.sort],
      isActive: this.showInactive ? undefined : true
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

  toggleShowInactive(): void {
    this.showInactive = !this.showInactive;
    this.page = 0;
    this.loadGroups();
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

  onGroupChanged(groupId: number): void {
    const id = Number(groupId);
    if (!Number.isFinite(id) || id <= 0) {
      return;
    }

    this.groupsService.getById(id).subscribe({
      next: (group) => {
        this.groups = (this.groups ?? []).map((g) => (g.id === id ? group : g));
      },
      error: () => {
        this.loadGroups();
      }
    });
  }

  openNewGroupModal(): void {
    const modalRef = this.modalService.open(GroupUpsertModalComponent, {
      centered: true,
      size: 'xl'
    });

    modalRef.closed.subscribe((result) => {
      if (result) {
        this.toastService.show('Grupo criado com sucesso.', {
          classname: 'bg-success text-light',
          delay: 3500,
          autohide: true
        });
        this.loadGroups();
      }
    });
  }
}
