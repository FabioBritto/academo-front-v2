import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-upcoming-activities-card',
  templateUrl: './upcoming-activities-card.component.html',
  styleUrls: ['./upcoming-activities-card.component.scss']
})
export class UpcomingActivitiesCardComponent {
  @Input() hasItems = false;

  @Input() emptyMessage = 'Nenhuma atividade por aqui ainda.';
}
