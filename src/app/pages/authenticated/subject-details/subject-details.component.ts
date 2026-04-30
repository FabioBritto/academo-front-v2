import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import type { SubjectDTO } from '../../../model/subjects.model';
import { SubjectsService } from '../../../services/subjects.service';
import { ToastService } from '../../../services/toast.service';
import type { TabOption } from '../../../components/tabs/tabs.component';
import { SubjectUpsertModalComponent } from '../../../components/subject-upsert-modal/subject-upsert-modal.component';
import { getHttpErrorMessage } from '../../../utils/http-error.util';

@Component({
  selector: 'app-subject-details',
  templateUrl: './subject-details.component.html',
  styleUrls: ['./subject-details.component.scss']
})
export class SubjectDetailsComponent implements OnInit {
  subject: SubjectDTO | null = null;

  isDeleting = false;

  periodTab = 'period1';
  contentTab = 'files';

  readonly periodOptions: TabOption[] = [
    { label: 'Período 1', value: 'period1' },
    { label: 'Período 2', value: 'period2' }
  ];

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

  loadSubject(subjectId: number): void {
    this.subjectsService.getById(subjectId).subscribe({
      next: (subject) => {
        this.subject = subject;
      },
      error: () => {
        this.subject = null;
      }
    });
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
