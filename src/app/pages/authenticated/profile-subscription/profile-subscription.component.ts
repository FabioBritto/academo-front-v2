import { Component, OnInit } from '@angular/core';

import type { PlanType } from '../../../model/auth.model';
import type { ProfileDTO } from '../../../model/profile.model';
import { PaymentService } from '../../../services/payment.service';
import { ProfileService } from '../../../services/profile.service';
import { formatLocalDate, formatLocalDateTime, parseLocalDate, parseLocalDateTime } from '../../../utils/date.util';
import { getHttpErrorMessage } from '../../../utils/http-error.util';

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
    private readonly paymentService: PaymentService
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

    return plan === 'MONTHLY_RECURRENT' ? 'Mensal' : 'Anual';
  }

  get selectedPlanLabel(): string {
    if (!this.selectedPlan) {
      return '';
    }

    return this.selectedPlan === 'MONTHLY_RECURRENT' ? 'Mensal' : 'Anual';
  }

  formatBirthDate(value: string | null | undefined): string {
    if (!value) {
      return '-';
    }

    try {
      return formatLocalDate(parseLocalDate(value));
    } catch {
      return value;
    }
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
