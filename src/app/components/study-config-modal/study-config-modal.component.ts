import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import type { CardLevel } from '../../model/flashcards.model';

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

  constructor(public readonly activeModal: NgbActiveModal) {}

  selectLevel(value: StudyLevelOptionValue): void {
    this.selectedLevel = value;
  }

  cancel(): void {
    this.activeModal.dismiss('cancel');
  }

  start(): void {
    const level = this.selectedLevel === 'TODOS' ? undefined : this.selectedLevel;
    this.activeModal.close({ level });
  }
}
