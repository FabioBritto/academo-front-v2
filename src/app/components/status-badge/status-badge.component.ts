import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.scss']
})
export class StatusBadgeComponent {
  @Input({ required: true }) isActive!: boolean;

  @Input() activeLabel = 'ATIVO';

  @Input() inactiveLabel = 'INATIVO';

  get label(): string {
    return this.isActive ? this.activeLabel : this.inactiveLabel;
  }
}
