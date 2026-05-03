import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import type { FlashcardDTO } from '../../model/flashcards.model';
import type { CardLevel } from '../../model/flashcards.model';
import type { Page } from '../../model/common.model';
import type { SubjectDTO } from '../../model/subjects.model';
import { FlashcardsService } from '../../services/flashcards.service';
import { GroupsService } from '../../services/groups.service';
import { SubjectsService } from '../../services/subjects.service';
import type { SortFilterOption } from '../sort-filters/sort-filters.component';
import type { AdvancedDropdownItem } from '../advanced-dropdown/advanced-dropdown.component';
import { StudyConfigGlobalModalComponent } from '../study-config-global-modal/study-config-global-modal.component';
import { FlashcardReadonlyModalComponent } from '../flashcard-readonly-modal/flashcard-readonly-modal.component';

type AdvancedFilterMode = 'all' | 'groups' | 'subjects';

@Component({
  selector: 'app-flashcard-view-card',
  templateUrl: './flashcard-view-card.component.html',
  styleUrls: ['./flashcard-view-card.component.scss']
})
export class FlashcardViewCardComponent implements OnInit {
  @Input() emptyMessage = 'Nenhum flashcard por aqui ainda.';

  sort = 'updatedAt,desc';

  readonly sortOptions: SortFilterOption[] = [
    { label: 'Nome (A→Z)', value: 'frontPart,asc' },
    { label: 'Nome (Z→A)', value: 'frontPart,desc' },
    { label: 'Estudado recentemente', value: 'updatedAt,desc' },
    { label: 'Não estudado recentemente', value: 'updatedAt,asc' }
  ];

  flashcards: FlashcardDTO[] = [];

  filterMode: AdvancedFilterMode = 'all';
  selectedGroupId?: number;
  selectedSubjectId?: number;

  groupOptions: AdvancedDropdownItem[] = [];
  subjectOptions: AdvancedDropdownItem[] = [];

  selectedTotalElements = 0;
  isLoadingAdvancedOptions = false;
  isLoadingFlashcards = false;

  page = 0;
  pageSize = 12;
  totalPages = 0;

  private subjectNameById = new Map<number, string>();

  constructor(
    private readonly modalService: NgbModal,
    private readonly router: Router,
    private readonly flashcardsService: FlashcardsService,
    private readonly groupsService: GroupsService,
    private readonly subjectsService: SubjectsService
  ) {}

  get hasItems(): boolean {
    return this.flashcards.length > 0;
  }

  ngOnInit(): void {
    this.loadSubjectsIndex();
    this.loadFlashcards();
  }

  loadFlashcards(): void {
    const request = {
      page: this.page,
      size: this.pageSize,
      sort: [this.sort]
    };

    let obs;
    if (this.filterMode === 'subjects') {
      if (!this.selectedSubjectId) {
        this.flashcards = [];
        this.totalPages = 0;
        this.selectedTotalElements = 0;
        return;
      }

      obs = this.flashcardsService.listAllBySubject(this.selectedSubjectId, request);
    } else if (this.filterMode === 'groups') {
      if (!this.selectedGroupId) {
        this.flashcards = [];
        this.totalPages = 0;
        this.selectedTotalElements = 0;
        return;
      }

      obs = this.flashcardsService.listInGroup(this.selectedGroupId, undefined, request);
    } else {
      obs = this.flashcardsService.listPaged(request);
    }

    this.isLoadingFlashcards = true;
    obs.subscribe({
      next: (page: Page<FlashcardDTO>) => {
        this.flashcards = page.content;
        this.totalPages = page.totalPages;
        this.selectedTotalElements = page.totalElements;
        this.isLoadingFlashcards = false;
      },
      error: () => {
        this.flashcards = [];
        this.totalPages = 0;
        this.selectedTotalElements = 0;
        this.isLoadingFlashcards = false;
      }
    });
  }

  onFilterModeChange(next: AdvancedFilterMode): void {
    if (next === this.filterMode) {
      return;
    }

    this.filterMode = next;
    this.page = 0;

    if (next === 'all') {
      this.selectedGroupId = undefined;
      this.selectedSubjectId = undefined;
      this.loadFlashcards();
      return;
    }

    if (next === 'subjects') {
      this.selectedGroupId = undefined;
      this.groupOptions = [];
      this.loadSubjectOptions();
      this.flashcards = [];
      this.totalPages = 0;
      this.selectedTotalElements = 0;
      return;
    }

    this.selectedSubjectId = undefined;
    this.subjectOptions = [];
    this.loadGroupOptions();
    this.flashcards = [];
    this.totalPages = 0;
    this.selectedTotalElements = 0;
  }

