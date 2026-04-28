import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import type { SubjectDTO } from '../../model/subjects.model';
import { SubjectsService } from '../../services/subjects.service';
import type { SortFilterOption } from '../sort-filters/sort-filters.component';
import { SubjectUpsertModalComponent } from '../subject-upsert-modal/subject-upsert-modal.component';

@Component({
  selector: 'app-subject-view-card',
  templateUrl: './subject-view-card.component.html',
  styleUrls: ['./subject-view-card.component.scss']
})
export class SubjectViewCardComponent implements OnInit {
  @Input() emptyMessage = 'Nenhuma matéria por aqui ainda.';

  showInactive = false;

  sort = 'updatedAt,desc';

  readonly sortOptions: SortFilterOption[] = [
    { label: 'Nome (A→Z)', value: 'name,asc' },
    { label: 'Nome (Z→A)', value: 'name,desc' },
    { label: 'Atualização (mais recente)', value: 'updatedAt,desc' },
    { label: 'Atualização (mais antiga)', value: 'updatedAt,asc' }
  ];

  allSubjects: SubjectDTO[] = [];

  subjects: SubjectDTO[] = [];

  page = 0;
  pageSize = 12;
  totalPages = 0;

  constructor(
    private readonly modalService: NgbModal,
    private readonly subjectsService: SubjectsService
  ) {}

  get hasItems(): boolean {
    return this.subjects.length > 0;
  }

  ngOnInit(): void {
    this.loadSubjects();
  }

  loadSubjects(): void {
    this.subjectsService
      .listPaged({
        page: this.page,
        size: this.pageSize,
        sort: [this.sort]
      })
      .subscribe({
        next: (page) => {
          this.allSubjects = page.content;
          this.applyActiveFilter();
          this.totalPages = page.totalPages;
        },
        error: () => {
          this.allSubjects = [];
          this.subjects = [];
          this.totalPages = 0;
        }
      });
  }

  applyActiveFilter(): void {
    if (this.showInactive) {
      this.subjects = this.allSubjects;
      return;
    }

    this.subjects = this.allSubjects.filter((s) => s.isActive);
  }

  toggleShowInactive(): void {
    this.showInactive = !this.showInactive;
    this.applyActiveFilter();
  }

  onSortChange(nextSort: string): void {
    if (nextSort === this.sort) {
      return;
    }

    this.sort = nextSort;
    this.page = 0;
    this.loadSubjects();
  }

  onPageChange(nextPage: number): void {
    if (nextPage === this.page) {
      return;
    }

    this.page = nextPage;
    this.loadSubjects();
  }

  openNewSubjectModal(): void {
    const modalRef = this.modalService.open(SubjectUpsertModalComponent, {
      centered: true,
      size: 'xl'
    });

    modalRef.closed.subscribe((result) => {
      if (result) {
        this.loadSubjects();
      }
    });
  }
}
