import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs';

import type { ActivityTypeDTO, UpdateActivityTypeWeightDTO } from '../../model/activity-types.model';
import type { Page } from '../../model/common.model';
import { ActivityTypesService } from '../../services/activity-types.service';
import { getHttpErrorMessage } from '../../utils/http-error.util';
import { ActivityTypeCreateModalComponent } from '../activity-type-create-modal/activity-type-create-modal.component';

type ActivityTypeWeightItem = {
  id: number;
  name: string;
  weight: number;
};

@Component({
  selector: 'app-activity-type-weights-modal',
  templateUrl: './activity-type-weights-modal.component.html',
  styleUrls: ['./activity-type-weights-modal.component.scss']
})
export class ActivityTypeWeightsModalComponent implements OnInit {
  @Input({ required: true }) periodId!: number;

  pageSize = 200;

  isLoading = false;
  isSubmitting = false;
  errorMessage = '';

  items: ActivityTypeWeightItem[] = [];

  constructor(
    public readonly activeModal: NgbActiveModal,
    private readonly modalService: NgbModal,
    private readonly activityTypesService: ActivityTypesService
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  close(): void {
    if (this.isLoading || this.isSubmitting) {
      return;
    }

    this.activeModal.dismiss('close');
  }

  save(): void {
    if (this.isLoading || this.isSubmitting) {
      return;
    }

    if (this.isSaveDisabled) {
      return;
    }

    const periodId = Number(this.periodId);
    if (!Number.isFinite(periodId) || periodId <= 0) {
      return;
    }

    const body: UpdateActivityTypeWeightDTO = {
      weights: (this.items ?? []).map((i) => ({
        activityTypeId: i.id,
        weight: Number(i.weight) || 0
      }))
    };

    this.isSubmitting = true;
    this.errorMessage = '';

    let didSucceed = false;
    this.activityTypesService
      .updatePeriodWeights(periodId, body)
      .pipe(
        finalize(() => {
          if (!didSucceed) {
            this.isSubmitting = false;
          }
        })
      )
      .subscribe({
        next: () => {
          didSucceed = true;
          this.activeModal.close(this.items);
        },
        error: (err: unknown) => {
          this.errorMessage = getHttpErrorMessage(err, { fallback: 'Não foi possível salvar os pesos.' });
        }
      });
  }

  resetAll(): void {
    if (this.isLoading || this.isSubmitting) {
      return;
    }

    this.items = (this.items ?? []).map((i) => ({ ...i, weight: 0 }));
  }

  openCreateActivityTypeModal(): void {
    if (this.isLoading || this.isSubmitting) {
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

      this.loadAll();
    });
  }

  get total(): number {
    return (this.items ?? []).reduce((acc, i) => acc + (Number(i?.weight) || 0), 0);
  }

  get remaining(): number {
    return 100 - this.total;
  }

  get isOverLimit(): boolean {
    return this.total > 100;
  }

  get isSaveDisabled(): boolean {
    return this.isLoading || this.isSubmitting || this.isOverLimit;
  }

  get isIncreaseLocked(): boolean {
    return this.total >= 100 && this.remaining <= 0;
  }

  get progressValue(): number {
    const t = this.total;
    if (!Number.isFinite(t)) {
      return 0;
    }

    return Math.max(0, Math.min(100, t));
  }

  onWeightChange(item: ActivityTypeWeightItem, rawValue: unknown): void {
    const next = this.sanitizeWeight(rawValue);
    item.weight = next;
  }

  private sanitizeWeight(rawValue: unknown): number {
    const n = Number(rawValue);
    if (!Number.isFinite(n)) {
      return 0;
    }

    const asInt = Math.round(n);
    return Math.max(0, Math.min(100, asInt));
  }

  private loadAll(): void {
    const periodId = Number(this.periodId);
    if (!Number.isFinite(periodId) || periodId <= 0) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.activityTypesService
      .listAllByPeriodPaged(periodId, {
        page: 0,
        size: this.pageSize,
        sort: ['name,asc']
      })
      .subscribe({
        next: (res: Page<ActivityTypeDTO>) => {
          const content = res.content ?? [];
          this.items = content.map((t) => ({
            id: t.id,
            name: t.name,
            weight: Number(t.weight) || 0
          }));
          this.isLoading = false;
        },
        error: (err: unknown) => {
          this.items = [];
          this.isLoading = false;
          this.errorMessage = getHttpErrorMessage(err, { fallback: 'Não foi possível carregar os tipos de atividade.' });
        }
      });
  }
}
