import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { distinctUntilChanged } from 'rxjs';

import type { ActivityDTO } from '../../model/activities.model';
import type { PeriodDTO, UpdatePeriodDTO } from '../../model/periods.model';
import { ActivitiesService } from '../../services/activities.service';
import { PeriodsService } from '../../services/periods.service';
import { ToastService } from '../../services/toast.service';
import { getHttpErrorMessage } from '../../utils/http-error.util';
import { ActivityUpsertModalComponent } from '../activity-upsert-modal/activity-upsert-modal.component';
import { ActivityTypeFilterModalComponent } from '../activity-type-filter-modal/activity-type-filter-modal.component';
import { ActivityTypeWeightsModalComponent } from '../activity-type-weights-modal/activity-type-weights-modal.component';

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

  @Input() isExam = false;

  @Input() examDeleteDisabled = false;

  @Input() examDeleteSubmitting = false;

  @Input() pageSize = 6;

  @Input() emptyMessage = 'Nenhuma atividade por enquanto.';

  @Output() changed = new EventEmitter<void>();

  @Output() deleteExam = new EventEmitter<void>();

  page = 0;

  totalPages = 0;

  isLoading = false;

  errorMessage = '';

  isEditingExamGrade = false;
  isSavingExamGrade = false;
  examGradeErrorMessage = '';

  examGradeForm: FormGroup;

  activities: ActivityDTO[] = [];

  activityTypeFilterNames: string[] | null = null;

  constructor(
    private readonly modalService: NgbModal,
    private readonly activitiesService: ActivitiesService,
    private readonly toastService: ToastService,
    private readonly periodsService: PeriodsService,
    private readonly fb: FormBuilder
  ) {
    this.examGradeForm = this.fb.group({
      grade: [0, [Validators.required, Validators.min(0), Validators.max(10)]]
    });

    const gradeControl = this.examGradeForm.get('grade');
    if (gradeControl) {
      gradeControl.valueChanges.pipe(distinctUntilChanged()).subscribe((raw) => {
        const sanitized = this.sanitizeGrade(raw);
        if (sanitized == null) {
          return;
        }

        if (sanitized !== raw) {
          gradeControl.patchValue(sanitized, { emitEvent: false });
        }
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('period' in changes) {
      this.isEditingExamGrade = false;
      this.isSavingExamGrade = false;
      this.examGradeErrorMessage = '';

      const currentGrade = Number(this.period?.grade ?? 0);
      this.examGradeForm.patchValue({ grade: Number.isFinite(currentGrade) ? currentGrade : 0 }, { emitEvent: false });

      this.page = 0;
      if (this.isExam) {
        this.activities = [];
        this.totalPages = 0;
        this.errorMessage = '';
        this.isLoading = false;
        return;
      }

      this.loadActivities(0);
    }
  }

  startEditExamGrade(): void {
    if (!this.isExam || this.isSavingExamGrade) {
      return;
    }

    const currentGrade = Number(this.period?.grade ?? 0);
    this.examGradeForm.patchValue({ grade: Number.isFinite(currentGrade) ? currentGrade : 0 }, { emitEvent: false });
    this.examGradeErrorMessage = '';
    this.isEditingExamGrade = true;
  }

  cancelEditExamGrade(): void {
    if (this.isSavingExamGrade) {
      return;
    }

    const currentGrade = Number(this.period?.grade ?? 0);
    this.examGradeForm.patchValue({ grade: Number.isFinite(currentGrade) ? currentGrade : 0 }, { emitEvent: false });
    this.examGradeErrorMessage = '';
    this.isEditingExamGrade = false;
  }

  saveExamGrade(): void {
    if (!this.isExam || this.isSavingExamGrade) {
      return;
    }

    if (!this.period?.id) {
      return;
    }

    const subjectId = Number(this.subjectId);
    if (!Number.isFinite(subjectId) || subjectId <= 0) {
      this.examGradeErrorMessage = 'Matéria inválida.';
      return;
    }

    if (this.examGradeForm.invalid) {
      this.examGradeForm.markAllAsTouched();
      return;
    }

    const grade = Number(this.examGradeForm.get('grade')?.value ?? 0);
    if (!Number.isFinite(grade) || grade < 0 || grade > 10) {
      this.examGradeErrorMessage = 'Informe uma nota maior ou igual a 0 e menor ou igual a 10';
      return;
    }

    const payload: UpdatePeriodDTO = {
      subjectId,
      name: this.period.name,
      grade,
      weight: 100
    };

    this.isSavingExamGrade = true;
    this.examGradeErrorMessage = '';

    this.periodsService.update(this.period.id, payload).subscribe({
      next: (updated) => {
        this.isSavingExamGrade = false;
        this.isEditingExamGrade = false;

        if (updated && this.period) {
          this.period = {
            ...this.period,
            grade: updated.grade,
            name: updated.name,
            weight: updated.weight
          };
        }

        this.examGradeForm.patchValue({ grade: updated?.grade ?? grade }, { emitEvent: false });
        this.changed.emit();
      },
      error: (err: unknown) => {
        this.isSavingExamGrade = false;
        this.examGradeErrorMessage = getHttpErrorMessage(err, {
          fallback: 'Não foi possível salvar a nota do exame. Tente novamente.'
        });
      }
    });
  }

  private sanitizeGrade(raw: unknown): number | null {
    if (raw == null) {
      return 0;
    }

    let str = String(raw);
    str = str.replace(/[^0-9.,]/g, '');
    str = str.replace(/,/g, '.');

    const dotIndex = str.indexOf('.');
    if (dotIndex !== -1) {
      const integerPart = str.slice(0, dotIndex + 1);
      const fractionalPart = str
        .slice(dotIndex + 1)
        .replace(/\./g, '')
        .slice(0, 1);
      str = integerPart + fractionalPart;
    }

    if (str === '' || str === '.') {
      return 0;
    }

    const n = Number(str);
    return Number.isFinite(n) ? n : 0;
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
    if (this.isExam) {
      return;
    }

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
    if (this.isExam) {
      return;
    }

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
    if (this.isExam) {
      return;
    }

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
    if (this.isExam) {
      return;
    }

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

  openEditActivityTypeWeightsModal(): void {
    if (this.isExam) {
      return;
    }

    const periodId = this.period?.id;
    if (!periodId) {
      return;
    }

    const modalRef = this.modalService.open(ActivityTypeWeightsModalComponent, {
      centered: true,
      size: 'lg'
    });

    modalRef.componentInstance.periodId = periodId;

    modalRef.closed.subscribe(() => {
      this.toastService.show('Pesos atualizados com sucesso.', {
        classname: 'bg-success text-light',
        delay: 3500,
        autohide: true
      });
      this.changed.emit();
    });
  }

  onDeleteExam(): void {
    if (this.examDeleteDisabled || this.examDeleteSubmitting) {
      return;
    }

    this.deleteExam.emit();
  }
}
