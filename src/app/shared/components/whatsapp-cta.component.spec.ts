import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ContentStore } from '../../core/state/content.store';
import { WhatsAppCtaComponent } from './whatsapp-cta.component';

describe('WhatsAppCtaComponent', () => {
  function render() {
    TestBed.configureTestingModule({ imports: [WhatsAppCtaComponent], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(WhatsAppCtaComponent);
    fixture.componentRef.setInput('message', 'Hello Sweet Estate');
    return fixture;
  }

  afterEach(() => TestBed.inject(ContentStore).resetToDefaults());

  it('falls back to the contact form when no WhatsApp number is configured', () => {
    const fixture = render();
    fixture.detectChanges();
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(link.getAttribute('href')).toBe('/contact');
    expect(fixture.nativeElement.innerHTML).not.toContain('wa.me');
  });

  it('renders nothing when fallback is disabled and no number is configured', () => {
    const fixture = render();
    fixture.componentRef.setInput('showFallback', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('a')).toBeNull();
  });

  it('links to wa.me with the prefilled message once configured', () => {
    const fixture = render();
    TestBed.inject(ContentStore).saveSettings({
      whatsappNumber: '919876543210',
      social: { instagram: null, facebook: null, youtube: null },
    });
    fixture.detectChanges();
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(link.href).toBe('https://wa.me/919876543210?text=Hello%20Sweet%20Estate');
    expect(link.rel).toContain('noopener');
  });
});
