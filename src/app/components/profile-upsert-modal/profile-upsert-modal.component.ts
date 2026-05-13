import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import type { ProfileDTO } from '../../model/profile.model';
import { ProfileFormComponent } from '../profile-form/profile-form.component';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-profile-upsert-modal',
  templateUrl: './profile-upsert-modal.component.html',
  styleUrls: ['./profile-upsert-modal.component.scss']
})
export class ProfileUpsertModalComponent implements OnInit {
  @Input() profile: ProfileDTO | null = null;

  @ViewChild(ProfileFormComponent) profileForm?: ProfileFormComponent;

  private hasRequestedProfile = false;

  imageSrc = 'assets/images/study-04.jpeg';
  imageAlt = 'Ilustração de estudo';

  get title(): string {
    return 'Editar Perfil';
  }

  get isSubmitting(): boolean {
    return this.profileForm?.isSubmitting ?? false;
  }

  constructor(
    public readonly activeModal: NgbActiveModal,
    private readonly profileService: ProfileService
  ) {}

  ngOnInit(): void {
    queueMicrotask(() => {
      if (this.profile || this.hasRequestedProfile) {
        return;
      }

      this.hasRequestedProfile = true;
      this.profileService.getProfile().subscribe({
        next: (profile) => {
          if (this.profile) {
            return;
          }

          this.profile = profile;
        },
        error: () => {
          // não travar o modal caso falhe; o form segue vazio
        }
      });
    });
  }

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
