import { Injectable, TemplateRef } from '@angular/core';

export interface ToastOptions {
  classname?: string;
  delay?: number;
  autohide?: boolean;
}

export interface ToastItem {
  textOrTpl: string | TemplateRef<unknown>;
  classname?: string;
  delay?: number;
  autohide?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts: ToastItem[] = [];

  show(textOrTpl: string | TemplateRef<unknown>, options: ToastOptions = {}): void {
    this.toasts.push({ textOrTpl, ...options });
  }

  remove(toast: ToastItem): void {
    this.toasts = this.toasts.filter((t) => t !== toast);
  }

  clear(): void {
    this.toasts = [];
  }
}
