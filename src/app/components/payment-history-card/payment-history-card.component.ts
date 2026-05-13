import { Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

import type { Page } from '../../model/common.model';
import type { PaymentHistoryDTO, PaymentStatus, PlanType } from '../../model/payment.model';
import { PaymentService } from '../../services/payment.service';
import { ToastService } from '../../services/toast.service';
import { formatLocalDate, formatLocalDateTime, parseIsoDate, parseLocalDateTime } from '../../utils/date.util';
import { getHttpErrorMessage } from '../../utils/http-error.util';

@Component({
  selector: 'app-payment-history-card',
  templateUrl: './payment-history-card.component.html',
  styleUrls: ['./payment-history-card.component.scss']
})
export class PaymentHistoryCardComponent implements OnInit, OnDestroy {
  @Input() emptyMessage = 'Em breve você verá seu histórico de pagamentos aqui.';

  private readonly destroy$ = new Subject<void>();

  readonly pageSize = 8;
  pageIndex = 0;
  totalPages = 0;

  isLoading = false;
  errorMessage = '';

  page: Page<PaymentHistoryDTO> | null = null;
  items: PaymentHistoryDTO[] = [];

  cancelingPaymentId: string | null = null;

  isPremiumActivatedHelpOpen = false;

  @ViewChild('premiumActivatedHelpWrapper', { static: false }) premiumActivatedHelpWrapper?: ElementRef<HTMLElement>;

  constructor(
    private readonly paymentService: PaymentService,
    private readonly toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadHistory();

    this.paymentService.historyRefresh$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadHistory(this.pageIndex);
    });
  }

  togglePremiumActivatedHelp(): void {
    this.isPremiumActivatedHelpOpen = !this.isPremiumActivatedHelpOpen;
  }

  closePremiumActivatedHelp(): void {
    this.isPremiumActivatedHelpOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isPremiumActivatedHelpOpen) {
      return;
    }

    const wrapperEl = this.premiumActivatedHelpWrapper?.nativeElement;
    const target = event.target as Node | null;
    if (!wrapperEl || !target) {
      return;
    }

    if (!wrapperEl.contains(target)) {
      this.closePremiumActivatedHelp();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent): void {
    if (!this.isPremiumActivatedHelpOpen) {
      return;
    }

    if (event.key === 'Escape') {
      this.closePremiumActivatedHelp();
    }
  }

  get premiumActivatedHelpEligibleItem(): PaymentHistoryDTO | null {
    const item = this.items?.[0] ?? null;
    if (!item) {
      return null;
    }

    return this.isEligibleForPremiumActivatedTooltip(item) ? item : null;
  }

  isEligibleForPremiumActivatedTooltip(item: PaymentHistoryDTO): boolean {
    if (!item || item.paymentStatus !== 'PAID') {
      return false;
    }

    const dueDateRaw = String(item.planDueDate ?? '').trim();
    if (!dueDateRaw) {
      return false;
    }

    try {
      const dueDate = parseIsoDate(dueDateRaw);
      dueDate.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return dueDate.getTime() >= today.getTime();
    } catch {
      return false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadHistory(pageIndex: number = 0): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.closePremiumActivatedHelp();

    this.pageIndex = pageIndex;

    this.paymentService
      .listHistoryPaged({ page: pageIndex, size: this.pageSize })
      .subscribe({
        next: (page) => {
          this.page = page;
          const items = page.content ?? [];
          this.items = [...items].sort((a, b) => {
            const aWaiting = a.paymentStatus === 'WAITING_PAYMENT' ? 1 : 0;
            const bWaiting = b.paymentStatus === 'WAITING_PAYMENT' ? 1 : 0;
            if (aWaiting !== bWaiting) {
              return bWaiting - aWaiting;
            }

            const aTime = new Date(a.createdAt).getTime();
            const bTime = new Date(b.createdAt).getTime();
            const aSafe = Number.isNaN(aTime) ? 0 : aTime;
            const bSafe = Number.isNaN(bTime) ? 0 : bTime;
            return bSafe - aSafe;
          });
          this.totalPages = page.totalPages ?? 0;
          this.isLoading = false;
        },
        error: (err: unknown) => {
          this.page = null;
          this.items = [];
          this.totalPages = 0;
          this.isLoading = false;
          this.errorMessage = getHttpErrorMessage(err, {
            fallback: 'Não foi possível carregar o histórico de pagamentos.'
          });
        }
      });
  }

  onPageChange(page: number): void {
    this.loadHistory(page);
  }

  formatBrl(value: number): string {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  planLabel(planType: PlanType): string {
    if (planType === 'MONTHLY_RECURRENT') return 'Mensal';
    return 'Anual';
  }

  statusLabel(status: PaymentStatus): string {
    if (status === 'PAID') return 'Pago';
    if (status === 'WAITING_PAYMENT') return 'Aguardando pagamento';
    if (status === 'CANCELED') return 'Cancelado';
    if (status === 'EXPIRED') return 'Expirado';
    return status;
  }

  formatDate(value: string | null | undefined): string {
    if (!value) {
      return '-';
    }

    try {
      return formatLocalDate(parseIsoDate(value));
    } catch {
      return value;
    }
  }

  formatDateTime(value: string | null | undefined): string {
    if (!value) {
      return '-';
    }

    try {
      return formatLocalDateTime(parseLocalDateTime(value)).split(' ')[0];
    } catch {
      return value;
    }
  }

  chargeDueDate(createdAt: string | null | undefined): string {
    if (!createdAt) {
      return '-';
    }

    try {
      const date = new Date(createdAt);
      if (Number.isNaN(date.getTime())) {
        return '-';
      }

      const dueDate = new Date(date);
      dueDate.setDate(dueDate.getDate() + 2);
      return formatLocalDate(dueDate);
    } catch {
      return '-';
    }
  }

  openUrl(url: string): void {
    if (!url) {
      return;
    }

    window.open(url, '_blank', 'noopener');
  }

  cancelPayment(item: PaymentHistoryDTO): void {
    if (this.isLoading || this.cancelingPaymentId) {
      return;
    }

    if (!item?.paymentId || item.paymentStatus !== 'WAITING_PAYMENT') {
      return;
    }

    this.cancelingPaymentId = item.paymentId;

    this.paymentService.cancelPaymentLink(item.paymentId).subscribe({
      next: () => {
        this.cancelingPaymentId = null;
        this.toastService.show('Cobrança cancelada com sucesso.', {
          classname: 'bg-success text-light',
          delay: 3500,
          autohide: true
        });
        this.loadHistory(this.pageIndex);
      },
      error: (err: unknown) => {
        this.cancelingPaymentId = null;
        this.errorMessage = getHttpErrorMessage(err, {
          fallback: 'Não foi possível cancelar a cobrança.'
        });
      }
    });
  }
}
