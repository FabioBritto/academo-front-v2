import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import type { ActivityTypeDTO } from '../../model/activity-types.model';
import { ActivityTypeCreateModalComponent } from '../activity-type-create-modal/activity-type-create-modal.component';
import { ActivityTypesService } from '../../services/activity-types.service';
import type { Page } from '../../model/common.model';
import { getHttpErrorMessage } from '../../utils/http-error.util';

@Component({
  selector: 'app-activity-type-filter-modal',
  templateUrl: './activity-type-filter-modal.component.html',
  styleUrls: ['./activity-type-filter-modal.component.scss']
})
export class ActivityTypeFilterModalComponent implements OnInit {
  @Input({ required: true }) periodId!: number;
  @Input() selectedNames?: string[] | null;

  page = 0;
  pageSize = 6;
  totalPages = 0;

  isLoading = false;
  errorMessage = '';

  activityTypes: ActivityTypeDTO[] = [];

  private selected = new Set<string>();

  constructor(
    public readonly activeModal: NgbActiveModal,
    private readonly modalService: NgbModal,
    private readonly activityTypesService: ActivityTypesService
  ) {}

  ngOnInit(): void {
    this.selected = new Set(
      (this.selectedNames ?? [])
        .map((n) => String(n ?? '').trim())
        .filter((n) => Boolean(n))
    );
    this.loadPage(0);
  }

  close(): void {
    this.activeModal.dismiss('close');
  }

  clearFilter(): void {
    this.activeModal.close(null);
  }

  toggle(activityType: ActivityTypeDTO): void {
    const name = String(activityType?.name ?? '').trim();
    if (!name) {
      return;
    }

    if (this.selected.has(name)) {
      this.selected.delete(name);
    } else {
      this.selected.add(name);
    }
  }

  isSelected(name: string): boolean {
    const n = String(name ?? '').trim();
    return Boolean(n) && this.selected.has(n);
  }

  applyFilter(): void {
    const result = Array.from(this.selected).filter((n) => Boolean(String(n ?? '').trim()));
    this.activeModal.close(result.length > 0 ? result : null);
  }

  clearAndClose(): void {
    this.selected.clear();
    this.activeModal.close(null);
  }

  openCreateActivityTypeModal(): void {
    if (this.isLoading) {
      return;
    }

    const periodId = Number(this.periodId);
    if (!Number.isFinite(periodId) || periodId <= 0) {
      return;
    }

    const modalRef = this.modalService.open(ActivityTypeCreateModalComponent, {
      centered: true,
      size: 'lg'
    });

    modalRef.componentInstance.periodId = periodId;

    modalRef.closed.subscribe((created: unknown) => {
      const activityType = created as ActivityTypeDTO;
      if (!activityType?.id) {
        return;
      }

      this.loadPage(0);
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
    const periodId = Number(this.periodId);
    if (!Number.isFinite(periodId) || periodId <= 0) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.activityTypesService
      .listAllByPeriodPaged(periodId, { page, size: this.pageSize, sort: ['name,asc'] })
      .subscribe({
        next: (res: Page<ActivityTypeDTO>) => {
          this.page = page;
          this.activityTypes = res.content ?? [];
          this.totalPages = res.totalPages ?? 0;
          this.isLoading = false;
        },
        error: (err: unknown) => {
          this.page = page;
          this.activityTypes = [];
          this.totalPages = 0;
          this.isLoading = false;
          this.errorMessage = getHttpErrorMessage(err, { fallback: 'Não foi possível carregar os tipos de atividade.' });
        }
      });
  }
}
