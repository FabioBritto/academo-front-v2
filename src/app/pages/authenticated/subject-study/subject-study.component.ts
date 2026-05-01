import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import type { CardLevel } from '../../../model/flashcards.model';

@Component({
  selector: 'app-subject-study',
  templateUrl: './subject-study.component.html',
  styleUrls: ['./subject-study.component.scss']
})
export class SubjectStudyComponent implements OnInit {
  subjectId: number | null = null;
  level: CardLevel | null = null;

  constructor(private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;
    this.subjectId = Number.isNaN(id) ? null : id;

    const levelParam = this.route.snapshot.queryParamMap.get('level');
    this.level = this.isCardLevel(levelParam) ? levelParam : null;
  }

  private isCardLevel(value: string | null): value is CardLevel {
    return value === 'FACIL' || value === 'MEDIO' || value === 'DIFICIL' || value === 'MUITO_DIFICIL' || value === 'SEM_NIVEL';
  }
}
