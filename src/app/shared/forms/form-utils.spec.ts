import { FormControl } from '@angular/forms';
import { indianMobileValidator, looksLikeSpam, normaliseMobile, notInPastValidator, todayIso } from './form-utils';

describe('form utils', () => {
  it('validates Indian mobile numbers in common formats', () => {
    for (const ok of ['9876543210', '+91 98765 43210', '91-9876543210', '098765 43210', '6000012345']) {
      expect(indianMobileValidator(new FormControl(ok))).withContext(ok).toBeNull();
    }
    for (const bad of ['12345', '5876543210', '98765432101', 'abcdefghij']) {
      expect(indianMobileValidator(new FormControl(bad))).withContext(bad).toEqual({ mobile: true });
    }
  });

  it('normalises mobile numbers to +91 format', () => {
    expect(normaliseMobile('098765 43210')).toBe('+919876543210');
    expect(normaliseMobile('+91 98765-43210')).toBe('+919876543210');
  });

  it('rejects past dates but accepts today', () => {
    expect(notInPastValidator(new FormControl('2000-01-01'))).toEqual({ pastDate: true });
    expect(notInPastValidator(new FormControl(todayIso()))).toBeNull();
  });

  it('flags honeypot submissions and instant submissions as spam', () => {
    const now = 100_000;
    expect(looksLikeSpam('http://spam', now - 10_000, now)).toBeTrue();
    expect(looksLikeSpam('', now - 500, now)).toBeTrue();
    expect(looksLikeSpam('', now - 10_000, now)).toBeFalse();
  });
});
