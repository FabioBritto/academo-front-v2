import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface TabOption {
  label: string;
  value: string;
  iconClass?: string;
  ariaLabel?: string;
}

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class TabsComponent {
  @Input({ required: true }) value!: string;
  @Input() options: TabOption[] = [];

  @Output() valueChange = new EventEmitter<string>();

  select(nextValue: string): void {
    if (nextValue === this.value) {
      return;
    }

    this.valueChange.emit(nextValue);
  }

  isActive(option: TabOption): boolean {
    return option.value === this.value;
  }
}
