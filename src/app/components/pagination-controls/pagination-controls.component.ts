import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination-controls',
  templateUrl: './pagination-controls.component.html',
  styleUrls: ['./pagination-controls.component.scss']
})
export class PaginationControlsComponent {
  @Input() page = 0;
  @Input() totalPages = 0;
  @Input() disabled = false;

  @Output() pageChange = new EventEmitter<number>();

  get canGoPrev(): boolean {
    return !this.disabled && this.page > 0;
  }

  get canGoNext(): boolean {
    return !this.disabled && this.totalPages > 0 && this.page < this.totalPages - 1;
  }

  prev(): void {
    if (!this.canGoPrev) {
      return;
    }

    this.pageChange.emit(this.page - 1);
  }

  next(): void {
    if (!this.canGoNext) {
      return;
    }

    this.pageChange.emit(this.page + 1);
  }

  get displayPage(): number {
    return this.totalPages > 0 ? this.page + 1 : 0;
  }
}
