import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of, Subject } from 'rxjs';
import { catchError, map, switchMap, takeUntil } from 'rxjs/operators';

import type { CardLevel, FlashcardDTO } from '../../../model/flashcards.model';
import { FlashcardsService } from '../../../services/flashcards.service';
import { SubjectsService } from '../../../services/subjects.service';

@Component({
  selector: 'app-flashcards-study',
  templateUrl: './flashcards-study.component.html',
  styleUrls: ['./flashcards-study.component.scss']
})
export class FlashcardsStudyComponent implements OnInit, OnDestroy {
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
    private readonly flashcardsService: FlashcardsService,
    private readonly subjectsService: SubjectsService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe((queryParams) => {
      const levelParam = queryParams.get('level');
      this.level = this.isCardLevel(levelParam) ? levelParam : null;

      this.loadFlashcards();
    });
  }

  goBack(): void {
    this.router.navigate(['/app/flashcards']);
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
    return !this.isLoading && !this.isPatching && this.selectedNextLevel !== null && this.flashcards.length > 0;
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
    this.isLoading = true;
    this.isPatching = false;
    this.isCompleted = false;
    this.errorMessage = '';
    this.flashcards = [];
    this.currentIndex = 0;
    this.showAnswer = false;
    this.selectedNextLevel = null;

    this.subjectsService
      .listPaged({
        page: 0,
        size: 500,
        sort: ['name,asc'],
        isActive: true
      })
      .pipe(
        map((page) => page.content.map((s) => s.id)),
        switchMap((subjectIds) => {
          if (!subjectIds.length) {
            return of([] as FlashcardDTO[]);
          }

          return forkJoin(
            subjectIds.map((subjectId) =>
              (this.level
                ? this.flashcardsService.listAllBySubjectAndLevel(subjectId, this.level, { page: 0, size: 1000 })
                : this.flashcardsService.listAllBySubject(subjectId, { page: 0, size: 1000 })
              ).pipe(
                map((p) => p.content),
                catchError(() => of([] as FlashcardDTO[]))
              )
            )
          ).pipe(map((lists) => lists.flat()));
        })
      )
      .subscribe({
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
