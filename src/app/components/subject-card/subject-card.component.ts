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

  get displayName(): string {
    const name = this.subject?.name ?? '';
    const maxLen = 60;

    if (name.length <= maxLen) {
      return name;
    }

    const ellipsis = '...';
    const sliceLen = Math.max(0, maxLen - ellipsis.length);
    const sliced = name.slice(0, sliceLen).trimEnd();

    return `${sliced}${ellipsis}`;
  }

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