  onSubjectSelected(item: AdvancedDropdownItem): void {
    if (item.id === this.selectedSubjectId) {
      return;
    }

    this.selectedSubjectId = item.id;
    this.page = 0;
    this.loadFlashcards();
  }

  onGroupSelected(item: AdvancedDropdownItem): void {
    if (item.id === this.selectedGroupId) {
      return;
    }

    this.selectedGroupId = item.id;
    this.page = 0;
    this.loadFlashcards();
  }

  private loadSubjectsIndex(): void {
    this.subjectsService
      .listPaged({
        page: 0,
        size: 500,
        sort: ['name,asc']
      })
      .subscribe({
        next: (page) => {
          this.setSubjectsIndex(page.content);
        },
        error: () => {
          this.subjectNameById = new Map<number, string>();
        }
      });
  }

  private loadSubjectOptions(): void {
    this.isLoadingAdvancedOptions = true;
    this.subjectsService.listWithFlashcards().subscribe({
      next: (subjects) => {
        this.subjectOptions = subjects
          .map((s) => ({ id: (s as { subjectId?: number; id?: number }).subjectId ?? (s as { id?: number }).id, name: s.name }))
          .filter((s): s is AdvancedDropdownItem => typeof s.id === 'number');
        this.isLoadingAdvancedOptions = false;
      },
      error: () => {
        this.subjectOptions = [];
        this.isLoadingAdvancedOptions = false;
      }
    });
  }

  private loadGroupOptions(): void {
    this.isLoadingAdvancedOptions = true;
    this.groupsService.listWithFlashcards().subscribe({
      next: (groups) => {
        this.groupOptions = groups
          .map((g) => ({ id: (g as { groupId?: number; id?: number }).groupId ?? (g as { id?: number }).id, name: g.name }))
          .filter((g): g is AdvancedDropdownItem => typeof g.id === 'number');
        this.isLoadingAdvancedOptions = false;
      },
      error: () => {
        this.groupOptions = [];
        this.isLoadingAdvancedOptions = false;
      }
    });
  }

  goToStudy(): void {
    if (this.filterMode === 'subjects' && !this.selectedSubjectId) {
      return;
    }

    if (this.filterMode === 'groups' && !this.selectedGroupId) {
      return;
    }

    const modalRef = this.modalService.open(StudyConfigGlobalModalComponent, {
      centered: true,
      size: 'lg'
    });

    modalRef.componentInstance.filterMode = this.filterMode;
    modalRef.componentInstance.subjectId = this.selectedSubjectId;
    modalRef.componentInstance.groupId = this.selectedGroupId;

    modalRef.closed.subscribe((result: { level?: CardLevel } | undefined) => {
      if (!result) {
        return;
      }

      const level = result.level;
      const queryParams: Record<string, string | number | undefined> = {
        level,
        filterMode: this.filterMode
      };

      if (this.filterMode === 'subjects') {
        queryParams['subjectId'] = this.selectedSubjectId;
      }

      if (this.filterMode === 'groups') {
        queryParams['groupId'] = this.selectedGroupId;
      }

      this.router.navigate(['/app/flashcards/estudar'], { queryParams });
    });
  }

  openFlashcardReadonlyModal(flashcard: FlashcardDTO): void {
    const modalRef = this.modalService.open(FlashcardReadonlyModalComponent, {
      centered: true,
      size: 'lg'
    });

    modalRef.componentInstance.flashcard = flashcard;
    modalRef.componentInstance.subjectName = this.subjectName(flashcard.subjectId);
  }

  private setSubjectsIndex(subjects: SubjectDTO[]): void {
    this.subjectNameById = new Map(subjects.map((s) => [s.id, s.name]));
  }

  subjectName(subjectId: number): string {
    return this.subjectNameById.get(Number(subjectId)) ?? `Matéria #${subjectId}`;
  }

  onSortChange(nextSort: string): void {
    if (nextSort === this.sort) {
      return;
    }

    this.sort = nextSort;
    this.page = 0;
    this.loadFlashcards();
  }

  onPageChange(nextPage: number): void {
    if (nextPage === this.page) {
      return;
    }

    this.page = nextPage;
    this.loadFlashcards();
  }
}
