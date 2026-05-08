import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import type { GroupDTO } from '../../model/groups.model';
import { GroupsService } from '../../services/groups.service';
import { GroupDetailsModalComponent } from '../group-details-modal/group-details-modal.component';

@Component({
  selector: 'app-group-card',
  templateUrl: './group-card.component.html',
  styleUrls: ['./group-card.component.scss']
})
export class GroupCardComponent {
  @Input({ required: true }) group!: GroupDTO;

  @Input() iconClass = 'bi bi-people-fill';

  @Output() changed = new EventEmitter<number>();

  private subjectsCountValue: number | null = null;

  get subjectsCount(): number {
    if (this.subjectsCountValue !== null) {
      return this.subjectsCountValue;
    }

    return this.group?.subjects?.length ?? 0;
  }

  get subjectsCountLabel(): string {
    const count = this.subjectsCount;
    if (count === 1) {
      return '1 matéria';
    }

    return `${count} matérias`;
  }

  get displayName(): string {
    const name = this.group?.name ?? '';
    const maxLen = 60;

    if (name.length <= maxLen) {
      return name;
    }

    const ellipsis = '...';
    const sliceLen = Math.max(0, maxLen - ellipsis.length);
    const sliced = name.slice(0, sliceLen).trimEnd();

    return `${sliced}${ellipsis}`;
  }

  constructor(
    private readonly modalService: NgbModal,
    private readonly groupsService: GroupsService
  ) {}

  private refetchSubjectsCount(groupId: number): void {
    this.groupsService.getById(groupId).subscribe({
      next: (group) => {
        this.subjectsCountValue = group?.subjects?.length ?? 0;
        this.changed.emit(groupId);
      },
      error: () => {
        this.subjectsCountValue = this.group?.subjects?.length ?? 0;
        this.changed.emit(groupId);
      }
    });
  }

  @HostListener('click')
  onHostClick(): void {
    this.openDetails();
  }

  openDetails(): void {
    const modalRef = this.modalService.open(GroupDetailsModalComponent, {
      centered: true,
      size: 'xl'
    });

    modalRef.componentInstance.groupId = this.group.id;

    modalRef.dismissed.subscribe(() => {
      const groupId = Number(this.group?.id);
      if (!Number.isFinite(groupId) || groupId <= 0) {
        return;
      }

      this.refetchSubjectsCount(groupId);
    });

    modalRef.closed.subscribe((result) => {
      if (result) {
        const groupId = Number(this.group?.id);
        if (!Number.isFinite(groupId) || groupId <= 0) {
          this.changed.emit(this.group.id);
          return;
        }

        this.refetchSubjectsCount(groupId);
      }
    });
  }
}
