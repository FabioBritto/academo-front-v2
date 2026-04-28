import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-period-details',
  templateUrl: './period-details.component.html',
  styleUrls: ['./period-details.component.scss']
})
export class PeriodDetailsComponent {
  @Input() periodLabel = '';
}
