import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import type { FlashcardDTO } from '../../model/flashcards.model';
import { FlashcardsService } from '../../services/flashcards.service';
import { getHttpErrorMessage } from '../../utils/http-error.util';
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

  allFlashcards: FlashcardDTO[] = [];
  flashcards: FlashcardDTO[] = [];

  isLoading = false;
  errorMessage = '';

  page = 0;
  pageSize = 6;
  totalPages = 0;

  constructor(
    private readonly modalService: NgbModal,
    private readonly flashcardsService: FlashcardsService
  ) {}

  get hasItems(): boolean {
    return this.allFlashcards.length > 0;
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
      this.allFlashcards = [];
      this.flashcards = [];
      this.totalPages = 0;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.flashcardsService.listAllBySubject(subjectId).subscribe({
      next: (items) => {
        this.allFlashcards = items;
        this.applyPagination();
        this.isLoading = false;
      },
      error: (err: unknown) => {
        this.allFlashcards = [];
        this.flashcards = [];
        this.totalPages = 0;
        this.isLoading = false;
        this.errorMessage = getHttpErrorMessage(err, { fallback: 'Não foi possível carregar os flashcards.' });
      }
    });
  }

  applyPagination(): void {
    const total = this.allFlashcards.length;
    this.totalPages = total === 0 ? 0 : Math.ceil(total / this.pageSize);

    if (this.totalPages > 0 && this.page > this.totalPages - 1) {
      this.page = this.totalPages - 1;
    }

    const start = this.page * this.pageSize;
    this.flashcards = this.allFlashcards.slice(start, start + this.pageSize);
  }

  onPageChange(nextPage: number): void {
    if (nextPage === this.page) {
      return;
    }

    this.page = nextPage;
    this.applyPagination();
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
