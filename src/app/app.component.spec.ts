import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { AppModule } from './app.module';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppModule, HttpClientTestingModule, NoopAnimationsModule],
    }).compileComponents();
  });

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('describes the active search before the region filter', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.getTitle()).toBe('All Countries');
    app.selectedRegion = 'Africa';
    expect(app.getTitle()).toBe('Countries in Africa');
    app.searchTerm = 'Morocco';
    expect(app.getTitle()).toBe('Search results for "Morocco"');
  });

  it('renders the current heading without calling the real countries API', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    TestBed.inject(HttpTestingController)
      .expectOne(request => request.url.startsWith('https://restcountries.com/v3.1/all'))
      .flush([]);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('All Countries');
    fixture.componentInstance.selectedRegion = 'Europe';
    fixture.detectChanges();
    expect(compiled.querySelector('h1')?.textContent).toContain('Countries in Europe');
  });
});
