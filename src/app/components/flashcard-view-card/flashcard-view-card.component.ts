import { Component, Input, OnInit } from '@angular/core';

import type { FlashcardDTO } from '../../model/flashcards.model';
import type { SubjectDTO } from '../../model/subjects.model';
import { FlashcardsService } from '../../services/flashcards.service';
import { SubjectsService } from '../../services/subjects.service';
import type { SortFilterOption } from '../sort-filters/sort-filters.component';

@Component({
  selector: 'app-flashcard-view-card',
  templateUrl: './flashcard-view-card.component.html',
  styleUrls: ['./flashcard-view-card.component.scss']
})
export class FlashcardViewCardComponent implements OnInit {
  @Input() emptyMessage = 'Nenhum flashcard por aqui ainda.';

  sort = 'updatedAt,desc';

  readonly sortOptions: SortFilterOption[] = [
    { label: 'Nome (A→Z)', value: 'frontPart,asc' },
    { label: 'Nome (Z→A)', value: 'frontPart,desc' },
    { label: 'Atualização (mais recente)', value: 'updatedAt,desc' },
    { label: 'Atualização (mais antiga)', value: 'updatedAt,asc' }
  ];

  flashcards: FlashcardDTO[] = [];

  page = 0;
  pageSize = 12;
  totalPages = 0;

  private subjectNameById = new Map<number, string>();

  constructor(
    private readonly flashcardsService: FlashcardsService,
    private readonly subjectsService: SubjectsService
  ) {}

  get hasItems(): boolean {
    return this.flashcards.length > 0;
  }

  ngOnInit(): void {
    this.loadSubjectsIndex();
    this.loadFlashcards();
  }

  loadFlashcards(): void {
    this.flashcardsService
      .listPaged({
        page: this.page,
        size: this.pageSize,
        sort: [this.sort]
      })
      .subscribe({
        next: (page) => {
          this.flashcards = page.content;
          this.totalPages = page.totalPages;
        },
        error: () => {
          this.flashcards = [];
          this.totalPages = 0;
        }
      });
  }

  private loadSubjectsIndex(): void {
    this.subjectsService
      .listPaged({
        page: 0,
        size: 500,
        sort: ['name,asc']
      })
      .subscribe({
        next: (page) => {
          this.setSubjectsIndex(page.content);
        },
        error: () => {
          this.subjectNameById = new Map<number, string>();
        }
      });
  }

  private setSubjectsIndex(subjects: SubjectDTO[]): void {
    this.subjectNameById = new Map(subjects.map((s) => [s.id, s.name]));
  }

  subjectName(subjectId: number): string {
    return this.subjectNameById.get(Number(subjectId)) ?? `Matéria #${subjectId}`;
  }

  onSortChange(nextSort: string): void {
    if (nextSort === this.sort) {
      return;
    }

    this.sort = nextSort;
    this.page = 0;
    this.loadFlashcards();
  }

  onPageChange(nextPage: number): void {
    if (nextPage === this.page) {
      return;
    }

    this.page = nextPage;
    this.loadFlashcards();
  }
}
