import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import type { CreateGroupDTO, GroupDTO, UpdateGroupDTO } from '../../model/groups.model';
import { GroupsService } from '../../services/groups.service';
import { getHttpErrorMessage } from '../../utils/http-error.util';

@Component({
  selector: 'app-group-form',
  templateUrl: './group-form.component.html',
  styleUrls: ['./group-form.component.scss']
})
export class GroupFormComponent implements OnChanges {
  @Input() group: GroupDTO | null = null;

  @Output() saved = new EventEmitter<GroupDTO>();

  form: FormGroup;

  isSubmitting = false;
  validationMessage = '';
  errorMessage = '';

  readonly maxTextLen = 255;

  constructor(
    private readonly fb: FormBuilder,
    private readonly groupsService: GroupsService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(this.maxTextLen)]],
      description: ['', [Validators.maxLength(this.maxTextLen)]],
      isActive: [true]
    });
  }

  get nameLength(): number {
    return String(this.form.get('name')?.value ?? '').length;
  }

  get descriptionLength(): number {
    return String(this.form.get('description')?.value ?? '').length;
  }

  setActiveStatus(isActive: boolean): void {
    if (this.isSubmitting) {
      return;
    }

    const control = this.form.get('isActive');
    if (!control) {
      return;
    }

    control.setValue(isActive);
    control.markAsTouched();
    control.updateValueAndValidity();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('group' in changes) {
      const group = this.group;

      if (group) {
        this.form.patchValue({
          name: group.name,
          description: group.description,
          isActive: group.isActive
        });
      } else {
        this.form.reset({
          name: '',
          description: '',
          isActive: true
        });
      }

      this.validationMessage = '';
      this.errorMessage = '';
    }
  }

  submit(): void {
    if (this.isSubmitting) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.validationMessage = 'Confira os campos do formulário e tente novamente.';
      return;
    }

    this.isSubmitting = true;
    this.validationMessage = '';
    this.errorMessage = '';

    const name = String(this.form.value['name'] ?? '').trim();
    const description = String(this.form.value['description'] ?? '').trim();

    if (!this.group) {
      const payload: CreateGroupDTO = {
        name,
        description
      };

      let didSucceed = false;
      this.groupsService
        .create(payload)
        .pipe(
          finalize(() => {
            if (!didSucceed) {
              this.isSubmitting = false;
            }
          })
        )
        .subscribe({
          next: (created) => {
            didSucceed = true;
            this.saved.emit(created);
          },
          error: (err: unknown) => {
            this.handleError(err);
          }
        });

      return;
    }

    const isActive = Boolean(this.form.value['isActive']);

    const updatePayload: UpdateGroupDTO = {
      name,
      description,
      isActive
    };

    let didSucceed = false;
    this.groupsService
      .update(this.group.id, updatePayload)
      .pipe(
        finalize(() => {
          if (!didSucceed) {
            this.isSubmitting = false;
          }
        })
      )
      .subscribe({
        next: (updated) => {
          didSucceed = true;
          this.saved.emit(updated);
        },
        error: (err: unknown) => {
          this.handleError(err);
        }
      });
  }

  private handleError(err: unknown): void {
    this.errorMessage = getHttpErrorMessage(err, {
      fallback: 'Não foi possível salvar o grupo. Tente novamente.'
    });
  }
}
