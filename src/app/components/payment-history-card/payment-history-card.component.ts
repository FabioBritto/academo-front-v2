import { Component, Input, OnInit } from '@angular/core';

import type { Page } from '../../model/common.model';
import type { PaymentHistoryDTO, PaymentStatus, PlanType } from '../../model/payment.model';
import { PaymentService } from '../../services/payment.service';
import { formatLocalDate, formatLocalDateTime, parseIsoDate, parseLocalDateTime } from '../../utils/date.util';
import { getHttpErrorMessage } from '../../utils/http-error.util';

@Component({
  selector: 'app-payment-history-card',
  templateUrl: './payment-history-card.component.html',
  styleUrls: ['./payment-history-card.component.scss']
})
export class PaymentHistoryCardComponent implements OnInit {
  @Input() emptyMessage = 'Em breve você verá seu histórico de pagamentos aqui.';

  isLoading = false;
  errorMessage = '';

  page: Page<PaymentHistoryDTO> | null = null;
  items: PaymentHistoryDTO[] = [];

  constructor(private readonly paymentService: PaymentService) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.paymentService
      .listHistoryPaged({ page: 0, size: 6 })
      .subscribe({
        next: (page) => {
          this.page = page;
          this.items = page.content ?? [];
          this.isLoading = false;
        },
        error: (err: unknown) => {
          this.page = null;
          this.items = [];
          this.isLoading = false;
          this.errorMessage = getHttpErrorMessage(err, {
            fallback: 'Não foi possível carregar o histórico de pagamentos.'
          });
        }
      });
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
}
