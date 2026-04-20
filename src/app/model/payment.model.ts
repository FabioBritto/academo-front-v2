export type BillingType = 'BOLETO' | 'CREDIT_CARD' | 'PIX';
export type ChargeType = 'DETACHED' | 'RECURRENT' | 'INSTALLMENT';
export type SubscriptionCycle = 'MONTHLY' | 'YEARLY';
export type PaymentStatus = 'PAID' | 'WAITING_PAYMENT' | 'EXPIRED' | 'CANCELED';

export interface PaymentOptionsDTO {
  billingType: BillingType;
  chargeType: ChargeType;
  subscriptionCycle: SubscriptionCycle;
}

export interface PaymentLinkDTO {
  id: string;
  name: string;
  value: number;
  active: boolean;
  chargeType: ChargeType;
  url: string;
  billingType: BillingType;
  subscriptionCycle: SubscriptionCycle;
  description: string;
  date: string;
  deleted: boolean;
  viewCount: number;
  maxInstallmentCount: number;
  dueDateLimitDays: number;
  notificationEnabled: boolean;
  isAddressRequired: boolean;
  externalReference: string;
}

export interface PaymentHistoryDTO {
  paymentHistoryId: number;
  paymentId: string;
  paymentStatus: PaymentStatus;
  value: number;
  planDueDate: string;
  createdAt: string;
  updatedAt: string;
}
