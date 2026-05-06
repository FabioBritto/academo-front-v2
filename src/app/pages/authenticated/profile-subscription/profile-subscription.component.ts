import { Component, OnInit } from '@angular/core';

import type { PlanType } from '../../../model/auth.model';
import type { ProfileDTO } from '../../../model/profile.model';
import type { PaymentHistoryDTO } from '../../../model/payment.model';
import { ConfirmActionModalComponent } from '../../../components/confirm-action-modal/confirm-action-modal.component';
import { ProfileUpsertModalComponent } from '../../../components/profile-upsert-modal/profile-upsert-modal.component';
import { PaymentService } from '../../../services/payment.service';
import { ProfileService } from '../../../services/profile.service';
import { formatLocalDate, formatLocalDateTime, parseIsoDate, parseLocalDateTime } from '../../../utils/date.util';
import { getHttpErrorMessage } from '../../../utils/http-error.util';
import { formatBytes } from '../../../utils/storage.util';
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

  hasWaitingPayment = false;

  private readonly monthlyPrice = 17.9;
  private readonly yearlyPrice = 149.9;

  get displayFullName(): string {
    const name = this.profile?.fullName ?? '';
    const maxLen = 40;

    if (name.length <= maxLen) {
      return name;
    }

    return `${name.slice(0, maxLen).trimEnd()}...`;
  }

  get displayUserUseStorage(): string {
    return formatBytes(this.profile?.userUseStorage);
  }

  formatBrl(value: number): string {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  constructor(
    private readonly profileService: ProfileService,
    private readonly paymentService: PaymentService,
    private readonly modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadProfile();
    this.loadWaitingPaymentFlag();
  }

  private loadWaitingPaymentFlag(): void {
    this.paymentService.listHistoryPaged({ page: 0, size: 50 }).subscribe({
      next: (page) => {
        const items: PaymentHistoryDTO[] = page.content ?? [];
        this.hasWaitingPayment = items.some((item) => item.paymentStatus === 'WAITING_PAYMENT');
      },
      error: () => {
        this.hasWaitingPayment = false;
      }
    });
  }

  get yearlyDiscountPercent(): number {
    const original = this.monthlyPrice * 12;
    const discount = 1 - this.yearlyPrice / original;
    return Math.round(discount * 100);
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

    modalRef.componentInstance.profile = this.profile ? { ...this.profile } : null;

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

  onSubscribeMonthly(): void {
    this.openSubscribeConfirm('MONTHLY_RECURRENT');
  }

  onSubscribeYearly(): void {
    this.openSubscribeConfirm('YEARLY_RECURRENT');
  }

  private openSubscribeConfirm(plan: PlanType): void {
    if (this.isCreatingPaymentLink || this.hasWaitingPayment) {
      return;
    }

    const modalRef = this.modalService.open(ConfirmActionModalComponent, {
      centered: true
    });

    const planLabel = plan === 'YEARLY_RECURRENT' ? 'Anual' : 'Mensal';

    modalRef.componentInstance.title = 'Confirmar assinatura';
    modalRef.componentInstance.message = `Você confirma a assinatura do plano ${planLabel}?`;
    modalRef.componentInstance.confirmLabel = 'Confirmar';
    modalRef.componentInstance.cancelLabel = 'Cancelar';

    modalRef.closed.subscribe((confirmed) => {
      if (confirmed === true) {
        this.selectedPlan = plan;
        this.createPaymentLink();
      }
    });
  }
}
