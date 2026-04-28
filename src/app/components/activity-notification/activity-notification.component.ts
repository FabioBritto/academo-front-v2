import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-activity-notification',
  templateUrl: './activity-notification.component.html',
  styleUrls: ['./activity-notification.component.scss']
})
export class ActivityNotificationComponent {
  @Input({ required: true }) name!: string;
  @Input() description?: string | null;
  @Input() subjectName?: string | null;
  @Input({ required: true }) activityDate!: string;

  get dayLabel(): string {
    const date = this.asDate(this.activityDate);
    if (!date) {
      return '';
    }

    return String(date.getDate()).padStart(2, '0');
  }

  get monthLabel(): string {
    const date = this.asDate(this.activityDate);
    if (!date) {
      return '';
    }

    const formatted = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(date);
    return formatted.replace('.', '').toUpperCase();
  }

  private asDate(value: string): Date | null {
    if (!value) {
      return null;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date;
  }
}
