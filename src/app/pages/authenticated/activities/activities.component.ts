import { Component, OnInit } from '@angular/core';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

import type { ActivityDTO } from '../../../model/activities.model';
import { ActivitiesService } from '../../../services/activities.service';
import { ActivityDetailsModalComponent } from '../../../components/activity-details-modal/activity-details-modal.component';
import { ActivityUpsertModalComponent } from '../../../components/activity-upsert-modal/activity-upsert-modal.component';
import { ConfirmActionModalComponent } from '../../../components/confirm-action-modal/confirm-action-modal.component';

@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.scss']
})
export class ActivitiesComponent implements OnInit {
  readonly view = CalendarView.Month;
  readonly CalendarView = CalendarView;
  readonly maxBannerFieldLength = 20;

  viewDate = new Date();
  loading = false;
  error?: string;

  private allActivities: ActivityDTO[] = [];
  events: CalendarEvent<{ activity: ActivityDTO; name: string; subjectName: string }>[] = [];

  selectedDate: Date | null = null;
  selectedActivities: ActivityDTO[] = [];

  isDeletingActivityId: number | null = null;

  constructor(
    private readonly activitiesService: ActivitiesService,
    private readonly modalService: NgbModal,
    private readonly router: Router
  ) {}

  accessActivity(activity: ActivityDTO): void {
    const activityId = activity?.id;
    const subjectId = activity?.subjectId;
    const periodId = activity?.periodId;
    if (!activityId || !subjectId || !periodId) {
      return;
    }

    this.router.navigate([`/app/materias/${subjectId}`], {
      queryParams: {
        editActivityId: activityId,
        periodId
      }
    });
  }

  formatBannerLabel(event: CalendarEvent | null | undefined): string {
    if (!event) {
      return '';
    }

    const meta = (event as CalendarEvent<any>).meta;
    const name = this.truncateField(String(meta?.name ?? event.title ?? ''), this.maxBannerFieldLength);
    const subjectName = this.truncateField(String(meta?.subjectName ?? ''), this.maxBannerFieldLength);
    return `${name} - ${subjectName}`.trim();
  }

  formatBannerTitle(event: CalendarEvent | null | undefined): string {
    if (!event) {
      return '';
    }

    const meta = (event as CalendarEvent<any>).meta;
    const name = String(meta?.name ?? event.title ?? '').trim();
    const subjectName = String(meta?.subjectName ?? '').trim();
    if (!subjectName) {
      return name;
    }

    return `${name} - ${subjectName}`;
  }

  ngOnInit(): void {
    this.loadActivities();
  }

  onDayClicked(date: Date): void {
    const clicked = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);

    const shouldNavigateMonth =
      clicked.getFullYear() !== this.viewDate.getFullYear() || clicked.getMonth() !== this.viewDate.getMonth();
    if (shouldNavigateMonth) {
      this.onViewDateChange(new Date(clicked.getFullYear(), clicked.getMonth(), 1, 0, 0, 0, 0));
    }

    this.selectedDate = clicked;
    this.refreshSelectedDay();
  }

  isSelectedDay(date: Date): boolean {
    const selected = this.selectedDate;
    if (!selected) {
      return false;
    }

    return this.dateKey(selected) === this.dateKey(date);
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

  openActivityDetails(activity: ActivityDTO): void {
    if (!activity) {
      return;
    }

    const ref = this.modalService.open(ActivityDetailsModalComponent, { size: 'lg' });
    ref.componentInstance.activity = activity;
  }

  editActivity(activity: ActivityDTO): void {
    const activityId = activity?.id;
    const subjectId = activity?.subjectId;
    const periodId = activity?.periodId;
    if (!activityId || !subjectId || !periodId) {
      return;
    }

    const ref = this.modalService.open(ActivityUpsertModalComponent, {
      centered: true,
      size: 'xl'
    });

    ref.componentInstance.subjectId = subjectId;
    ref.componentInstance.periodId = periodId;
    ref.componentInstance.activityId = activityId;

    ref.closed.subscribe(() => {
      this.loadActivities();
    });
  }

  deleteActivity(activity: ActivityDTO): void {
    const activityId = activity?.id;
    if (!activityId) {
      return;
    }

    if (this.isDeletingActivityId) {
      return;
    }

    const confirmRef = this.modalService.open(ConfirmActionModalComponent, {
      centered: true,
      size: 'lg'
    });

    confirmRef.componentInstance.title = 'Excluir atividade';
    confirmRef.componentInstance.message = 'Tem certeza que deseja excluir esta atividade?';
    confirmRef.componentInstance.confirmLabel = 'Excluir';
    confirmRef.componentInstance.cancelLabel = 'Cancelar';

    confirmRef.closed.subscribe((confirmed: unknown) => {
      if (confirmed !== true) {
        return;
      }

      this.isDeletingActivityId = activityId;

      this.activitiesService.delete(activityId).subscribe({
        next: () => {
          this.isDeletingActivityId = null;
          this.allActivities = (this.allActivities ?? []).filter((a) => a.id !== activityId);
          this.refreshEvents();
          this.refreshSelectedDay();
        },
        error: () => {
          this.isDeletingActivityId = null;
        }
      });
    });
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
          this.refreshSelectedDay();
          this.loading = false;
        },
        error: () => {
          this.error = 'Não foi possível carregar as atividades.';
          this.loading = false;
        }
      });
  }

  private refreshSelectedDay(): void {
    const selected = this.selectedDate;
    if (!selected) {
      this.selectedActivities = [];
      return;
    }

    const key = this.dateKey(selected);
    this.selectedActivities = (this.allActivities ?? [])
      .filter((a) => this.activityDateKey(a.activityDate) === key)
      .sort((a, b) => String(a.name ?? '').localeCompare(String(b.name ?? '')));
  }

  private dateKey(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private activityDateKey(value: string): string | null {
    if (!value) {
      return null;
    }

    const str = String(value).trim();
    const iso = str.slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : null;
  }

  private truncateField(value: string, maxLen: number): string {
    const str = String(value ?? '');
    if (str.length <= maxLen) {
      return str;
    }

    const cut = Math.max(0, maxLen - 1);
    return `${str.slice(0, cut)}…`;
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
          title: `${activity.name} - ${activity.subjectName}`,
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
