import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-group-view-card',
  templateUrl: './group-view-card.component.html',
  styleUrls: ['./group-view-card.component.scss']
})
export class GroupViewCardComponent {
  @Input() hasItems = false;

  @Input() emptyMessage = 'Nenhum grupo por aqui ainda.';
}
