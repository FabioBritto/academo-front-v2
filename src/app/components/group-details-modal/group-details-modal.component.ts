import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import type { GroupDTO } from '../../model/groups.model';
import { GroupsService } from '../../services/groups.service';
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

  constructor(
    public readonly activeModal: NgbActiveModal,
    private readonly groupsService: GroupsService,
    private readonly modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.load();
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
        this.load();
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
