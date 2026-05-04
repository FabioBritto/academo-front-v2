import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

export interface ActivityTypeDropdownItem {
  id: number;
  name: string;
}

@Component({
  selector: 'app-activity-type-dropdown',
  templateUrl: './activity-type-dropdown.component.html',
  styleUrls: ['./activity-type-dropdown.component.scss']
})
export class ActivityTypeDropdownComponent {
  @Input() label = 'Tipo de atividade';
  @Input() items: ActivityTypeDropdownItem[] = [];
  @Input() value: number | null = null;
  @Input() disabled = false;

  @Output() valueChange = new EventEmitter<number>();

  isOpen = false;

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  get selectedLabel(): string {
    const selected = this.items.find((i) => i.id === this.value);
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

  choose(item: ActivityTypeDropdownItem, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.disabled) {
      return;
    }

    this.value = item.id;
    this.valueChange.emit(item.id);
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
