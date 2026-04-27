import { Component, OnInit } from '@angular/core';

import type { PlanType } from '../../../model/auth.model';
import type { ProfileDTO } from '../../../model/profile.model';
import { ProfileUpsertModalComponent } from '../../../components/profile-upsert-modal/profile-upsert-modal.component';
import { PaymentService } from '../../../services/payment.service';
import { ProfileService } from '../../../services/profile.service';
import { formatLocalDate, formatLocalDateTime, parseIsoDate, parseLocalDateTime } from '../../../utils/date.util';
import { getHttpErrorMessage } from '../../../utils/http-error.util';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-profile-subscription',
  templateUrl: './profile-subscription.component.html',
  styleUrls: ['./profile-subscription.component.scss']
})
export class ProfileSubscriptionComponent implements OnInit {
  profile: ProfileDTO | null = null;
  isLoading = false;
  errorMessage = '';

  selectedPlan: PlanType | null = null;
  isCreatingPaymentLink = false;
  createPaymentErrorMessage = '';

  constructor(
    private readonly profileService: ProfileService,
    private readonly paymentService: PaymentService,
    private readonly modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.isLoading = false;
      },
      error: (err: unknown) => {
        this.profile = null;
        this.isLoading = false;
        this.errorMessage = getHttpErrorMessage(err, {
          fallback: 'Não foi possível carregar os dados do perfil.'
        });
      }
    });
  }

  get currentPlanLabel(): string {
    const plan = this.profile?.planType;

    if (!plan) {
      return '';
    }

    if (plan === 'FREE') return 'Gratuito';
    if (plan === 'MONTHLY_RECURRENT') return 'Mensal';
    if (plan === 'YEARLY_RECURRENT') return 'Anual';

    return plan;
  }

  get selectedPlanLabel(): string {
    if (!this.selectedPlan) {
      return '';
    }

    if (this.selectedPlan === 'YEARLY_RECURRENT') return 'Anual';
    return 'Mensal';
  }

  formatBirthDate(value: string | null | undefined): string {
    if (!value) {
      return '-';
    }

    try {
      return formatLocalDate(parseIsoDate(value));
    } catch {
      return value;
    }
  }

  onEditProfile(): void {
    const modalRef = this.modalService.open(ProfileUpsertModalComponent, {
      centered: true,
      size: 'xl'
    });

    modalRef.componentInstance.profile = this.profile;

    modalRef.closed.subscribe((result) => {
      if (result) {
        this.profile = result as ProfileDTO;
      }
    });
  }

  formatDateTime(value: string | null | undefined): string {
    if (!value) {
      return '-';
    }

    try {
      return formatLocalDateTime(parseLocalDateTime(value));
    } catch {
      return value;
    }
  }

  createPaymentLink(): void {
    if (!this.selectedPlan || this.isCreatingPaymentLink) {
      return;
    }

    this.isCreatingPaymentLink = true;
    this.createPaymentErrorMessage = '';

    const subscriptionCycle = this.selectedPlan === 'MONTHLY_RECURRENT' ? 'MONTHLY' : 'YEARLY';

    this.paymentService
      .createPaymentLink({
        billingType: 'CREDIT_CARD',
        chargeType: 'RECURRENT',
        subscriptionCycle
      })
      .subscribe({
        next: (link) => {
          this.isCreatingPaymentLink = false;
          // eslint-disable-next-line no-console
          console.log('Payment link:', link);
          // eslint-disable-next-line no-console
          console.log('Payment URL:', link.url);
        },
        error: (err: unknown) => {
          this.isCreatingPaymentLink = false;
          this.createPaymentErrorMessage = getHttpErrorMessage(err, {
            fallback: 'Não foi possível gerar o link de pagamento.'
          });
        }
      });
  }
}
