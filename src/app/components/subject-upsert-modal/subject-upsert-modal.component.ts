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

  imageSrc = 'assets/images/study-01.jpeg';
  imageAlt = 'Ilustração de estudo';

  get title(): string {
    return this.subject ? 'Editar Matéria' : 'Nova Matéria';
  }

  get isSubmitting(): boolean {
    return this.subjectForm?.isSubmitting ?? false;
  }

  get isSaveDisabled(): boolean {
    return this.isSubmitting || (this.subjectForm?.form?.invalid ?? true);
  }

  constructor(public readonly activeModal: NgbActiveModal) {}

  close(): void {
    if (this.isSubmitting) {
      return;
    }

    this.activeModal.dismiss('close');
  }

  onSaveClick(): void {
    if (this.isSubmitting) {
      return;
    }

    this.subjectForm?.submit();
  }

  onSaved(saved: SubjectDTO): void {
    this.activeModal.close(saved);
  }
}
