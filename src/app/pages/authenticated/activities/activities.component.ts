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
  events: CalendarEvent<{ activity: ActivityDTO }>[] = [];

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

  onViewDateChange(date: Date): void {
    this.viewDate = date;
    this.refreshEvents();
  }

  openDetails(event: CalendarEvent<{ activity: ActivityDTO }>): void {
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
          title: `${activity.subjectName} - ${activity.name}`,
          start: date,
          allDay: true,
          meta: { activity }
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

    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      return null;
    }

    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  }
}
