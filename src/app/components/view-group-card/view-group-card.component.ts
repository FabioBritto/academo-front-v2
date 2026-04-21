import { Component, Input } from '@angular/core';

import type { GroupDTO } from '../../model/groups.model';

@Component({
  selector: 'app-view-group-card',
  templateUrl: './view-group-card.component.html',
  styleUrls: ['./view-group-card.component.scss']
})
export class ViewGroupCardComponent {
  @Input({ required: true }) group!: GroupDTO;

  @Input() iconClass = 'bi bi-people-fill';
}
