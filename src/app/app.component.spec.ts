import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();
  });

  it('renders the shell: skip link, header, main and footer', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.skip-link')?.getAttribute('href')).toBe('#main-content');
    expect(el.querySelector('app-header nav[aria-label="Main"]')).toBeTruthy();
    expect(el.querySelector('main#main-content')).toBeTruthy();
    expect(el.querySelector('app-footer')?.textContent).toContain('Tapeswaram Vaari Sweet Estate');
  });

  it('shows the call/enquire button instead of a WhatsApp link when no number is configured', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const fab: HTMLElement = fixture.nativeElement.querySelector('app-contact-fab');
    expect(fab.innerHTML).not.toContain('wa.me');
    expect(fab.querySelector('button[aria-expanded]')).toBeTruthy();
  });
});
