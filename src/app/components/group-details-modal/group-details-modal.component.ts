import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import type { GroupDTO } from '../../model/groups.model';
import type { SubjectDTO } from '../../model/subjects.model';
import { GroupsService } from '../../services/groups.service';
import { ToastService } from '../../services/toast.service';
import { getHttpErrorMessage } from '../../utils/http-error.util';
import { GroupSubjectsPickerModalComponent } from '../group-subjects-picker-modal/group-subjects-picker-modal.component';
import { GroupUpsertModalComponent } from '../group-upsert-modal/group-upsert-modal.component';

@Component({
  selector: 'app-group-details-modal',
  templateUrl: './group-details-modal.component.html',
  styleUrls: ['./group-details-modal.component.scss']
})
export class GroupDetailsModalComponent implements OnInit {
  @Input({ required: true }) groupId!: number;

  @Output() addSubjects = new EventEmitter<GroupDTO>();

  group: GroupDTO | null = null;
  isLoading = false;
  isDeleting = false;
  isRemovingSubject = false;

  get displayName(): string {
    const name = this.group?.name ?? '';
    const maxLen = 40;

    if (name.length <= maxLen) {
      return name;
    }

    return `${name.slice(0, maxLen).trimEnd()}...`;
  }

  constructor(
    public readonly activeModal: NgbActiveModal,
    private readonly groupsService: GroupsService,
    private readonly modalService: NgbModal,
    private readonly toastService: ToastService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  onDelete(): void {
    if (!this.group || this.isDeleting) {
      return;
    }

    this.isDeleting = true;

    this.groupsService.delete(this.groupId).subscribe({
      next: () => {
        this.isDeleting = false;
        this.toastService.show('Grupo excluído com sucesso.', {
          classname: 'bg-success text-light',
          delay: 3500,
          autohide: true
        });
        this.activeModal.close('deleted');
      },
      error: (err: unknown) => {
        this.isDeleting = false;
        this.toastService.show(getHttpErrorMessage(err, {
          fallback: 'Não foi possível excluir o grupo. Tente novamente.'
        }), {
          classname: 'bg-danger text-light',
          delay: 4500,
          autohide: true
        });
      }
    });
  }

  load(): void {
    this.isLoading = true;

    this.groupsService.getById(this.groupId).subscribe({
      next: (group) => {
        this.group = group;
        this.isLoading = false;
      },
      error: () => {
        this.group = null;
        this.isLoading = false;
      }
    });
  }

  close(): void {
    this.activeModal.dismiss('close');
  }

  onEdit(): void {
    if (!this.group) {
      return;
    }

    const modalRef = this.modalService.open(GroupUpsertModalComponent, {
      centered: true,
      size: 'xl'
    });

    modalRef.componentInstance.group = this.group;

    modalRef.closed.subscribe((result) => {
      if (result) {
        this.toastService.show('Grupo atualizado com sucesso.', {
          classname: 'bg-success text-light',
          delay: 3500,
          autohide: true
        });
        this.activeModal.close(result);
      }
    });
  }

  onAddSubjects(): void {
    if (!this.group) {
      return;
    }

    const modalRef = this.modalService.open(GroupSubjectsPickerModalComponent, {
      centered: true,
      size: 'lg'
    });

    modalRef.componentInstance.groupId = this.groupId;

    modalRef.closed.subscribe((result: GroupDTO | null) => {
      if (result) {
        this.group = result;
      }
    });
  }

  accessSubject(subjectId: number): void {
    if (!Number.isFinite(subjectId)) {
      return;
    }

    this.activeModal.close('navigate');
    this.router.navigate(['/app/materias', subjectId]);
  }

  removeSubject(subjectId: number): void {
    if (!this.group || this.isRemovingSubject) {
      return;
    }

    this.isRemovingSubject = true;

    this.groupsService.removeSubject(this.groupId, subjectId).subscribe({
      next: (group) => {
        this.group = group;
        this.isRemovingSubject = false;
        this.toastService.show('Matéria removida do grupo com sucesso.', {
          classname: 'bg-success text-light',
          delay: 3500,
          autohide: true
        });
      },
      error: (err: unknown) => {
        this.isRemovingSubject = false;
        this.toastService.show(getHttpErrorMessage(err, {
          fallback: 'Não foi possível remover a matéria do grupo. Tente novamente.'
        }), {
          classname: 'bg-danger text-light',
          delay: 4500,
          autohide: true
        });
      }
    });
  }

  get statusLabel(): string {
    if (!this.group) {
      return '';
    }

    return this.group.isActive ? 'Ativo' : 'Inativo';
  }

  isPassingGradeDefined(subject: SubjectDTO): boolean {
    const passing = subject?.passingGrade;
    return typeof passing === 'number' && passing > 0;
  }

  isFinalGradeAboveOrEqualPassing(subject: SubjectDTO): boolean {
    if (!this.isPassingGradeDefined(subject)) {
      return false;
    }

    return Number(subject?.finalGrade ?? 0) >= Number(subject?.passingGrade ?? 0);
  }

  isFinalGradeBelowPassing(subject: SubjectDTO): boolean {
    if (!this.isPassingGradeDefined(subject)) {
      return false;
    }

    return Number(subject?.finalGrade ?? 0) < Number(subject?.passingGrade ?? 0);
  }
}
