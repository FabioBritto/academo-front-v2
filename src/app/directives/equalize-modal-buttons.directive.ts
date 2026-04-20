import {
  AfterViewInit,
  Directive,
  ElementRef,
  NgZone,
  OnDestroy
} from '@angular/core';

@Directive({
  selector: '[appEqualizeModalButtons]'
})
export class EqualizeModalButtonsDirective implements AfterViewInit, OnDestroy {
  private resizeHandler?: () => void;

  constructor(
    private readonly host: ElementRef<HTMLElement>,
    private readonly zone: NgZone
  ) {}

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.equalize();

      const handler = () => this.equalize();
      window.addEventListener('resize', handler);
      this.resizeHandler = () => window.removeEventListener('resize', handler);
    });
  }

  ngOnDestroy(): void {
    this.resizeHandler?.();
  }

  private equalize(): void {
    const container = this.host.nativeElement;
    const buttons = Array.from(container.querySelectorAll('app-submit-button'));

    if (buttons.length === 0) {
      return;
    }

    for (const btn of buttons) {
      (btn as HTMLElement).style.minWidth = '';
    }

    let maxWidth = 0;

    for (const btn of buttons) {
      const width = (btn as HTMLElement).getBoundingClientRect().width;
      if (width > maxWidth) {
        maxWidth = width;
      }
    }

    if (maxWidth <= 0) {
      return;
    }

    for (const btn of buttons) {
      (btn as HTMLElement).style.minWidth = `${Math.ceil(maxWidth)}px`;
    }
  }
}
