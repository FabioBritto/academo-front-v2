import {
  Component,
  forwardRef,
  Input
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

@Component({
  selector: 'app-input-group',
  templateUrl: './input-group.component.html',
  styleUrls: ['./input-group.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputGroupComponent),
      multi: true
    }
  ]
})
export class InputGroupComponent implements ControlValueAccessor {
  @Input() label = '';

  @Input() icon = 'bi bi-chat-square-text';

  @Input() placeholder = '';

  @Input() type = 'text';

  @Input() textarea = false;

  @Input() rows = 5;

  @Input() name?: string;

  @Input() invalid = false;

  value = '';

  isDisabled = false;

  private onChange: (value: string) => void = () => undefined;

  private onTouched: () => void = () => undefined;

  writeValue(value: unknown): void {
    this.value = value == null ? '' : String(value);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  handleInput(value: string): void {
    this.value = value;
    this.onChange(value);
  }

  handleBlur(): void {
    this.onTouched();
  }
}
