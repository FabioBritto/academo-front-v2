import { Component, TemplateRef } from '@angular/core';

import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  templateUrl: './toast-container.component.html',
  styleUrls: ['./toast-container.component.scss']
})
export class ToastContainerComponent {
  constructor(public readonly toastService: ToastService) {}

  isTemplate(toast: unknown): toast is TemplateRef<unknown> {
    return toast instanceof TemplateRef;
  }
}
