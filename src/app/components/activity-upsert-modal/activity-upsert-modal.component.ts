import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { distinctUntilChanged } from 'rxjs';

import type { ActivityTypeDTO } from '../../model/activity-types.model';
import type { ActivityDTO, SaveActivityDTO } from '../../model/activities.model';
import { ActivityTypeCreateModalComponent } from '../activity-type-create-modal/activity-type-create-modal.component';
import { ActivitiesService } from '../../services/activities.service';
import { ActivityTypesService } from '../../services/activity-types.service';
import { getHttpErrorMessage } from '../../utils/http-error.util';

@Component({
  selector: 'app-activity-upsert-modal',
  templateUrl: './activity-upsert-modal.component.html',
  styleUrls: ['./activity-upsert-modal.component.scss']
})
export class ActivityUpsertModalComponent implements OnInit, AfterViewInit {
  @Input({ required: true }) subjectId!: number;
  @Input({ required: true }) periodId!: number;
  @Input() activityId?: number;

  private loadedActivity: ActivityDTO | null = null;

  imageSrc = 'assets/images/study-03.jpeg';
  imageAlt = 'Ilustração de estudo';

  form!: FormGroup;

  activityTypes: ActivityTypeDTO[] = [];
  isLoadingActivityTypes = false;

  isSubmitting = false;
  errorMessage = '';

