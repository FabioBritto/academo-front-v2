import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface SortFilterOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-sort-filters',
  templateUrl: './sort-filters.component.html',
  styleUrls: ['./sort-filters.component.scss']
})
export class SortFiltersComponent {
  @Input({ required: true }) value!: string;
  @Input() options: SortFilterOption[] = [];

  @Output() valueChange = new EventEmitter<string>();

  select(nextValue: string): void {
    if (nextValue === this.value) {
      return;
    }

    this.valueChange.emit(nextValue);
  }

  isActive(option: SortFilterOption): boolean {
    return option.value === this.value;
  }
}
