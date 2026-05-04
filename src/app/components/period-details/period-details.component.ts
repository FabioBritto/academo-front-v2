import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import type { ActivityDTO } from '../../model/activities.model';
import type { PeriodDTO } from '../../model/periods.model';
import { ActivitiesService } from '../../services/activities.service';
import { ToastService } from '../../services/toast.service';
import { getHttpErrorMessage } from '../../utils/http-error.util';
import { ActivityUpsertModalComponent } from '../activity-upsert-modal/activity-upsert-modal.component';
import { ActivityTypeFilterModalComponent } from '../activity-type-filter-modal/activity-type-filter-modal.component';

@Component({
  selector: 'app-period-details',
  templateUrl: './period-details.component.html',
  styleUrls: ['./period-details.component.scss']
})
export class PeriodDetailsComponent {
  @Input() subjectId: number | null = null;

  @Input() periodLabel = '';

  @Input() hasItems = false;

  @Input() period: PeriodDTO | null = null;

  @Input() pageSize = 6;

  @Input() emptyMessage = 'Nenhuma atividade por enquanto.';

  @Output() changed = new EventEmitter<void>();

  page = 0;

  totalPages = 0;

  isLoading = false;

  errorMessage = '';

  activities: ActivityDTO[] = [];

  activityTypeFilterNames: string[] | null = null;

  constructor(
    private readonly modalService: NgbModal,
    private readonly activitiesService: ActivitiesService,
    private readonly toastService: ToastService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('period' in changes) {
      this.page = 0;
      this.loadActivities(0);
    }
  }

  private loadActivities(page: number): void {
    const periodId = this.period?.id;
    if (!periodId) {
      this.activities = [];
      this.totalPages = 0;
      this.errorMessage = '';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const activityTypeNames = (this.activityTypeFilterNames ?? [])
      .map((n) => String(n ?? '').trim())
      .filter((n) => Boolean(n));

    this.activitiesService
      .listByPeriodPaged(periodId, {
        page,
        size: this.pageSize,
        sort: ['activityDate,desc']
      }, activityTypeNames.length > 0 ? activityTypeNames : undefined)
      .subscribe({
        next: (res) => {
          this.page = page;
          this.activities = res.content ?? [];
          this.totalPages = res.totalPages ?? 0;
          this.isLoading = false;
        },
        error: (err: unknown) => {
          this.page = page;
          this.activities = [];
          this.totalPages = 0;
          this.isLoading = false;
          this.errorMessage = getHttpErrorMessage(err);
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
    this.loadActivities(nextPage);
  }

  openNewActivityModal(): void {
    const subjectId = this.subjectId;
    const periodId = this.period?.id;
    if (!subjectId || !periodId) {
      return;
    }

    const modalRef = this.modalService.open(ActivityUpsertModalComponent, {
      centered: true,
      size: 'xl'
    });

    modalRef.componentInstance.subjectId = subjectId;
    modalRef.componentInstance.periodId = periodId;

    modalRef.closed.subscribe((saved: unknown) => {
      this.toastService.show('Atividade criada com sucesso.', {
        classname: 'bg-success text-light',
        delay: 3500,
        autohide: true
      });

      const activity = saved as ActivityDTO;
      if (activity?.id && this.page === 0) {
        const typeName = String(activity.activityTypeName ?? '').trim();
        const filter = (this.activityTypeFilterNames ?? [])
          .map((n) => String(n ?? '').trim())
          .filter((n) => Boolean(n));

        const shouldShow = filter.length === 0 || (typeName && filter.includes(typeName));
        if (shouldShow) {
          const current = this.activities ?? [];
          const withoutDuplicates = current.filter((a) => a.id !== activity.id);
          this.activities = [activity, ...withoutDuplicates].slice(0, this.pageSize);
        }
      }

      this.loadActivities(0);
      this.changed.emit();
    });
  }

  openEditActivityModal(activity: ActivityDTO): void {
    const subjectId = this.subjectId;
    const periodId = this.period?.id;
    if (!subjectId || !periodId || !activity?.id) {
      return;
    }

    const modalRef = this.modalService.open(ActivityUpsertModalComponent, {
      centered: true,
      size: 'xl'
    });

    modalRef.componentInstance.subjectId = subjectId;
    modalRef.componentInstance.periodId = periodId;
    modalRef.componentInstance.activityId = activity.id;

    modalRef.closed.subscribe(() => {
      this.toastService.show('Atividade atualizada com sucesso.', {
        classname: 'bg-success text-light',
        delay: 3500,
        autohide: true
      });
      this.loadActivities(0);
      this.changed.emit();
    });
  }

  deleteActivity(activity: ActivityDTO): void {
    if (this.isLoading) {
      return;
    }

    const activityId = activity?.id;
    if (!activityId) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.activitiesService.delete(activityId).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastService.show('Atividade excluída com sucesso.', {
          classname: 'bg-success text-light',
          delay: 3500,
          autohide: true
        });
        this.loadActivities(0);
        this.changed.emit();
      },
      error: (err: unknown) => {
        this.isLoading = false;
        this.errorMessage = getHttpErrorMessage(err, { fallback: 'Não foi possível excluir a atividade.' });
      }
    });
  }

  openFilterByTypeModal(): void {
    const periodId = this.period?.id;
    if (!periodId) {
      return;
    }

    const modalRef = this.modalService.open(ActivityTypeFilterModalComponent, {
      centered: true,
      size: 'lg'
    });

    modalRef.componentInstance.periodId = periodId;
    modalRef.componentInstance.selectedNames = this.activityTypeFilterNames;

    modalRef.closed.subscribe((result: string[] | null) => {
      const names = (result ?? [])
        .map((n) => String(n ?? '').trim())
        .filter((n) => Boolean(n));

      this.activityTypeFilterNames = names.length > 0 ? names : null;
      this.loadActivities(0);
    });
  }
}
