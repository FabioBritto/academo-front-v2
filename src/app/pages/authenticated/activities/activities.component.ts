import { Component, OnInit } from '@angular/core';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import type { ActivityDTO } from '../../../model/activities.model';
import { ActivitiesService } from '../../../services/activities.service';
import { ActivityDetailsModalComponent } from '../../../components/activity-details-modal/activity-details-modal.component';

@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.scss']
})
export class ActivitiesComponent implements OnInit {
  readonly view = CalendarView.Month;
  readonly CalendarView = CalendarView;

  viewDate = new Date();
  loading = false;
  error?: string;

  private allActivities: ActivityDTO[] = [];
  events: CalendarEvent<{ activity: ActivityDTO; name: string; subjectName: string }>[] = [];

  constructor(
    private readonly activitiesService: ActivitiesService,
    private readonly modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadActivities();
  }

  get prevMonthLabel(): string {
    return this.formatMonthLabel(this.addMonths(this.viewDate, -1));
  }

  get currentMonthLabel(): string {
    return this.formatMonthLabel(this.viewDate);
  }

  get currentYearLabel(): string {
    return String(this.viewDate.getFullYear());
  }

  get nextMonthLabel(): string {
    return this.formatMonthLabel(this.addMonths(this.viewDate, 1));
  }

  changeYear(delta: number): void {
    const next = new Date(this.viewDate.getFullYear() + delta, this.viewDate.getMonth(), 1, 0, 0, 0, 0);
    this.onViewDateChange(next);
  }

  onViewDateChange(date: Date): void {
    this.viewDate = date;
    this.refreshEvents();
  }

  openDetails(event: CalendarEvent<{ activity: ActivityDTO; name: string; subjectName: string }>): void {
    const activity = event.meta?.activity;
    if (!activity) {
      return;
    }

    const ref = this.modalService.open(ActivityDetailsModalComponent, { size: 'lg' });
    ref.componentInstance.activity = activity;
  }

  private loadActivities(): void {
    this.loading = true;
    this.error = undefined;

    this.activitiesService
      .listPaged({ page: 0, size: 9999 })
      .subscribe({
        next: (page) => {
          this.allActivities = page.content ?? [];
          this.refreshEvents();
          this.loading = false;
        },
        error: () => {
          this.error = 'Não foi possível carregar as atividades.';
          this.loading = false;
        }
      });
  }

  private refreshEvents(): void {
    const { start, end } = this.monthRange(this.viewDate);

    this.events = (this.allActivities ?? [])
      .map((a) => ({
        activity: a,
        date: this.asLocalDateOnly(a.activityDate)
      }))
      .filter((x) => Boolean(x.date) && x.date!.getTime() >= start.getTime() && x.date!.getTime() <= end.getTime())
      .map((x) => {
        const activity = x.activity;
        const date = x.date as Date;

        return {
          title: `${activity.name}\n${activity.subjectName}`,
          start: date,
          allDay: true,
          color: {
            primary: '#1e90ff',
            secondary: '#D1E8FF'
          },
          meta: {
            activity,
            name: activity.name,
            subjectName: activity.subjectName
          }
        };
      });
  }

  private monthRange(reference: Date): { start: Date; end: Date } {
    const start = new Date(reference.getFullYear(), reference.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(reference.getFullYear(), reference.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
  }

  private addMonths(date: Date, amount: number): Date {
    return new Date(date.getFullYear(), date.getMonth() + amount, 1, 0, 0, 0, 0);
  }

  private formatMonthLabel(date: Date): string {
    const month = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(date);
    return month.charAt(0).toUpperCase() + month.slice(1);
  }

  private asLocalDateOnly(value: string): Date | null {
    if (!value) {
      return null;
    }

    const dateOnly = /^\d{4}-\d{2}-\d{2}$/;
    if (dateOnly.test(value)) {
      const [y, m, d] = value.split('-').map((n) => Number(n));
      if (!y || !m || !d) {
        return null;
      }

      return new Date(y, m - 1, d, 0, 0, 0, 0);
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 0, 0, 0, 0);
  }
}
