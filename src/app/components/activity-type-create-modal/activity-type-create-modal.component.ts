import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs';

import type { ActivityTypeDTO, SaveActivityTypeDTO, UpdateActivityTypeDTO } from '../../model/activity-types.model';
import { ActivityTypesService } from '../../services/activity-types.service';
import { getHttpErrorMessage } from '../../utils/http-error.util';

@Component({
  selector: 'app-activity-type-create-modal',
  templateUrl: './activity-type-create-modal.component.html',
  styleUrls: ['./activity-type-create-modal.component.scss']
})
export class ActivityTypeCreateModalComponent implements OnInit {
  @Input({ required: true }) periodId!: number;
  @Input() activityTypeId?: number;

  private loadedActivityType: ActivityTypeDTO | null = null;

  form!: FormGroup;

  isLoading = false;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    public readonly activeModal: NgbActiveModal,
    private readonly fb: FormBuilder,
    private readonly activityTypesService: ActivityTypesService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(120)]],
      description: ['', [Validators.maxLength(1000)]]
    });

    if (this.activityTypeId) {
      this.isLoading = true;
      this.activityTypesService.getById(this.activityTypeId).subscribe({
        next: (t: ActivityTypeDTO) => {
          this.loadedActivityType = t;
          this.isLoading = false;

          this.form.patchValue({
            name: t.name,
            description: t.description
          });
        },
        error: (err: unknown) => {
          this.isLoading = false;
          this.errorMessage = getHttpErrorMessage(err, {
            fallback: 'Não foi possível carregar o tipo de atividade.'
          });
        }
      });
    }
  }

  close(): void {
    if (this.isSubmitting) {
      return;
    }

    this.activeModal.dismiss('close');
  }

  submit(): void {
    if (this.isSubmitting || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue() as { name: string; description: string };
    const name = String(raw.name ?? '').trim();
    const description = String(raw.description ?? '').trim();

    this.isSubmitting = true;
    this.errorMessage = '';

    const isEdit = Boolean(this.activityTypeId);
    if (isEdit) {
      const current = this.loadedActivityType;
      const body: UpdateActivityTypeDTO = {
        name,
        description,
        periodId: current?.periodId ?? this.periodId
      };

      let didSucceed = false;
      this.activityTypesService
        .update(this.activityTypeId as number, body)
        .pipe(
          finalize(() => {
            if (!didSucceed) {
              this.isSubmitting = false;
            }
          })
        )
        .subscribe({
          next: (updated: ActivityTypeDTO) => {
            didSucceed = true;
            this.activeModal.close(updated);
          },
          error: (err: unknown) => {
            this.errorMessage = getHttpErrorMessage(err, {
              fallback: 'Não foi possível atualizar o tipo de atividade.'
            });
          }
        });

      return;
    }

    const body: SaveActivityTypeDTO = {
      name,
      description: description ? description : null,
      periodId: this.periodId
    };

    let didSucceed = false;
    this.activityTypesService
      .create(body)
      .pipe(
        finalize(() => {
          if (!didSucceed) {
            this.isSubmitting = false;
          }
        })
      )
      .subscribe({
        next: (created: ActivityTypeDTO) => {
          didSucceed = true;
          this.activeModal.close(created);
        },
        error: (err: unknown) => {
          this.errorMessage = getHttpErrorMessage(err, {
            fallback: 'Não foi possível criar o tipo de atividade.'
          });
        }
      });
  }
}
