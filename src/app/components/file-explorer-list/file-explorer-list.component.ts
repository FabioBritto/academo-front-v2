import { Component, EventEmitter, Input, Output } from '@angular/core';

import type { FileDTO } from '../../model/files.model';
import type { SubjectDTO } from '../../model/subjects.model';
import type { SortFilterOption } from '../sort-filters/sort-filters.component';

type ExplorerMode = 'subjects' | 'files';

@Component({
  selector: 'app-file-explorer-list',
  templateUrl: './file-explorer-list.component.html',
  styleUrls: ['./file-explorer-list.component.scss']
})
export class FileExplorerListComponent {
  @Input({ required: true }) mode!: ExplorerMode;
  @Input({ required: true }) title!: string;

  @Input() subjects: SubjectDTO[] = [];
  @Input() files: FileDTO[] = [];

  @Input() isLoading = false;
  @Input() errorMessage = '';
  @Input() emptyMessage = '';

  @Input() page = 0;
  @Input() totalPages = 0;

  @Input({ required: true }) sort!: string;
  @Input() sortOptions: SortFilterOption[] = [];

  @Input() primaryActionLabel = '';
  @Input() primaryActionIcon = '';
  @Input() showPrimaryAction = false;
  @Input() primaryActionDisabled = false;

  @Output() sortChange = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<number>();

  @Output() openSubject = new EventEmitter<SubjectDTO>();

  @Output() downloadFile = new EventEmitter<FileDTO>();
  @Output() deleteFile = new EventEmitter<FileDTO>();

  @Output() primaryAction = new EventEmitter<void>();

  get hasItems(): boolean {
    return this.mode === 'subjects' ? this.subjects.length > 0 : this.files.length > 0;
  }

  onSortChange(nextSort: string): void {
    this.sortChange.emit(nextSort);
  }

  onPageChange(nextPage: number): void {
    this.pageChange.emit(nextPage);
  }

  selectSubject(subject: SubjectDTO): void {
    if (this.isLoading) {
      return;
    }

    this.openSubject.emit(subject);
  }

  requestPrimaryAction(): void {
    if (this.primaryActionDisabled || this.isLoading) {
      return;
    }

    this.primaryAction.emit();
  }

  getFileTypeLabel(fileType: string): string {
    if (!fileType) {
      return '-';
    }

    const normalized = String(fileType).trim().toLowerCase();

    if (normalized === 'application/pdf') {
      return 'PDF';
    }

    if (normalized === 'text/plain') {
      return 'TXT';
    }

    if (normalized === 'text/csv') {
      return 'CSV';
    }

    if (normalized === 'image/jpeg') {
      return 'JPG';
    }

    if (normalized === 'image/png') {
      return 'PNG';
    }

    const tail = normalized.split('/').pop();
    if (tail && tail.length <= 8) {
      return tail.toUpperCase();
    }

    return normalized.toUpperCase();
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