  constructor(
    public readonly activeModal: NgbActiveModal,
    private readonly modalService: NgbModal,
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
      description: ['', [Validators.maxLength(1000)]],
      grade: [0, [Validators.required, Validators.min(0), Validators.max(10)]],
      subjectId: [this.subjectId, [Validators.required]],
      activityTypeId: [null, [Validators.required]]
    });

    if (!this.activityId) {
      this.form.patchValue({ grade: 0 }, { emitEvent: false });
    }

    this.setupGradeSanitization();

    this.loadActivityTypes();

    if (this.activityId) {
      this.loadActivity(this.activityId);
    }
  }

  ngAfterViewInit(): void {
    if (this.activityId) {
      return;
    }

    const gradeControl = this.form?.get('grade');
    if (!gradeControl) {
      return;
    }

    setTimeout(() => {
      gradeControl.setValue(0, { emitEvent: false });
    }, 0);
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
    const control = this.form.get('activityTypeId');
    if (!control) {
      return;
    }

    control.setValue(Number(id));
    control.markAsDirty();
    control.markAsTouched();
    control.updateValueAndValidity();

    console.log('[ActivityUpsertModal] onActivityTypeChange', {
      received: id,
      controlValue: control.value
    });
  }

  onEditActivityTypeClick(activityTypeId: number): void {
    if (this.isSubmitting) {
      return;
    }

    const modalRef = this.modalService.open(ActivityTypeCreateModalComponent, {
      centered: true,
      size: 'lg'
    });

    modalRef.componentInstance.periodId = this.periodId;
    modalRef.componentInstance.activityTypeId = activityTypeId;

    modalRef.closed.subscribe((updated: unknown) => {
      const activityType = updated as ActivityTypeDTO;
      const updatedId = activityType?.id;
      this.loadActivityTypes();
      if (updatedId) {
        this.onActivityTypeChange(updatedId);
      }
    });
  }

  onNewActivityTypeClick(): void {
    if (this.isSubmitting) {
      return;
    }

    const modalRef = this.modalService.open(ActivityTypeCreateModalComponent, {
      centered: true,
      size: 'lg'
    });

    modalRef.componentInstance.periodId = this.periodId;

    modalRef.closed.subscribe((created: unknown) => {
      const activityType = created as ActivityTypeDTO;
      const createdId = activityType?.id;
      if (!createdId) {
        return;
      }

      this.loadActivityTypes();
      this.onActivityTypeChange(createdId);
    });
  }

  onActivityDateBlur(): void {
    const control = this.form.get('activityDate');
    if (!control) {
      return;
    }

    control.markAsTouched();

    const value = control.value;
    if (value == null || String(value).trim() === '') {
      const errors = { ...(control.errors ?? {}) };
      delete errors['invalidDate'];
      control.setErrors(Object.keys(errors).length ? errors : null);
      return;
    }

    const isValid = this.parseBrToIsoDate(value) != null;
    const errors = { ...(control.errors ?? {}) };
    if (!isValid) {
      errors['invalidDate'] = true;
    } else {
      delete errors['invalidDate'];
    }

    control.setErrors(Object.keys(errors).length ? errors : null);
  }

  private formatIsoToBrDate(value: unknown): string {
    if (value == null) {
      return '';
    }

    const str = String(value).trim();
    const iso = str.slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      return '';
    }

    const [yyyy, mm, dd] = iso.split('-');
    return `${dd}/${mm}/${yyyy}`;
  }

  private parseBrToIsoDate(value: unknown): string | null {
    if (value == null) {
      return null;
    }

    const str = String(value).trim();
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
      return null;
    }

    const [ddStr, mmStr, yyyyStr] = str.split('/');
    const dd = Number(ddStr);
    const mm = Number(mmStr);
    const yyyy = Number(yyyyStr);

    if (!Number.isInteger(dd) || !Number.isInteger(mm) || !Number.isInteger(yyyy)) {
      return null;
    }

    if (yyyy < 1900 || yyyy > 2100) {
      return null;
    }

    if (mm < 1 || mm > 12) {
      return null;
    }

    if (dd < 1 || dd > 31) {
      return null;
    }

    const dt = new Date(yyyy, mm - 1, dd);
    if (dt.getFullYear() !== yyyy || dt.getMonth() !== mm - 1 || dt.getDate() !== dd) {
      return null;
    }

    const isoMonth = String(mm).padStart(2, '0');
    const isoDay = String(dd).padStart(2, '0');
    return `${yyyy}-${isoMonth}-${isoDay}`;
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
      return 0;
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
      return 0;
    }

    const n = Number(str);
    return Number.isFinite(n) ? n : 0;
  }

  private loadActivityTypes(): void {
    this.isLoadingActivityTypes = true;

    this.activityTypesService
      .listAllByPeriodPaged(this.periodId, { page: 0, size: 200 })
      .subscribe({
        next: (page) => {
          this.activityTypes = page.content ?? [];
          this.isLoadingActivityTypes = false;
          this.applyActivityTypeSelection();
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
        this.loadedActivity = a;

        console.log('[ActivityUpsertModal] loadActivity', {
          activityId: a.id,
          activityTypeName: a.activityTypeName
        });

        this.form.patchValue({
          activityDate: this.formatIsoToBrDate(a.activityDate),
          name: a.name,
          description: a.description,
          grade: a.grade,
          subjectId: this.subjectId
        });

        console.log('[ActivityUpsertModal] loadActivity after patchValue', {
          activityTypeIdControl: this.form.get('activityTypeId')?.value
        });

        this.applyActivityTypeSelection();
      },
      error: () => {
        // manter form vazio, apenas não travar o modal
      }
    });
  }

  private applyActivityTypeSelection(): void {
    const activity = this.loadedActivity;
    if (!activity) {
      return;
    }

    const current = this.form.get('activityTypeId')?.value;
    if (current) {
      console.log('[ActivityUpsertModal] applyActivityTypeSelection skipped (current already set)', {
        current
      });
      return;
    }

    const activityTypeName = String(activity.activityTypeName ?? '').trim();
    if (!activityTypeName) {
      return;
    }

    const match = (this.activityTypes ?? []).find((t) => String(t.name ?? '').trim() === activityTypeName);
    if (!match) {
      console.log('[ActivityUpsertModal] applyActivityTypeSelection no match', {
        activityTypeName,
        available: (this.activityTypes ?? []).map((t) => ({ id: t.id, name: t.name }))
      });
      return;
    }

    console.log('[ActivityUpsertModal] applyActivityTypeSelection match', {
      activityTypeName,
      matchId: match.id
    });

    this.form.patchValue({ activityTypeId: match.id });
  }

  submit(): void {
    if (this.isSubmitting || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const body: SaveActivityDTO = this.form.getRawValue() as SaveActivityDTO;

    const activityTypeId = Number(this.form.get('activityTypeId')?.value);
    if (Number.isFinite(activityTypeId)) {
      body.activityTypeId = activityTypeId;
    }

    console.log('[ActivityUpsertModal] submit activityTypeId:', {
      controlValue: this.form.get('activityTypeId')?.value,
      bodyValue: body.activityTypeId
    });

    const activityDateIso = this.parseBrToIsoDate(body.activityDate);
    if (!activityDateIso) {
      this.form.get('activityDate')?.setErrors({ invalidDate: true });
      this.form.get('activityDate')?.markAsTouched();
      return;
    }

    (body as unknown as { activityDate: string }).activityDate = activityDateIso;

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
