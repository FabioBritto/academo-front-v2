import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, distinctUntilChanged } from 'rxjs';

import type { Page } from '../../../model/common.model';
import type { FileDTO } from '../../../model/files.model';
import type { SubjectDTO } from '../../../model/subjects.model';
import { FilesService } from '../../../services/files.service';
import { SubjectsService } from '../../../services/subjects.service';
import { AuthSessionService } from '../../../services/auth-session.service';
import { getHttpErrorMessage } from '../../../utils/http-error.util';
import type { SortFilterOption } from '../../../components/sort-filters/sort-filters.component';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss']
})
export class FilesComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  readonly isPremium: boolean;

  subjects: SubjectDTO[] = [];
  files: FileDTO[] = [];

  isLoading = false;
  errorMessage = '';

  subjectId: number | null = null;
  subjectName = '';

  subjectsPage = 0;
  subjectsPageSize = 10;
  subjectsTotalPages = 0;
  subjectsSort = 'name,asc';

  filesPage = 0;
  filesPageSize = 10;
  filesTotalPages = 0;
  filesSort = 'name,asc';

  private readonly subjectsById = new Map<number, SubjectDTO>();

  readonly subjectsSortOptions: SortFilterOption[] = [
    { label: 'Nome (A→Z)', value: 'name,asc' },
    { label: 'Nome (Z→A)', value: 'name,desc' },
    { label: 'Criado (mais recente)', value: 'createdAt,desc' },
    { label: 'Criado (mais antigo)', value: 'createdAt,asc' },
    { label: 'Atualizado (mais recente)', value: 'updatedAt,desc' },
    { label: 'Atualizado (mais antigo)', value: 'updatedAt,asc' }
  ];

  readonly filesSortOptions: SortFilterOption[] = [
    { label: 'Nome (A→Z)', value: 'name,asc' },
    { label: 'Nome (Z→A)', value: 'name,desc' },
    { label: 'Adicionado (mais recente)', value: 'createdAt,desc' },
    { label: 'Adicionado (mais antigo)', value: 'createdAt,asc' },
    { label: 'Atualizado (mais recente)', value: 'updatedAt,desc' },
    { label: 'Atualizado (mais antigo)', value: 'updatedAt,asc' }
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly subjectsService: SubjectsService,
    private readonly filesService: FilesService,
    private readonly sessionService: AuthSessionService
  ) {
    this.isPremium = this.sessionService.isPremium();
  }

  get isInSubject(): boolean {
    return this.subjectId !== null;
  }

  get listTitle(): string {
    return this.isInSubject ? 'Lista de arquivos' : 'Lista de matérias';
  }

  get emptyMessage(): string {
    return this.isInSubject ? 'Nenhum arquivo por enquanto.' : 'Nenhuma matéria encontrada.';
  }

  ngOnInit(): void {
    if (!this.isPremium) {
      return;
    }

    this.route.queryParams
      .pipe(
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        takeUntil(this.destroy$)
      )
      .subscribe((params) => {
        const subjectIdParam = params['subjectId'];
        const nextSubjectId = subjectIdParam !== undefined && subjectIdParam !== null && subjectIdParam !== '' ? Number(subjectIdParam) : null;
        this.subjectId = Number.isFinite(nextSubjectId as number) ? (nextSubjectId as number) : null;

        this.subjectsPage = parseNumberParam(params['subjectsPage'], 0);
        this.subjectsSort = typeof params['subjectsSort'] === 'string' && params['subjectsSort'] ? params['subjectsSort'] : 'name,asc';

        this.filesPage = parseNumberParam(params['filesPage'], 0);
        this.filesSort = typeof params['filesSort'] === 'string' && params['filesSort'] ? params['filesSort'] : 'name,asc';

        if (this.subjectId) {
          this.loadFiles();
          this.ensureSubjectName();
        } else {
          this.subjectName = '';
          this.loadSubjects();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onBreadcrumbRootClick(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        subjectId: null
      },
      queryParamsHandling: 'merge'
    });
  }

  openSubject(subject: SubjectDTO): void {
    this.subjectsById.set(subject.id, subject);
    this.subjectName = subject.name;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        subjectId: subject.id,
        filesPage: 0
      },
      queryParamsHandling: 'merge'
    });
  }

  onSubjectsPageChange(nextPage: number): void {
    if (nextPage === this.subjectsPage) {
      return;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { subjectsPage: nextPage },
      queryParamsHandling: 'merge'
    });
  }

  onSubjectsSortChange(nextSort: string): void {
    if (nextSort === this.subjectsSort) {
      return;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { subjectsSort: nextSort, subjectsPage: 0 },
      queryParamsHandling: 'merge'
    });
  }

  onFilesPageChange(nextPage: number): void {
    if (nextPage === this.filesPage) {
      return;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { filesPage: nextPage },
      queryParamsHandling: 'merge'
    });
  }

  onFilesSortChange(nextSort: string): void {
    if (nextSort === this.filesSort) {
      return;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { filesSort: nextSort, filesPage: 0 },
      queryParamsHandling: 'merge'
    });
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
    this.isLoading = true;
    this.errorMessage = '';

    const shouldNavigateToFirstPage = this.filesPage !== 0;

    this.filesService.deleteFile(file.uuid).subscribe({
      next: () => {
        if (shouldNavigateToFirstPage) {
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { filesPage: 0 },
            queryParamsHandling: 'merge'
          });
          return;
        }

        this.filesPage = 0;
        this.loadFiles();
      },
      error: (err: unknown) => {
        this.isLoading = false;
        this.errorMessage = getHttpErrorMessage(err, { fallback: 'Não foi possível excluir o arquivo.' });
      }
    });
  }

  private loadSubjects(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.files = [];
    this.filesTotalPages = 0;

    this.subjectsService
      .listPaged({
        page: this.subjectsPage,
        size: this.subjectsPageSize,
        sort: [this.subjectsSort]
      })
      .subscribe({
        next: (page: Page<SubjectDTO>) => {
          this.subjects = page.content;
          this.subjectsTotalPages = page.totalPages;
          this.subjects.forEach((s) => this.subjectsById.set(s.id, s));
          this.isLoading = false;
        },
        error: (err: unknown) => {
          this.subjects = [];
          this.subjectsTotalPages = 0;
          this.isLoading = false;
          this.errorMessage = getHttpErrorMessage(err, { fallback: 'Não foi possível carregar as matérias.' });
        }
      });
  }

  private loadFiles(): void {
    if (!this.subjectId) {
      this.files = [];
      this.filesTotalPages = 0;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.subjects = [];
    this.subjectsTotalPages = 0;

    this.filesService
      .listBySubjectPaged(this.subjectId, {
        page: this.filesPage,
        size: this.filesPageSize,
        sort: [toFileSort(this.filesSort)]
      })
      .subscribe({
        next: (page: Page<FileDTO>) => {
          this.files = page.content;
          this.filesTotalPages = page.totalPages;
          this.isLoading = false;
        },
        error: (err: unknown) => {
          this.files = [];
          this.filesTotalPages = 0;
          this.isLoading = false;
          this.errorMessage = getHttpErrorMessage(err, { fallback: 'Não foi possível carregar os arquivos.' });
        }
      });
  }

  private ensureSubjectName(): void {
    if (!this.subjectId) {
      this.subjectName = '';
      return;
    }

    const cached = this.subjectsById.get(this.subjectId);
    if (cached) {
      this.subjectName = cached.name;
      return;
    }

    this.subjectsService.getById(this.subjectId).subscribe({
      next: (resp) => {
        this.subjectName = resp.subjectDTO.name;
        this.subjectsById.set(resp.subjectDTO.id, resp.subjectDTO);
      },
      error: () => {
        this.subjectName = 'Matéria';
      }
    });
  }
}

function parseNumberParam(value: unknown, fallback: number): number {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toFileSort(sort: string): string {
  if (sort.startsWith('name,')) {
    return sort.replace(/^name,/, 'fileName,');
  }

  return sort;
}
