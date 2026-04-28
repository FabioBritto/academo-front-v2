import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { ALLOWED_FILE_TYPES, ALLOWED_FILE_TYPES_SET } from '../../model/files.model';
import { FilesService } from '../../services/files.service';
import { getHttpErrorMessage } from '../../utils/http-error.util';

@Component({
  selector: 'app-subject-file-upload-modal',
  templateUrl: './subject-file-upload-modal.component.html',
  styleUrls: ['./subject-file-upload-modal.component.scss']
})
export class SubjectFileUploadModalComponent {
  @Input({ required: true }) subjectId!: number;

  readonly maxBytes = 1 * 1024 * 1024;
  readonly maxSizeLabel = '1MB';
  readonly supportedTypesLabel = 'JPG, PNG, PDF, DOC, DOCX, XLS, XLSX, CSV, TXT';
  readonly accept = ALLOWED_FILE_TYPES.join(',');

  selectedFile: File | null = null;

  isSubmitting = false;
  validationMessage = '';
  errorMessage = '';

  constructor(
    public readonly activeModal: NgbActiveModal,
    private readonly filesService: FilesService
  ) {}

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.item(0) ?? null;

    this.selectedFile = file;
    this.validationMessage = '';
    this.errorMessage = '';

    if (file) {
      this.validateFile(file);
    }
  }

  close(): void {
    if (this.isSubmitting) {
      return;
    }

    this.activeModal.dismiss('close');
  }

  upload(): void {
    if (this.isSubmitting) {
      return;
    }

    if (!this.selectedFile) {
      this.validationMessage = 'Selecione um arquivo para enviar.';
      return;
    }

    const validation = this.validateFile(this.selectedFile);
    if (!validation) {
      return;
    }

    this.isSubmitting = true;
    this.validationMessage = '';
    this.errorMessage = '';

    this.filesService.uploadFile(this.subjectId, this.selectedFile).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.activeModal.close('uploaded');
      },
      error: (err: unknown) => {
        this.isSubmitting = false;
        this.errorMessage = getHttpErrorMessage(err, { fallback: 'Não foi possível fazer upload do arquivo.' });
      }
    });
  }

  private validateFile(file: File): boolean {
    if (file.size > this.maxBytes) {
      this.validationMessage = `Arquivo excede o limite de ${this.maxSizeLabel}.`;
      return false;
    }

    if (!ALLOWED_FILE_TYPES_SET.has(file.type)) {
      this.validationMessage = 'Tipo de arquivo não suportado.';
      return false;
    }

    this.validationMessage = '';
    return true;
  }
}
