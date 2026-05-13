import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs';

import type { UpdatePeriodsWeight } from '../../model/periods.model';
import { PeriodsService } from '../../services/periods.service';
import { getHttpErrorMessage } from '../../utils/http-error.util';

@Component({
  selector: 'app-weighted-average-config-modal',
  templateUrl: './weighted-average-config-modal.component.html',
  styleUrls: ['./weighted-average-config-modal.component.scss']
})
export class WeightedAverageConfigModalComponent implements OnInit {
  @Input({ required: true }) subjectId!: number;

  @Input() firstPeriodName?: string;
  @Input() secondPeriodName?: string;
  @Input() firstPeriodWeight?: number;
  @Input() secondPeriodWeight?: number;

  leftPeriodName = 'Período 1';
  rightPeriodName = 'Período 2';

  leftPercent = 50;

  isSubmitting = false;
  errorMessage = '';

  constructor(
    public readonly activeModal: NgbActiveModal,
    private readonly periodsService: PeriodsService
  ) {}

  ngOnInit(): void {
    this.leftPeriodName = this.firstPeriodName ? String(this.firstPeriodName) : this.leftPeriodName;
    this.rightPeriodName = this.secondPeriodName ? String(this.secondPeriodName) : this.rightPeriodName;

    const w1 = Number(this.firstPeriodWeight);
    const w2 = Number(this.secondPeriodWeight);

    const hasWeights = Number.isFinite(w1) && Number.isFinite(w2) && w1 >= 0 && w2 >= 0;
    if (!hasWeights) {
      return;
    }

    const p1 = Math.round(w1 * 100);
    if (!Number.isFinite(p1)) {
      return;
    }

    this.leftPercent = Math.min(100, Math.max(0, p1));
  }

  get rightPercent(): number {
    return 100 - this.leftPercent;
  }

  onSliderInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const n = Number(target?.value);
    if (!Number.isFinite(n)) {
      return;
    }

    this.leftPercent = Math.min(100, Math.max(0, Math.round(n)));
  }

  cancel(): void {
    if (this.isSubmitting) {
      return;
    }

    this.activeModal.dismiss('cancel');
  }

  save(): void {
    if (this.isSubmitting) {
      return;
    }

    const subjectId = Number(this.subjectId);
    if (Number.isNaN(subjectId) || subjectId <= 0) {
      this.errorMessage = 'Matéria inválida.';
      return;
    }

    const payload: UpdatePeriodsWeight = {
      firstPeriodWeight: this.leftPercent,
      secondPeriodWeight: this.rightPercent
    };

    this.isSubmitting = true;
    this.errorMessage = '';

    let didSucceed = false;
    this.periodsService
      .updatePeriodsWeight(subjectId, payload)
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
          this.activeModal.close(payload);
        },
        error: (err: unknown) => {
          this.errorMessage = getHttpErrorMessage(err, { fallback: 'Não foi possível salvar os pesos. Tente novamente.' });
        }
      });
  }
}
