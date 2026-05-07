import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import type { SubjectDTO } from '../../../model/subjects.model';
import { SubjectsService } from '../../../services/subjects.service';
import { PeriodsService } from '../../../services/periods.service';
import { ToastService } from '../../../services/toast.service';
import type { TabOption } from '../../../components/tabs/tabs.component';
import { SubjectUpsertModalComponent } from '../../../components/subject-upsert-modal/subject-upsert-modal.component';
import { StudyConfigModalComponent } from '../../../components/study-config-modal/study-config-modal.component';
import { WeightedAverageConfigModalComponent } from '../../../components/weighted-average-config-modal/weighted-average-config-modal.component';
import { ActivityUpsertModalComponent } from '../../../components/activity-upsert-modal/activity-upsert-modal.component';
import { getHttpErrorMessage } from '../../../utils/http-error.util';
import type { CardLevel } from '../../../model/flashcards.model';
import type { PeriodDTO } from '../../../model/periods.model';

@Component({
  selector: 'app-subject-details',
  templateUrl: './subject-details.component.html',
  styleUrls: ['./subject-details.component.scss']
})
export class SubjectDetailsComponent implements OnInit {
  subject: SubjectDTO | null = null;

  periods: PeriodDTO[] = [];

  isDeleting = false;

  isDeletingExam = false;

  periodTab = 'period1';
  contentTab = 'files';

  periodOptions: TabOption[] = [];

  isCreatingExam = false;

  private hasOpenedEditActivityModal = false;

  readonly contentOptions: TabOption[] = [
    { label: 'Flashcards', value: 'flashcards' },
    { label: 'Arquivos', value: 'files' }
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly modalService: NgbModal,
    private readonly subjectsService: SubjectsService,
    private readonly periodsService: PeriodsService,
    private readonly toastService: ToastService
  ) {}

  get displayName(): string {
    const name = this.subject?.name ?? '';
    const maxLen = 60;

    if (name.length <= maxLen) {
      return name;
    }

    const ellipsis = '...';
    const sliceLen = Math.max(0, maxLen - ellipsis.length);
    const sliced = name.slice(0, sliceLen).trimEnd();

    return `${sliced}${ellipsis}`;
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (!idParam || Number.isNaN(id)) {
      this.subject = null;
      return;
    }

    this.loadSubject(id);
  }

  openWeightedAverageConfigModal(): void {
    if (!this.subject) {
      return;
    }

    const subjectId = this.subject.id;

    const p1 = this.periods[0];
    const p2 = this.periods[1];
    if (!p1 || !p2) {
      return;
    }

    const modalRef = this.modalService.open(WeightedAverageConfigModalComponent, {
      centered: true,
      size: 'lg'
    });

    modalRef.componentInstance.subjectId = subjectId;
    modalRef.componentInstance.firstPeriodName = p1.name;
    modalRef.componentInstance.secondPeriodName = p2.name;
    modalRef.componentInstance.firstPeriodWeight = p1.weight;
    modalRef.componentInstance.secondPeriodWeight = p2.weight;

    modalRef.closed.subscribe(() => {
      this.toastService.show('Pesos atualizados com sucesso.', {
        classname: 'bg-success text-light',
        delay: 3500,
        autohide: true
      });

      this.loadSubject(subjectId);
    });
  }

  loadSubject(subjectId: number): void {
    this.subjectsService.getById(subjectId).subscribe({
      next: (response) => {
        this.subject = response.subjectDTO;
        this.periods = [...(response.periodsDTO ?? [])].sort((a, b) => a.id - b.id);
        this.periodOptions = this.buildPeriodOptions(this.periods);

        if (this.periodOptions.length > 0) {
          const active = this.periodOptions.some((o) => o.value === this.periodTab);
          if (!active) {
            this.periodTab = this.periodOptions[0].value;
          }
        }

        this.tryOpenEditActivityModal();
      },
      error: () => {
        this.subject = null;
        this.periods = [];
        this.periodOptions = [];
      }
    });
  }

