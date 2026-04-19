import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type { Page } from '../model/common.model';
import type { PaymentHistoryDTO, PaymentLinkDTO, PaymentOptionsDTO } from '../model/payment.model';
import { API_BASE_URL } from './api.config';
import type { PageRequest } from '../utils/pagination.util';
import { withPageParams } from '../utils/pagination.util';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor(private readonly http: HttpClient) {}

  createPaymentLink(body: PaymentOptionsDTO): Observable<PaymentLinkDTO> {
    return this.http.post<PaymentLinkDTO>(`${API_BASE_URL}/payment`, body);
  }

  listHistoryPaged(pageRequest?: PageRequest): Observable<Page<PaymentHistoryDTO>> {
    const params = withPageParams(new HttpParams(), pageRequest);
    return this.http.get<Page<PaymentHistoryDTO>>(`${API_BASE_URL}/payment`, { params });
  }

  cancel(): Observable<void> {
    return this.http.post<void>(`${API_BASE_URL}/payment/cancel`, null);
  }
}
