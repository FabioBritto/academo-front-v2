import { Component, HostListener, Input } from '@angular/core';
import { Router } from '@angular/router';

import type { SubjectDTO } from '../../model/subjects.model';

@Component({
  selector: 'app-subject-card',
  templateUrl: './subject-card.component.html',
  styleUrls: ['./subject-card.component.scss']
})
export class SubjectCardComponent {
  @Input({ required: true }) subject!: SubjectDTO;

  @Input() iconClass = 'bi bi-book-fill';

  constructor(private readonly router: Router) {}

  @HostListener('click')
  onHostClick(): void {
    void this.router.navigate(['/app/materias', this.subject.id]);
  }

  @HostListener('keydown.enter')
  onEnter(): void {
    void this.router.navigate(['/app/materias', this.subject.id]);
  }
}
