import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

export interface AdvancedDropdownItem {
  id: number;
  name: string;
}

@Component({
  selector: 'app-advanced-dropdown',
  templateUrl: './advanced-dropdown.component.html',
  styleUrls: ['./advanced-dropdown.component.scss']
})
export class AdvancedDropdownComponent {
  @Input() label = 'Selecionar';
  @Input() items: AdvancedDropdownItem[] = [];
  @Input() selectedId?: number;
  @Input() disabled = false;

  @Output() selected = new EventEmitter<AdvancedDropdownItem>();

  isOpen = false;

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  get selectedLabel(): string {
    const selected = this.items.find((i) => i.id === this.selectedId);
    return selected?.name ?? this.label;
  }

  toggle(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.disabled) {
      return;
    }

    this.isOpen = !this.isOpen;
  }

  choose(item: AdvancedDropdownItem, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.disabled) {
      return;
    }

    this.selected.emit(item);
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen) {
      return;
    }

    const target = event.target as Node | null;
    if (target && this.elementRef.nativeElement.contains(target)) {
      return;
    }

    this.isOpen = false;
  }
}
