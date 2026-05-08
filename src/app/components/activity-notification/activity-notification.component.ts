import { Component, EventEmitter, Input, Output } from '@angular/core';

import { parseIsoDate } from '../../utils/date.util';

export interface ActivityNotificationAccessPayload {
  activityId: number;
  subjectId: number;
  periodId: number;
}

@Component({
  selector: 'app-activity-notification',
  templateUrl: './activity-notification.component.html',
  styleUrls: ['./activity-notification.component.scss']
})
export class ActivityNotificationComponent {
  @Input({ required: true }) name!: string;
  @Input() subjectName?: string | null;
  @Input({ required: true }) activityDate!: string;

  @Input() activityId?: number | null;
  @Input() subjectId?: number | null;
  @Input() periodId?: number | null;

  @Output() access = new EventEmitter<ActivityNotificationAccessPayload>();

  get displayName(): string {
    const name = this.name ?? '';
    const maxLen = 40;

    if (name.length <= maxLen) {
      return name;
    }

    return `${name.slice(0, maxLen).trimEnd()}...`;
  }

  get displaySubjectName(): string {
    const name = this.subjectName ?? '';
    const maxLen = 40;

    if (name.length <= maxLen) {
      return name;
    }

    return `${name.slice(0, maxLen).trimEnd()}...`;
  }

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

  onAccess(): void {
    const activityId = this.activityId == null ? NaN : Number(this.activityId);
    const subjectId = this.subjectId == null ? NaN : Number(this.subjectId);
    const periodId = this.periodId == null ? NaN : Number(this.periodId);

    if (!Number.isFinite(activityId) || activityId <= 0) {
      return;
    }

    if (!Number.isFinite(subjectId) || subjectId <= 0) {
      return;
    }

    if (!Number.isFinite(periodId) || periodId <= 0) {
      return;
    }

    this.access.emit({ activityId, subjectId, periodId });
  }

  private asDate(value: string): Date | null {
    if (!value) {
      return null;
    }

    const trimmed = String(value).trim();
    const date = /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? parseIsoDate(trimmed) : new Date(trimmed);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date;
  }
}
