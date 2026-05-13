import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubjectDetailsRefreshService {
  private readonly activitiesChangedSubject = new Subject<void>();

  readonly activitiesChanged$ = this.activitiesChangedSubject.asObservable();

  notifyActivitiesChanged(): void {
    this.activitiesChangedSubject.next();
  }
}
