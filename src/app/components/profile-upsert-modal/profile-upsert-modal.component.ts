import { Component, Input, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import type { ProfileDTO } from '../../model/profile.model';
import { ProfileFormComponent } from '../profile-form/profile-form.component';

@Component({
  selector: 'app-profile-upsert-modal',
  templateUrl: './profile-upsert-modal.component.html',
  styleUrls: ['./profile-upsert-modal.component.scss']
})
export class ProfileUpsertModalComponent {
  @Input() profile: ProfileDTO | null = null;

  @ViewChild(ProfileFormComponent) profileForm?: ProfileFormComponent;

  imageSrc = 'assets/images/study-04.jpeg';
  imageAlt = 'Ilustração de estudo';

  get title(): string {
    return 'Editar Perfil';
  }

  get isSubmitting(): boolean {
    return this.profileForm?.isSubmitting ?? false;
  }

  constructor(public readonly activeModal: NgbActiveModal) {}

  close(): void {
    if (this.isSubmitting) {
      return;
    }

    this.activeModal.dismiss('close');
  }

  onSaveClick(): void {
    this.profileForm?.submit();
  }

  onSaved(saved: ProfileDTO): void {
    this.activeModal.close(saved);
  }
}
