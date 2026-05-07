import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import type { ActivityDTO } from '../../model/activities.model';
import { ActivitiesService } from '../../services/activities.service';

@Component({
  selector: 'app-upcoming-activities-card',
  templateUrl: './upcoming-activities-card.component.html',
  styleUrls: ['./upcoming-activities-card.component.scss']
})
export class UpcomingActivitiesCardComponent implements OnInit {
  @Input() emptyMessage = 'Nenhuma atividade por aqui ainda.';

  activities: ActivityDTO[] = [];
  isLoading = false;
  hasError = false;
  pageSize = 5;

  constructor(
    private readonly activitiesService: ActivitiesService,
    private readonly router: Router
  ) {
    this.load();
  }

  get hasItems(): boolean {
    return this.activities.length > 0;
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const request = {
      page: 0,
      size: this.pageSize,
      sort: ['activityDate,asc']
    };

    console.log('[UpcomingActivitiesCard] requesting /activities', request);
    this.isLoading = true;
    this.hasError = false;

    this.activitiesService.listPaged(request).subscribe({
      next: (page) => {
        console.log('[UpcomingActivitiesCard] /activities response', page);
        this.activities = (page.content ?? []).slice(0, this.pageSize);
        this.isLoading = false;
      },
      error: (err: unknown) => {
        console.error('[UpcomingActivitiesCard] /activities error', err);
        this.activities = [];
        this.isLoading = false;
        this.hasError = true;
      }
    });
  }

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
}
