import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import type { CardLevel, FlashcardDTO } from '../../../model/flashcards.model';
import { FlashcardsService } from '../../../services/flashcards.service';

@Component({
  selector: 'app-subject-study',
  templateUrl: './subject-study.component.html',
  styleUrls: ['./subject-study.component.scss']
})
export class SubjectStudyComponent implements OnInit, OnDestroy {
  subjectId: number | null = null;
  level: CardLevel | null = null;

  flashcards: FlashcardDTO[] = [];
  currentIndex = 0;
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
    private readonly flashcardsService: FlashcardsService
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
    return this.flashcards.length > 0;
  }

  get currentFlashcard(): FlashcardDTO | null {
    return this.flashcards[this.currentIndex] ?? null;
  }

  get canGoPrev(): boolean {
    return !this.isLoading && !this.isPatching && this.currentIndex > 0;
  }

  get canGoNext(): boolean {
    return (
      !this.isLoading &&
      !this.isPatching &&
      this.selectedNextLevel !== null &&
      this.flashcards.length > 0
    );
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

    this.currentIndex = Math.max(0, this.currentIndex - 1);
    this.showAnswer = false;
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
        const isLast = this.currentIndex >= this.flashcards.length - 1;
        if (isLast) {
          this.isCompleted = true;
          this.showAnswer = false;
          this.selectedNextLevel = null;
          return;
        }

        this.currentIndex = Math.min(this.flashcards.length - 1, this.currentIndex + 1);
        this.showAnswer = false;
        this.selectedNextLevel = null;
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
      this.flashcards = [];
      this.currentIndex = 0;
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
    this.flashcards = [];
    this.currentIndex = 0;
    this.showAnswer = false;
    this.selectedNextLevel = null;

    const request$ = this.level
      ? this.flashcardsService.listAllBySubjectAndLevel(subjectId, this.level)
      : this.flashcardsService.listAllBySubject(subjectId);

    request$.subscribe({
      next: (items) => {
        this.flashcards = items;
        this.isLoading = false;
      },
      error: () => {
        this.flashcards = [];
        this.isLoading = false;
        this.errorMessage = 'Não foi possível carregar os flashcards para estudo.';
      }
    });
  }

  private isCardLevel(value: string | null): value is CardLevel {
    return value === 'FACIL' || value === 'MEDIO' || value === 'DIFICIL' || value === 'MUITO_DIFICIL' || value === 'SEM_NIVEL';
  }
}
