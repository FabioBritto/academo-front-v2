import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import type { Page } from '../../model/common.model';
import type { GroupDTO } from '../../model/groups.model';
import type { SubjectDTO } from '../../model/subjects.model';
import { GroupsService } from '../../services/groups.service';
import { SubjectsService } from '../../services/subjects.service';
import { ToastService } from '../../services/toast.service';
import { getHttpErrorMessage } from '../../utils/http-error.util';

@Component({
  selector: 'app-group-subjects-picker-modal',
  templateUrl: './group-subjects-picker-modal.component.html',
  styleUrls: ['./group-subjects-picker-modal.component.scss']
})
export class GroupSubjectsPickerModalComponent implements OnInit {
  @Input({ required: true }) groupId!: number;

  page = 0;
  pageSize = 6;
  totalPages = 0;

  isLoading = false;
  errorMessage = '';

  subjects: SubjectDTO[] = [];

  private selected = new Set<number>();

  constructor(
    public readonly activeModal: NgbActiveModal,
    private readonly subjectsService: SubjectsService,
    private readonly groupsService: GroupsService,
    private readonly toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadPage(0);
  }

  close(): void {
    this.activeModal.dismiss('close');
  }

  clearAndClose(): void {
    this.selected.clear();
    this.activeModal.close(null);
  }

  toggle(subject: SubjectDTO): void {
    const id = Number(subject?.id);
    if (!Number.isFinite(id) || id <= 0) {
      return;
    }

    if (this.selected.has(id)) {
      this.selected.delete(id);
    } else {
      this.selected.add(id);
    }
  }

  isSelected(subjectId: number): boolean {
    const id = Number(subjectId);
    return Number.isFinite(id) && this.selected.has(id);
  }

  apply(): void {
    if (this.isLoading) {
      return;
    }

    const groupId = Number(this.groupId);
    if (!Number.isFinite(groupId) || groupId <= 0) {
      return;
    }

    const subjectsIds = Array.from(this.selected).filter((id) => Number.isFinite(id) && id > 0);
    if (subjectsIds.length === 0) {
      this.activeModal.close(null);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.groupsService.associateSubjects(groupId, { subjectsIds }).subscribe({
      next: (group: GroupDTO) => {
        this.isLoading = false;
        this.toastService.show('Matérias associadas ao grupo com sucesso.', {
          classname: 'bg-success text-light',
          delay: 3500,
          autohide: true
        });
        this.activeModal.close(group);
      },
      error: (err: unknown) => {
        this.isLoading = false;
        this.errorMessage = getHttpErrorMessage(err, { fallback: 'Não foi possível associar as matérias ao grupo.' });
      }
    });
  }

  onPageChange(next: number): void {
    const n = Number(next);
    if (!Number.isFinite(n) || n < 0) {
      return;
    }

    const max = Math.max(0, this.totalPages - 1);
    const nextPage = Math.min(max, n);
    this.loadPage(nextPage);
  }

  private loadPage(page: number): void {
    const groupId = Number(this.groupId);
    if (!Number.isFinite(groupId) || groupId <= 0) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.subjectsService
      .listPagedWithGroupFilter(groupId, {
        page,
        size: this.pageSize,
        sort: ['name,asc'],
        isActive: true
      })
      .subscribe({
        next: (res: Page<SubjectDTO>) => {
          this.page = page;
          this.subjects = res.content ?? [];
          this.totalPages = res.totalPages ?? 0;
          this.isLoading = false;
        },
        error: (err: unknown) => {
          this.page = page;
          this.subjects = [];
          this.totalPages = 0;
          this.isLoading = false;
          this.errorMessage = getHttpErrorMessage(err, { fallback: 'Não foi possível carregar as matérias.' });
        }
      });
  }
}
