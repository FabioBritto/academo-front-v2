import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import type { GroupDTO } from '../../model/groups.model';
import { GroupsService } from '../../services/groups.service';
import { ToastService } from '../../services/toast.service';
import { getHttpErrorMessage } from '../../utils/http-error.util';
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

  constructor(
    public readonly activeModal: NgbActiveModal,
    private readonly groupsService: GroupsService,
    private readonly modalService: NgbModal,
    private readonly toastService: ToastService
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
        this.activeModal.close(result);
      }
    });
  }

  onAddSubjects(): void {
    if (!this.group) {
      return;
    }

    this.addSubjects.emit(this.group);
  }

  get statusLabel(): string {
    if (!this.group) {
      return '';
    }

    return this.group.isActive ? 'Ativo' : 'Inativo';
  }
}
