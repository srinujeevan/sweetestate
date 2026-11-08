import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Indian mobile: optional +91 / 91 / 0 prefix, 10 digits starting 6–9; spaces/dashes allowed. */
export const INDIAN_MOBILE = /^(?:\+?91[\s-]?|0)?[6-9]\d{4}[\s-]?\d{5}$/;

export const indianMobileValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value ?? '').trim();
  if (!value) return null;
  return INDIAN_MOBILE.test(value) ? null : { mobile: true };
};

/** Rejects values made only of whitespace. */
export const notBlankValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (typeof value !== 'string' || value.length === 0) return null;
  return value.trim().length ? null : { blank: true };
};

/** Local date as YYYY-MM-DD. */
export function todayIso(now: Date = new Date()): string {
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export const notInPastValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value ?? '');
  if (!value) return null;
  return value >= todayIso() ? null : { pastDate: true };
};

/** Normalises an Indian mobile number to +91XXXXXXXXXX. */
export function normaliseMobile(value: string): string {
  const digits = value.replace(/\D/g, '');
  return '+91' + digits.slice(-10);
}

export function optionalText(value: string | null | undefined, max: number): string | null {
  const trimmed = (value ?? '').trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

/** Bots typically submit instantly or fill hidden fields. */
export const MIN_FILL_TIME_MS = 2000;

export function looksLikeSpam(honeypot: string, startedAt: number, now = Date.now()): boolean {
  return honeypot.trim().length > 0 || now - startedAt < MIN_FILL_TIME_MS;
}

/** Human-readable message for the first error on a control. */
export function errorMessage(control: AbstractControl | null, label: string, verb: 'enter' | 'choose' = 'enter'): string | null {
  const e = control?.errors;
  if (!e) return null;
  // Validators.requiredTrue reports its failure under the 'required' key.
  if (e['required'] && typeof control?.value === 'boolean') return 'Please tick this box to continue.';
  if (e['required']) return `Please ${verb} ${label}.`;
  if (e['blank']) return `Please enter ${label}.`;
  if (e['mobile']) return 'Please enter a valid 10-digit Indian mobile number.';
  if (e['email']) return 'Please enter a valid email address, or leave it blank.';
  if (e['minlength']) return `Please enter at least ${e['minlength'].requiredLength} characters.`;
  if (e['maxlength']) return `Please keep this under ${e['maxlength'].requiredLength} characters.`;
  if (e['pastDate']) return 'Please choose today or a future date.';
  return `Please check ${label}.`;
}

/** Focuses the first invalid field inside a form element. */
export function focusFirstInvalid(form: HTMLElement | null | undefined): void {
  const el = form?.querySelector<HTMLElement>('[aria-invalid="true"], .ng-invalid:not(form):not(fieldset)');
  el?.focus();
}
