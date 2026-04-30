import { Component, Input, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import type { SubjectDTO } from '../../model/subjects.model';
import { SubjectFormComponent } from '../subject-form/subject-form.component';

@Component({
  selector: 'app-subject-upsert-modal',
  templateUrl: './subject-upsert-modal.component.html',
  styleUrls: ['./subject-upsert-modal.component.scss']
})
export class SubjectUpsertModalComponent {
  @Input() subject: SubjectDTO | null = null;

  @ViewChild(SubjectFormComponent) subjectForm?: SubjectFormComponent;

  imageSrc = 'assets/images/study-03.jpeg';
  imageAlt = 'Ilustração de estudo';

  get title(): string {
    return this.subject ? 'Editar Matéria' : 'Nova Matéria';
  }

  get isSubmitting(): boolean {
    return this.subjectForm?.isSubmitting ?? false;
  }

  constructor(public readonly activeModal: NgbActiveModal) {}

  close(): void {
    if (this.isSubmitting) {
      return;
    }

    this.activeModal.dismiss('close');
  }

  onSaveClick(): void {
    this.subjectForm?.submit();
  }

  onSaved(saved: SubjectDTO): void {
    this.activeModal.close(saved);
  }
}
