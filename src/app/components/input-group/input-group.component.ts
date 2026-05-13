import {
  Attribute,
  Component,
  EventEmitter,
  forwardRef,
  Host,
  Input,
  Optional,
  Output
} from '@angular/core';
import {
  ControlValueAccessor,
  ControlContainer,
  NG_VALUE_ACCESSOR,
  Validators
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
  @Input() id?: string;

  @Input() label = '';

  @Input() icon = 'bi bi-chat-square-text';

  @Input() placeholder = '';

  @Input() type = 'text';

  @Input() inputMode?: string;

  @Input() pattern?: string;

  @Input() mask?: string;

  @Input() dropSpecialCharacters: boolean | string[] | readonly string[] | null = null;

  @Input() min?: string | number;

  @Input() max?: string | number;

  @Input() step?: string | number;

  @Input() maxLength?: number;

  @Input() showPasswordToggle = false;

  @Input() textarea = false;

  @Input() rows = 5;

  @Input() name?: string;

  @Input() invalid = false;

  @Input() readOnly = false;

  @Output() blurred = new EventEmitter<void>();

  isPasswordVisible = false;

  constructor(
    @Optional() @Host() private readonly controlContainer: ControlContainer | null,
    @Optional() @Attribute('formControlName') private readonly formControlName: string | null
  ) {}

  get isRequired(): boolean {
    const form = this.controlContainer?.control;
    const controlName = this.formControlName;

    if (!form || !controlName) {
      return false;
    }

    const control = form.get(controlName);
    if (!control) {
      return false;
    }

    const hasValidator = (control as unknown as { hasValidator?: (v: unknown) => boolean }).hasValidator;
    if (typeof hasValidator !== 'function') {
      return false;
    }

    return control.hasValidator(Validators.required);
  }

  get resolvedType(): string {
    if (this.type !== 'password') {
      return this.type;
    }

    return this.isPasswordVisible ? 'text' : 'password';
  }

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
    this.blurred.emit();
  }

  togglePasswordVisibility(): void {
    if (this.isDisabled) {
      return;
    }

    this.isPasswordVisible = !this.isPasswordVisible;
  }
}
