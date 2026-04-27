import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-payment-history-card',
  templateUrl: './payment-history-card.component.html',
  styleUrls: ['./payment-history-card.component.scss']
})
export class PaymentHistoryCardComponent {
  @Input() emptyMessage = 'Em breve você verá seu histórico de pagamentos aqui.';
}