  private tryOpenEditActivityModal(): void {
    if (this.hasOpenedEditActivityModal || !this.subject) {
      return;
    }

    const editActivityIdParam = this.route.snapshot.queryParamMap.get('editActivityId');
    const periodIdParam = this.route.snapshot.queryParamMap.get('periodId');

    const editActivityId = editActivityIdParam ? Number(editActivityIdParam) : NaN;
    const periodId = periodIdParam ? Number(periodIdParam) : NaN;

    if (!Number.isFinite(editActivityId) || editActivityId <= 0) {
      return;
    }

    if (!Number.isFinite(periodId) || periodId <= 0) {
      return;
    }

    this.hasOpenedEditActivityModal = true;

    const modalRef = this.modalService.open(ActivityUpsertModalComponent, {
      centered: true,
      size: 'xl'
    });

    modalRef.componentInstance.subjectId = this.subject.id;
    modalRef.componentInstance.periodId = periodId;
    modalRef.componentInstance.activityId = editActivityId;

    const clearParams = () => {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          editActivityId: null,
          periodId: null
        },
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    };

    modalRef.closed.subscribe(() => {
      clearParams();
      this.onActivitiesChanged();
    });

    modalRef.dismissed.subscribe(() => {
      clearParams();
    });
  }

  onActivitiesChanged(): void {
    const subjectId = this.subject?.id;
    if (!subjectId) {
      return;
    }

    this.loadSubject(subjectId);
  }

  private buildPeriodOptions(periods: PeriodDTO[]): TabOption[] {
    if (periods.length <= 0) {
      return [];
    }

    if (periods.length === 1) {
      return [{ label: 'Período 1', value: 'period1' }];
    }

    if (periods.length === 2) {
      return [
        { label: 'Período 1', value: 'period1' },
        { label: 'Período 2', value: 'period2' },
        {
          label: '',
          value: 'addExam',
          iconClass: 'bi bi-plus-lg',
          ariaLabel: 'Adicionar exame'
        }
      ];
    }

    return [
      { label: 'Período 1', value: 'period1' },
      { label: 'Período 2', value: 'period2' },
      { label: 'Exame', value: 'exam' }
    ];
  }

  private hasExamPeriod(): boolean {
    return (this.periods?.length ?? 0) >= 3;
  }

  onDeleteExam(): void {
    const subjectId = this.subject?.id;
    const examPeriodId = this.periods?.[2]?.id;
    if (!subjectId || !examPeriodId || this.isDeletingExam) {
      return;
    }

    this.isDeletingExam = true;
    this.periodsService.delete(subjectId, examPeriodId).subscribe({
      next: () => {
        this.isDeletingExam = false;
        this.toastService.show('Exame excluído com sucesso.', {
          classname: 'bg-success text-light',
          delay: 3500,
          autohide: true
        });
        this.periodTab = 'period1';
        this.loadSubject(subjectId);
      },
      error: (err: unknown) => {
        this.isDeletingExam = false;
        this.toastService.show(
          getHttpErrorMessage(err, { fallback: 'Não foi possível excluir o exame. Tente novamente.' }),
          { classname: 'bg-danger text-light', delay: 4500, autohide: true }
        );
      }
    });
  }

  get selectedPeriod(): PeriodDTO | null {
    if (this.periods.length <= 0) {
      return null;
    }

    if (this.periodTab === 'period1') {
      return this.periods[0] ?? null;
    }

    if (this.periodTab === 'period2') {
      return this.periods[1] ?? null;
    }

    if (this.periodTab === 'exam') {
      return this.periods[2] ?? null;
    }

    return null;
  }

  get weightedButtonLabel(): string {
    if (this.subject?.calculationType !== 'MEDIA_PONDERADA') {
      return 'Média Ponderada';
    }

    const p1 = this.periods[0];
    const p2 = this.periods[1];
    if (!p1 || !p2) {
      return 'Média Ponderada';
    }

    const w1 = Math.round(Number(p1.weight) * 100);
    const w2 = Math.round(Number(p2.weight) * 100);
    if (!Number.isFinite(w1) || !Number.isFinite(w2)) {
      return 'Média Ponderada';
    }

    return `Média Ponderada (${w1}% / ${w2}%)`;
  }

  formatWeightPercent(weight: number | null | undefined): string {
    const w = Number(weight);
    if (!Number.isFinite(w)) {
      return '-';
    }

    return `${Math.round(w * 100)}%`;
  }

  onDeleteSubject(): void {
    if (!this.subject || this.isDeleting) {
      return;
    }

    this.isDeleting = true;

    this.subjectsService.delete(this.subject.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.toastService.show('Matéria excluída com sucesso.', {
          classname: 'bg-success text-light',
          delay: 3500,
          autohide: true
        });
        this.router.navigate(['/app/materias']);
      },
      error: (err: unknown) => {
        this.isDeleting = false;
        this.toastService.show(getHttpErrorMessage(err, {
          fallback: 'Não foi possível excluir a matéria. Tente novamente.'
        }), {
          classname: 'bg-danger text-light',
          delay: 4500,
          autohide: true
        });
      }
    });
  }

  openEditSubjectModal(): void {
    if (!this.subject) {
      return;
    }

    const modalRef = this.modalService.open(SubjectUpsertModalComponent, {
      centered: true,
      size: 'xl'
    });

    modalRef.componentInstance.subject = this.subject;

    modalRef.closed.subscribe((result) => {
      if (result && this.subject) {
        this.loadSubject(this.subject.id);
      }
    });
  }

  onPeriodTabChange(nextValue: string): void {
    if (nextValue === 'addExam') {
      const subjectId = this.subject?.id;
      if (!subjectId || this.isCreatingExam) {
        return;
      }

      if (this.hasExamPeriod()) {
        this.periodTab = 'exam';
        return;
      }

      this.isCreatingExam = true;
      this.periodsService.createExam({ subjectId }).subscribe({
        next: () => {
          this.isCreatingExam = false;
          this.periodTab = 'exam';
          this.loadSubject(subjectId);
        },
        error: (err: unknown) => {
          this.isCreatingExam = false;
          this.toastService.show(
            getHttpErrorMessage(err, { fallback: 'Não foi possível criar o exame. Tente novamente.' }),
            { classname: 'bg-danger text-light', delay: 4500, autohide: true }
          );
        }
      });
      return;
    }

    this.periodTab = nextValue;
  }

  onContentTabChange(nextValue: string): void {
    this.contentTab = nextValue;
  }

  openStudyConfigModal(): void {
    if (!this.subject) {
      return;
    }

    const modalRef = this.modalService.open(StudyConfigModalComponent, {
      centered: true,
      size: 'lg'
    });

    modalRef.componentInstance.subjectId = this.subject.id;

    modalRef.closed.subscribe((result: { level?: CardLevel } | undefined) => {
      if (!result || !this.subject) {
        return;
      }

      const level = result.level;
      if (level) {
        this.router.navigate([`/app/materias/${this.subject.id}/estudar`], { queryParams: { level } });
        return;
      }

      this.router.navigate([`/app/materias/${this.subject.id}/estudar`]);
    });
  }

  onFilesChanged(): void {
    // Placeholder: when files list is implemented, trigger refresh here.
  }

  onFlashcardsChanged(): void {
    // Placeholder: when flashcards list is implemented, trigger refresh here.
  }

  get breadcrumbLabel(): string {
    return this.displayName || 'Carregando...';
  }

  get calculationTypeLabel(): string {
    const type = this.subject?.calculationType;

    if (type === 'MEDIA_ARITMETICA') {
      return 'Média Aritmética';
    }

    if (type === 'MEDIA_PONDERADA') {
      return 'Média Ponderada';
    }

    return '-';
  }

  get finalGradeDisplay(): string {
    const g = this.subject?.finalGrade;
    return g === null || g === undefined ? '-' : String(g);
  }

  get passingGradeDisplay(): string {
    const g = this.subject?.passingGrade;
    return g === null || g === undefined ? '-' : String(g);
  }

  get isActiveLabel(): string {
    return this.subject?.isActive ? 'Ativa' : 'Inativa';
  }

  get isActiveBadgeClass(): string {
    return this.subject?.isActive ? 'text-bg-success' : 'text-bg-secondary';
  }
}
