import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import type { FlashcardDTO } from '../../model/flashcards.model';
import { FlashcardsService } from '../../services/flashcards.service';
import { getHttpErrorMessage } from '../../utils/http-error.util';
import type { SortFilterOption } from '../sort-filters/sort-filters.component';
import { FlashcardUpsertModalComponent } from '../flashcard-upsert-modal/flashcard-upsert-modal.component';

@Component({
  selector: 'app-subject-flashcard-list',
  templateUrl: './subject-flashcard-list.component.html',
  styleUrls: ['./subject-flashcard-list.component.scss']
})
export class SubjectFlashcardListComponent {
  @Input() subjectId = 0;

  @Input() emptyMessage = 'Nenhum flashcard por enquanto.';

  @Output() changed = new EventEmitter<void>();

  flashcards: FlashcardDTO[] = [];

  isLoading = false;
  errorMessage = '';

  page = 0;
  pageSize = 6;
  totalPages = 0;

  sort = 'updatedAt,desc';

  readonly sortOptions: SortFilterOption[] = [
    { label: 'Atualização (mais recente)', value: 'updatedAt,desc' },
    { label: 'Atualização (mais antiga)', value: 'updatedAt,asc' }
  ];

  constructor(
    private readonly modalService: NgbModal,
    private readonly flashcardsService: FlashcardsService
  ) {}

  get hasItems(): boolean {
    return this.flashcards.length > 0;
  }

  ngOnInit(): void {
    this.loadFlashcards();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!('subjectId' in changes)) {
      return;
    }

    this.page = 0;
    this.loadFlashcards();
  }

  loadFlashcards(): void {
    const subjectId = Number(this.subjectId);
    if (Number.isNaN(subjectId) || subjectId <= 0) {
      this.flashcards = [];
      this.totalPages = 0;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.flashcardsService
      .listAllBySubject(subjectId, {
        page: this.page,
        size: this.pageSize,
        sort: [this.sort]
      })
      .subscribe({
        next: (page) => {
          this.flashcards = page.content;
          this.totalPages = page.totalPages;
          this.isLoading = false;
        },
        error: (err: unknown) => {
          this.flashcards = [];
          this.totalPages = 0;
          this.isLoading = false;
          this.errorMessage = getHttpErrorMessage(err, { fallback: 'Não foi possível carregar os flashcards.' });
        }
      });
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

  openCreateFlashcardModal(): void {
    const subjectId = Number(this.subjectId);

    if (Number.isNaN(subjectId) || subjectId <= 0) {
      return;
    }

    const modalRef = this.modalService.open(FlashcardUpsertModalComponent, {
      centered: true,
      size: 'xl'
    });

    modalRef.componentInstance.subjectId = subjectId;

    modalRef.closed.subscribe((result) => {
      if (result) {
        this.page = 0;
        this.loadFlashcards();
        this.changed.emit();
      }
    });
  }

  openExpandModal(flashcard: FlashcardDTO): void {
    const modalRef = this.modalService.open(FlashcardUpsertModalComponent, {
      centered: true,
      size: 'xl'
    });

    modalRef.componentInstance.subjectId = flashcard.subjectId;
    modalRef.componentInstance.flashcard = flashcard;

    modalRef.closed.subscribe((result) => {
      if (result) {
        this.loadFlashcards();
        this.changed.emit();
      }
    });
  }

  deleteFlashcard(flashcard: FlashcardDTO): void {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.flashcardsService.delete(flashcard.id).subscribe({
      next: () => {
        this.isLoading = false;
        this.page = 0;
        this.loadFlashcards();
        this.changed.emit();
      },
      error: (err: unknown) => {
        this.isLoading = false;
        this.errorMessage = getHttpErrorMessage(err, { fallback: 'Não foi possível excluir o flashcard.' });
      }
    });
  }
}
