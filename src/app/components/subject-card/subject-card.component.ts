import { Component, Input } from '@angular/core';

import type { SubjectDTO } from '../../model/subjects.model';

@Component({
  selector: 'app-subject-card',
  templateUrl: './subject-card.component.html',
  styleUrls: ['./subject-card.component.scss']
})
export class SubjectCardComponent {
  @Input({ required: true }) subject!: SubjectDTO;

  @Input() iconClass = 'bi bi-book-fill';
}
