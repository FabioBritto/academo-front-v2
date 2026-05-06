import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import type { ActivityDTO } from '../../model/activities.model';

@Component({
  selector: 'app-activity-details-modal',
  templateUrl: './activity-details-modal.component.html',
  styleUrls: ['./activity-details-modal.component.scss']
})
export class ActivityDetailsModalComponent {
  @Input({ required: true }) activity!: ActivityDTO;

  constructor(public readonly activeModal: NgbActiveModal) {}

  get formattedDate(): string {
    const date = new Date(this.activity?.activityDate);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return new Intl.DateTimeFormat('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  }
}
