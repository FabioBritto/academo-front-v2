import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import type { FileDTO } from '../../model/files.model';
import { FilesService } from '../../services/files.service';
import { getHttpErrorMessage } from '../../utils/http-error.util';
import { SubjectFileUploadModalComponent } from '../subject-file-upload-modal/subject-file-upload-modal.component';

@Component({
  selector: 'app-subject-files-list',
  templateUrl: './subject-files-list.component.html',
  styleUrls: ['./subject-files-list.component.scss']
})
export class SubjectFilesListComponent implements OnInit, OnChanges {
  @Input({ required: true }) subjectId!: number;

  @Input() emptyMessage = 'Nenhum arquivo por enquanto.';

  @Output() changed = new EventEmitter<void>();

  files: FileDTO[] = [];

  isLoading = false;
  errorMessage = '';

  page = 0;
  pageSize = 6;
  totalPages = 0;
  sort = 'createdAt,desc';

  constructor(
    private readonly modalService: NgbModal,
    private readonly filesService: FilesService
  ) {}

  get hasItems(): boolean {
    return this.files.length > 0;
  }

  ngOnInit(): void {
    this.loadFiles();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!('subjectId' in changes)) {
      return;
    }

    this.page = 0;
    this.loadFiles();
  }

  loadFiles(): void {
    if (!this.subjectId) {
      this.files = [];
      this.totalPages = 0;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.filesService
      .listBySubjectPaged(this.subjectId, {
        page: this.page,
        size: this.pageSize,
        sort: [this.sort]
      })
      .subscribe({
        next: (page) => {
          this.files = page.content;
          this.totalPages = page.totalPages;
          this.isLoading = false;
        },
        error: (err: unknown) => {
          this.files = [];
          this.totalPages = 0;
          this.isLoading = false;
          this.errorMessage = getHttpErrorMessage(err, { fallback: 'Não foi possível carregar os arquivos.' });
        }
      });
  }

  openUploadModal(): void {
    const modalRef = this.modalService.open(SubjectFileUploadModalComponent, {
      centered: true,
      size: 'lg'
    });

    modalRef.componentInstance.subjectId = this.subjectId;

    modalRef.closed.subscribe((result) => {
      if (result) {
        this.page = 0;
        this.loadFiles();
        this.changed.emit();
      }
    });
  }

  onPageChange(nextPage: number): void {
    if (nextPage === this.page) {
      return;
    }

    this.page = nextPage;
    this.loadFiles();
  }

  download(file: FileDTO): void {
    this.filesService.downloadFile(file.uuid).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.fileName;
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      },
      error: (err: unknown) => {
        this.errorMessage = getHttpErrorMessage(err, { fallback: 'Não foi possível baixar o arquivo.' });
      }
    });
  }

  delete(file: FileDTO): void {
    const ok = window.confirm(`Tem certeza que deseja excluir o arquivo "${file.fileName}"?`);
    if (!ok) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.filesService.deleteFile(file.uuid).subscribe({
      next: () => {
        this.isLoading = false;
        this.page = 0;
        this.loadFiles();
        this.changed.emit();
      },
      error: (err: unknown) => {
        this.isLoading = false;
        this.errorMessage = getHttpErrorMessage(err, { fallback: 'Não foi possível excluir o arquivo.' });
      }
    });
  }

  formatBytes(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes < 0) {
      return '-';
    }

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }

    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  }
}
