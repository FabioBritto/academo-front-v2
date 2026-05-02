import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import type { CardLevel, FlashcardDTO } from '../../model/flashcards.model';
import { FlashcardsService } from '../../services/flashcards.service';
import { getHttpErrorMessage } from '../../utils/http-error.util';

type StudyLevelOptionValue = 'TODOS' | CardLevel;

interface StudyLevelOption {
  label: string;
  value: StudyLevelOptionValue;
  style: 'neutral' | 'easy' | 'medium' | 'hard' | 'very-hard' | 'no-level';
}

@Component({
  selector: 'app-study-config-modal',
  templateUrl: './study-config-modal.component.html',
  styleUrls: ['./study-config-modal.component.scss']
})
export class StudyConfigModalComponent {
  @Input({ required: true }) subjectId!: number;

  readonly levelOptions: StudyLevelOption[] = [
    { label: 'TODOS', value: 'TODOS', style: 'neutral' },
    { label: 'FÁCIL', value: 'FACIL', style: 'easy' },
    { label: 'MÉDIO', value: 'MEDIO', style: 'medium' },
    { label: 'DIFÍCIL', value: 'DIFICIL', style: 'hard' },
    { label: 'MUITO DIFÍCIL', value: 'MUITO_DIFICIL', style: 'very-hard' },
    { label: 'SEM NÍVEL', value: 'SEM_NIVEL', style: 'no-level' }
  ];

  selectedLevel: StudyLevelOptionValue = 'TODOS';

  isLoading = false;
  errorMessage = '';

  private flashcards: FlashcardDTO[] = [];

  constructor(
    public readonly activeModal: NgbActiveModal,
    private readonly flashcardsService: FlashcardsService
  ) {}

  ngOnInit(): void {
    const subjectId = Number(this.subjectId);
    if (Number.isNaN(subjectId) || subjectId <= 0) {
      this.flashcards = [];
      this.errorMessage = 'Matéria inválida.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.flashcardsService.listAllBySubject(subjectId).subscribe({
      next: (items) => {
        this.flashcards = items;
        this.isLoading = false;
      },
      error: (err: unknown) => {
        this.flashcards = [];
        this.isLoading = false;
        this.errorMessage = getHttpErrorMessage(err, { fallback: 'Não foi possível carregar os flashcards.' });
      }
    });
  }

  get totalCount(): number {
    return this.flashcards.length;
  }

  countByLevel(level: CardLevel): number {
    return this.flashcards.filter((c) => c.level === level).length;
  }

  getCount(option: StudyLevelOption): number {
    if (option.value === 'TODOS') {
      return this.totalCount;
    }

    return this.countByLevel(option.value);
  }

  getOptionLabel(option: StudyLevelOption): string {
    return `${option.label} (${this.getCount(option)})`;
  }

  isOptionDisabled(option: StudyLevelOption): boolean {
    if (this.isLoading) {
      return true;
    }

    if (this.totalCount === 0) {
      return true;
    }

    if (option.value === 'TODOS') {
      return this.totalCount === 0;
    }

    return this.getCount(option) === 0;
  }

  selectLevel(value: StudyLevelOptionValue): void {
    if (this.isLoading) {
      return;
    }

    this.selectedLevel = value;
  }

  cancel(): void {
    this.activeModal.dismiss('cancel');
  }

  start(): void {
    if (this.isLoading) {
      return;
    }

    const level = this.selectedLevel === 'TODOS' ? undefined : this.selectedLevel;
    this.activeModal.close({ level });
  }
}
