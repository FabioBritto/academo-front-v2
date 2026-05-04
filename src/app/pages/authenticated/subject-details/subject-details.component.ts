import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import type { SubjectDTO } from '../../../model/subjects.model';
import { SubjectsService } from '../../../services/subjects.service';
import { ToastService } from '../../../services/toast.service';
import type { TabOption } from '../../../components/tabs/tabs.component';
import { SubjectUpsertModalComponent } from '../../../components/subject-upsert-modal/subject-upsert-modal.component';
import { StudyConfigModalComponent } from '../../../components/study-config-modal/study-config-modal.component';
import { WeightedAverageConfigModalComponent } from '../../../components/weighted-average-config-modal/weighted-average-config-modal.component';
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

  periodTab = 'period1';
  contentTab = 'files';

  periodOptions: TabOption[] = [];

  readonly contentOptions: TabOption[] = [
    { label: 'Flashcards', value: 'flashcards' },
    { label: 'Arquivos', value: 'files' }
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly modalService: NgbModal,
    private readonly subjectsService: SubjectsService,
    private readonly toastService: ToastService
  ) {}

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
      },
      error: () => {
        this.subject = null;
        this.periods = [];
        this.periodOptions = [];
      }
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
        { label: 'Período 2', value: 'period2' }
      ];
    }

    return [
      { label: 'Período 1', value: 'period1' },
      { label: 'Período 2', value: 'period2' },
      { label: 'Exame', value: 'exam' }
    ];
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
    return this.subject?.name ?? 'Carregando...';
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
