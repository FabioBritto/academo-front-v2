import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { AuthService } from '../../services/auth.service';
import { ConfirmActionModalComponent } from '../confirm-action-modal/confirm-action-modal.component';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent {
  constructor(
    private readonly authService: AuthService,
    private readonly modalService: NgbModal,
    private readonly router: Router
  ) {}

  logout(): void {
    const modalRef = this.modalService.open(ConfirmActionModalComponent, {
      centered: true
    });

    modalRef.componentInstance.title = 'Encerrar sessão';
    modalRef.componentInstance.message = 'Tem certeza que deseja encerrar sua sessão?';
    modalRef.componentInstance.confirmLabel = 'Confirmar';
    modalRef.componentInstance.cancelLabel = 'Cancelar';

    modalRef.closed.subscribe((confirmed) => {
      if (confirmed === true) {
        this.authService.logout();
        void this.router.navigate(['/'], { replaceUrl: true });
      }
    });
  }
}
