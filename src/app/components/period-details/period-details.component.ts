import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import type { ActivityDTO } from '../../model/activities.model';
import type { PeriodDTO } from '../../model/periods.model';
import { ActivityUpsertModalComponent } from '../activity-upsert-modal/activity-upsert-modal.component';

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

  page = 0;

  constructor(private readonly modalService: NgbModal) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('period' in changes) {
      this.page = 0;
    }
  }

  get activities(): ActivityDTO[] {
    const period = this.period;
    if (!period) {
      return [];
    }

    const list = period.activityTypeList ?? [];
    const items = list.flatMap((t) => t.activities ?? []);

    return [...items].sort((a, b) => {
      const ad = String(a.activityDate ?? '');
      const bd = String(b.activityDate ?? '');
      if (ad !== bd) {
        return bd.localeCompare(ad);
      }
      return (b.id ?? 0) - (a.id ?? 0);
    });
  }

  get totalPages(): number {
    const size = Number(this.pageSize);
    if (!Number.isFinite(size) || size <= 0) {
      return 0;
    }

    return Math.ceil(this.activities.length / size);
  }

  get pagedActivities(): ActivityDTO[] {
    const size = Number(this.pageSize);
    if (!Number.isFinite(size) || size <= 0) {
      return [];
    }

    const start = this.page * size;
    const end = start + size;
    return this.activities.slice(start, end);
  }

  onPageChange(next: number): void {
    const n = Number(next);
    if (!Number.isFinite(n) || n < 0) {
      return;
    }

    const max = Math.max(0, this.totalPages - 1);
    this.page = Math.min(max, n);
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
  }
}
