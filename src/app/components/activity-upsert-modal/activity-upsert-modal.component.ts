import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { distinctUntilChanged } from 'rxjs';

import type { ActivityTypeDTO } from '../../model/activity-types.model';
import type { ActivityDTO, SaveActivityDTO } from '../../model/activities.model';
import { ActivitiesService } from '../../services/activities.service';
import { ActivityTypesService } from '../../services/activity-types.service';
import { getHttpErrorMessage } from '../../utils/http-error.util';

@Component({
  selector: 'app-activity-upsert-modal',
  templateUrl: './activity-upsert-modal.component.html',
  styleUrls: ['./activity-upsert-modal.component.scss']
})
export class ActivityUpsertModalComponent implements OnInit {
  @Input({ required: true }) subjectId!: number;
  @Input({ required: true }) periodId!: number;
  @Input() activityId?: number;

  imageSrc = 'assets/images/study-03.jpeg';
  imageAlt = 'Ilustração de estudo';

  form!: FormGroup;

  activityTypes: ActivityTypeDTO[] = [];
  isLoadingActivityTypes = false;

  isSubmitting = false;
  errorMessage = '';

  constructor(
    public readonly activeModal: NgbActiveModal,
    private readonly fb: FormBuilder,
    private readonly activitiesService: ActivitiesService,
    private readonly activityTypesService: ActivityTypesService
  ) {}

  get title(): string {
    return this.activityId ? 'Editar Atividade' : 'Nova Atividade';
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      activityDate: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.maxLength(120)]],
      description: ['', [Validators.required, Validators.maxLength(1000)]],
      grade: [0, [Validators.required, Validators.min(0.1), Validators.max(10)]],
      subjectId: [this.subjectId, [Validators.required]],
      activityTypeId: [null, [Validators.required]]
    });

    this.setupGradeSanitization();

    this.loadActivityTypes();

    if (this.activityId) {
      this.loadActivity(this.activityId);
    }
  }

  close(): void {
    if (this.isSubmitting) {
      return;
    }

    this.activeModal.dismiss('close');
  }

  get activityTypeItems(): { id: number; name: string }[] {
    return (this.activityTypes ?? []).map((t) => ({ id: t.id, name: t.name }));
  }

  onActivityTypeChange(id: number): void {
    this.form.patchValue({ activityTypeId: id });
    this.form.markAsDirty();
  }

  onNewActivityTypeClick(): void {
    return;
  }

  private setupGradeSanitization(): void {
    const gradeControl = this.form.get('grade');
    if (!gradeControl) {
      return;
    }

    gradeControl.valueChanges.pipe(distinctUntilChanged()).subscribe((raw) => {
      const sanitized = this.sanitizeGrade(raw);
      if (sanitized == null) {
        return;
      }

      if (sanitized !== raw) {
        gradeControl.patchValue(sanitized, { emitEvent: false });
      }
    });
  }

  private sanitizeGrade(raw: unknown): number | null {
    if (raw == null) {
      return 0.1;
    }

    let str = String(raw);
    str = str.replace(/[^0-9.,]/g, '');
    str = str.replace(/,/g, '.');

    const dotIndex = str.indexOf('.');
    if (dotIndex !== -1) {
      const integerPart = str.slice(0, dotIndex + 1);
      const fractionalPart = str
        .slice(dotIndex + 1)
        .replace(/\./g, '')
        .slice(0, 1);
      str = integerPart + fractionalPart;
    }

    if (str === '' || str === '.') {
      return 0.1;
    }

    const n = Number(str);
    return Number.isFinite(n) ? n : 0.1;
  }

  private loadActivityTypes(): void {
    this.isLoadingActivityTypes = true;

    this.activityTypesService
      .listAllByPeriodPaged(this.periodId, { page: 0, size: 200 })
      .subscribe({
        next: (page) => {
          this.activityTypes = page.content ?? [];
          this.isLoadingActivityTypes = false;
        },
        error: () => {
          this.activityTypes = [];
          this.isLoadingActivityTypes = false;
        }
      });
  }

  private loadActivity(activityId: number): void {
    this.activitiesService.getById(activityId).subscribe({
      next: (a: ActivityDTO) => {
        this.form.patchValue({
          activityDate: a.activityDate,
          name: a.name,
          description: a.description,
          grade: a.grade,
          subjectId: this.subjectId
        });
      },
      error: () => {
        // manter form vazio, apenas não travar o modal
      }
    });
  }

  submit(): void {
    if (this.isSubmitting || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const body: SaveActivityDTO = this.form.getRawValue() as SaveActivityDTO;

    this.isSubmitting = true;
    this.errorMessage = '';

    const request$ = this.activityId
      ? this.activitiesService.update(this.activityId, body)
      : this.activitiesService.create(body);

    request$.subscribe({
      next: (saved) => {
        this.isSubmitting = false;
        this.activeModal.close(saved);
      },
      error: (err: unknown) => {
        this.isSubmitting = false;
        this.errorMessage = getHttpErrorMessage(err);
      }
    });
  }
}
