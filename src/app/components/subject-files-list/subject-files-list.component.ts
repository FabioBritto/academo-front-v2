import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { SubjectFileUploadModalComponent } from '../subject-file-upload-modal/subject-file-upload-modal.component';

@Component({
  selector: 'app-subject-files-list',
  templateUrl: './subject-files-list.component.html',
  styleUrls: ['./subject-files-list.component.scss']
})
export class SubjectFilesListComponent {
  @Input({ required: true }) subjectId!: number;

  @Input() hasItems = false;

  @Input() emptyMessage = 'Nenhum arquivo por enquanto.';

  @Output() changed = new EventEmitter<void>();

  constructor(private readonly modalService: NgbModal) {}

  openUploadModal(): void {
    const modalRef = this.modalService.open(SubjectFileUploadModalComponent, {
      centered: true,
      size: 'lg'
    });

    modalRef.componentInstance.subjectId = this.subjectId;

    modalRef.closed.subscribe((result) => {
      if (result) {
        this.changed.emit();
      }
    });
  }
}
