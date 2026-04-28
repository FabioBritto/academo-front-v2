import { Component, Input, OnInit } from '@angular/core';

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
  page = 0;
  pageSize = 5;
  totalPages = 0;

  constructor(private readonly activitiesService: ActivitiesService) {
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
      page: this.page,
      size: this.pageSize,
      sort: ['activityDate,asc']
    };

    console.log('[UpcomingActivitiesCard] requesting /activities', request);
    this.isLoading = true;
    this.hasError = false;

    this.activitiesService.listPaged(request).subscribe({
      next: (page) => {
        console.log('[UpcomingActivitiesCard] /activities response', page);
        this.activities = page.content;
        this.totalPages = page.totalPages;
        this.isLoading = false;
      },
      error: (err: unknown) => {
        console.error('[UpcomingActivitiesCard] /activities error', err);
        this.activities = [];
        this.totalPages = 0;
        this.isLoading = false;
        this.hasError = true;
      }
    });
  }

  onPageChange(nextPage: number): void {
    if (nextPage === this.page) {
      return;
    }

    this.page = nextPage;
    this.load();
  }
}
