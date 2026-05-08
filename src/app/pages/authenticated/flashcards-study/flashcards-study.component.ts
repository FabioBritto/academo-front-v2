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

  filterMode: 'all' | 'groups' | 'subjects' = 'all';
  subjectId: number | null = null;
  groupId: number | null = null;

  subjectName: string | null = null;

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

  private shuffle<T>(items: T[]): T[] {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe((queryParams) => {
      const levelParam = queryParams.get('level');
      this.level = this.isCardLevel(levelParam) ? levelParam : null;

      const filterModeParam = queryParams.get('filterMode');
      this.filterMode = filterModeParam === 'subjects' || filterModeParam === 'groups' || filterModeParam === 'all' ? filterModeParam : 'all';

      const subjectIdParam = queryParams.get('subjectId');
      this.subjectId = subjectIdParam ? Number(subjectIdParam) : null;

      const groupIdParam = queryParams.get('groupId');
      this.groupId = groupIdParam ? Number(groupIdParam) : null;

      this.loadSubjectName();
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

    if (this.filterMode === 'subjects') {
      if (!this.subjectId) {
        this.isLoading = false;
        this.errorMessage = 'Selecione uma matéria para estudar.';
        return;
      }

      const first$ = this.level
        ? this.flashcardsService.listAllBySubjectAndLevel(this.subjectId, this.level, { page: 0, size: 1000 })
        : this.flashcardsService.listAllBySubject(this.subjectId, { page: 0, size: 1000 });

      first$
        .pipe(
          switchMap((firstPage) => {
            if (firstPage.totalPages <= 1) {
              return of(firstPage.content);
            }

            const requests = Array.from({ length: firstPage.totalPages - 1 }, (_, idx) => {
              const pageRequest = { page: idx + 1, size: 1000 };
              return this.level
                ? this.flashcardsService.listAllBySubjectAndLevel(this.subjectId as number, this.level as CardLevel, pageRequest).pipe(map((p) => p.content))
                : this.flashcardsService.listAllBySubject(this.subjectId as number, pageRequest).pipe(map((p) => p.content));
            });

            return forkJoin(requests).pipe(map((pages) => [...firstPage.content, ...pages.flat()]));
          })
        )
        .subscribe({
          next: (items) => {
            this.flashcards = this.shuffle(items);
            this.isLoading = false;
          },
          error: () => {
            this.flashcards = [];
            this.isLoading = false;
            this.errorMessage = 'Não foi possível carregar os flashcards para estudo.';
          }
        });
      return;
    }

    if (this.filterMode === 'groups') {
      if (!this.groupId) {
        this.isLoading = false;
        this.errorMessage = 'Selecione um grupo para estudar.';
        return;
      }

      this.flashcardsService
        .listInGroup(this.groupId, this.level ?? undefined, { page: 0, size: 1000 })
        .pipe(
          switchMap((firstPage) => {
            if (firstPage.totalPages <= 1) {
              return of(firstPage.content);
            }

            const requests = Array.from({ length: firstPage.totalPages - 1 }, (_, idx) =>
              this.flashcardsService
                .listInGroup(this.groupId as number, this.level ?? undefined, { page: idx + 1, size: 1000 })
                .pipe(map((p) => p.content))
            );

            return forkJoin(requests).pipe(map((pages) => [...firstPage.content, ...pages.flat()]));
          })
        )
        .subscribe({
          next: (items) => {
            this.flashcards = this.shuffle(items);
            this.isLoading = false;
          },
          error: () => {
            this.flashcards = [];
            this.isLoading = false;
            this.errorMessage = 'Não foi possível carregar os flashcards para estudo.';
          }
        });
      return;
    }

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
          this.flashcards = this.shuffle(items);
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
