import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

import type { CalculationType } from '../../model/subjects.model';

interface CalculationTypeItem {
  label: string;
  value: CalculationType;
}

@Component({
  selector: 'app-calculation-type-dropdown',
  templateUrl: './calculation-type-dropdown.component.html',
  styleUrls: ['./calculation-type-dropdown.component.scss']
})
export class CalculationTypeDropdownComponent {
  @Input() label = 'Tipo de cálculo';
  @Input() value: CalculationType = 'MEDIA_ARITMETICA';
  @Input() disabled = false;

  @Output() valueChange = new EventEmitter<CalculationType>();

  isOpen = false;

  readonly items: CalculationTypeItem[] = [
    { label: 'Média Aritmética', value: 'MEDIA_ARITMETICA' },
    { label: 'Média Ponderada', value: 'MEDIA_PONDERADA' }
  ];

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  get selectedLabel(): string {
    const selected = this.items.find((i) => i.value === this.value);
    return selected?.label ?? this.label;
  }

  toggle(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.disabled) {
      return;
    }

    this.isOpen = !this.isOpen;
  }

  choose(item: CalculationTypeItem, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.disabled) {
      return;
    }

    this.value = item.value;
    this.valueChange.emit(item.value);
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
