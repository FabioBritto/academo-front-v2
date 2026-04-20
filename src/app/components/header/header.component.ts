import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Output() registerClick = new EventEmitter<void>();

  @Output() loginClick = new EventEmitter<void>();

  isMenuOpen = false;

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  onRegisterClick(): void {
    this.closeMenu();
    this.registerClick.emit();
  }

  onLoginClick(): void {
    this.closeMenu();
    this.loginClick.emit();
  }
}
