import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { RegisterModalComponent } from '../../components/register-modal/register-modal.component';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent {
  contactForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private readonly modalService: NgbModal
  ) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  openRegisterModal(): void {
    this.modalService.open(RegisterModalComponent, {
      centered: true,
      windowClass: 'register-modal'
    });
  }

  onContactSubmit(value: Record<string, unknown>): void {
    const email = 'academo.contato@gmail.com';

    const name = String(value['name'] ?? '').trim();
    const fromEmail = String(value['email'] ?? '').trim();
    const subject = String(value['subject'] ?? '').trim();
    const message = String(value['message'] ?? '').trim();

    const mailSubject = subject || 'Contato - Academo';
    const bodyLines = [
      `Nome: ${name}`,
      `Email: ${fromEmail}`,
      '',
      message
    ];

    const mailto = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;
    window.location.href = mailto;
  }
}
