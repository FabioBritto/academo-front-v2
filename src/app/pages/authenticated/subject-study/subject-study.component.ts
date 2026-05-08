import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import type { CardLevel, FlashcardDTO } from '../../../model/flashcards.model';
import { FlashcardsService } from '../../../services/flashcards.service';
import { SubjectsService } from '../../../services/subjects.service';

@Component({
  selector: 'app-subject-study',
  templateUrl: './subject-study.component.html',
  styleUrls: ['./subject-study.component.scss']
})
export class SubjectStudyComponent implements OnInit, OnDestroy {
  subjectId: number | null = null;
  level: CardLevel | null = null;

  subjectName: string | null = null;

  currentFlashcard: FlashcardDTO | null = null;
  pageIndex = 0;
  totalPages = 0;
  showAnswer = false;
  selectedNextLevel: CardLevel | null = null;

  isCompleted = false;

  isLoading = false;
  isPatching = false;
  errorMessage = '';

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly flashcardsService: FlashcardsService,
    private readonly subjectsService: SubjectsService
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.route.paramMap,
      this.route.queryParamMap
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([params, queryParams]) => {
        const idParam = params.get('id');
        const id = idParam ? Number(idParam) : NaN;
        this.subjectId = Number.isNaN(id) ? null : id;

        this.loadSubjectName();

        const levelParam = queryParams.get('level');
        this.level = this.isCardLevel(levelParam) ? levelParam : null;

        this.loadFlashcards();
      });
  }

  goBackToSubject(): void {
    if (this.subjectId) {
      this.router.navigate(['/app/materias', this.subjectId]);
      return;
    }

    this.router.navigate(['/app/materias']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get hasFlashcards(): boolean {
    return this.currentFlashcard !== null;
  }

  get canGoPrev(): boolean {
    return !this.isLoading && !this.isPatching && this.pageIndex > 0;
  }

  get canGoNext(): boolean {
    return (
      !this.isLoading &&
      !this.isPatching &&
      this.selectedNextLevel !== null &&
      this.currentFlashcard !== null
    );
  }

  get truncatedSubjectName(): string | null {
    const name = String(this.subjectName ?? '').trim();
    if (!name) {
      return null;
    }

    return name.length > 40 ? `${name.slice(0, 40)}...` : name;
  }

  private loadSubjectName(): void {
    const id = Number(this.subjectId);
    if (!Number.isFinite(id) || id <= 0) {
      this.subjectName = null;
      return;
    }

    this.subjectsService.getById(id).subscribe({
      next: (subject) => {
        this.subjectName = String(subject?.subjectDTO?.name ?? '').trim() || null;
      },
      error: () => {
        this.subjectName = null;
      }
    });
  }

  selectNextLevel(level: CardLevel): void {
    this.selectedNextLevel = level;
  }

  toggleAnswer(): void {
    if (!this.currentFlashcard) {
      return;
    }

    this.showAnswer = !this.showAnswer;
  }

  goPrev(): void {
    if (!this.canGoPrev) {
      return;
    }

    this.pageIndex = Math.max(0, this.pageIndex - 1);
    this.showAnswer = false;
    this.selectedNextLevel = null;
    this.loadFlashcards();
  }

  goNext(): void {
    const current = this.currentFlashcard;
    if (!current || !this.canGoNext || !this.selectedNextLevel) {
      return;
    }

    this.isPatching = true;
    this.errorMessage = '';

    this.flashcardsService.patchLevel(current.id, { level: this.selectedNextLevel }).subscribe({
      next: () => {
        this.isPatching = false;
        this.pageIndex = this.pageIndex + 1;
        this.showAnswer = false;
        this.selectedNextLevel = null;
        this.loadFlashcards();
      },
      error: () => {
        this.isPatching = false;
        this.errorMessage = 'Não foi possível atualizar o nível do flashcard. Tente novamente.';
      }
    });
  }

  private loadFlashcards(): void {
    const subjectId = Number(this.subjectId);
    if (Number.isNaN(subjectId) || subjectId <= 0) {
      this.currentFlashcard = null;
      this.pageIndex = 0;
      this.totalPages = 0;
      this.showAnswer = false;
      this.selectedNextLevel = null;
      this.isLoading = false;
      this.isPatching = false;
      this.errorMessage = '';
      return;
    }

    this.isLoading = true;
    this.isPatching = false;
    this.isCompleted = false;
    this.errorMessage = '';
    this.currentFlashcard = null;
    this.showAnswer = false;
    this.selectedNextLevel = null;

    const request$ = this.level
      ? this.flashcardsService.listAllBySubjectAndLevel(subjectId, this.level, { page: this.pageIndex, size: 1 })
      : this.flashcardsService.listAllBySubject(subjectId, { page: this.pageIndex, size: 1 });

    request$.subscribe({
      next: (page) => {
        this.totalPages = page.totalPages;
        this.currentFlashcard = page.content[0] ?? null;
        this.isCompleted = this.currentFlashcard === null;
        this.isLoading = false;
      },
      error: () => {
        this.currentFlashcard = null;
        this.isLoading = false;
        this.errorMessage = 'Não foi possível carregar os flashcards para estudo.';
      }
    });
  }

  private isCardLevel(value: string | null): value is CardLevel {
    return value === 'FACIL' || value === 'MEDIO' || value === 'DIFICIL' || value === 'MUITO_DIFICIL' || value === 'SEM_NIVEL';
  }
}
