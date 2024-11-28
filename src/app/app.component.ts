import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, HostBinding, HostListener, Inject, PLATFORM_ID, effect, signal } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { FilterOptions } from './interfaces/filter-options.interface';
import { ImageOptimizationService } from './services/image-optimization.service';
import { KeyboardNavigationService } from './services/keyboard-navigation.service';
import { PerformanceMonitorService } from './services/performance-monitor.service';
import { MatDialog } from '@angular/material/dialog';
import { CountryDetailsDialogComponent } from './components/country-details-dialog/country-details-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})

export class AppComponent {
  public pageSize = 20;
  public currentPage = 0;
  public allCountryData: any[] = [];
  public countryData: any[] = [];

  darkMode = signal<boolean>(
    JSON.parse(window.localStorage.getItem('darkMode') ?? 'false')
  );

  @HostBinding('class.dark') get mode() {
    return this.darkMode();
  }

  regionData: any;
  selectedRegion: String = "";
  searchTerm: String = "";
  filteredCountryData: any

  public isScrolling = false;
  private scrollTimeout: any;
  public isScrollingDown = false;
  private lastScrollTop = 0;

  filterOptions: FilterOptions = {
    populationRange: [],
    areaRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
    languages: [],
    currencies: [],
    regions: []
  };

  availableLanguages: string[] = [];
  availableCurrencies: string[] = [];

  readonly MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;

  constructor(
    private http: HttpClient,
    private performanceMonitor: PerformanceMonitorService,
    private imageOptimizer: ImageOptimizationService,
    @Inject(PLATFORM_ID) private platformId: Object,
    public keyboardNav: KeyboardNavigationService,
    private dialog: MatDialog
  ) {
    effect(() => {
      window.localStorage.setItem('darkMode', JSON.stringify(this.darkMode()));
    });
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
      this.isScrollingDown = currentScroll > this.lastScrollTop;
      this.isScrolling = true;
      
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = setTimeout(() => {
        this.isScrolling = false;
      }, 150);
      
      this.lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;

      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (windowHeight + currentScroll >= documentHeight - 1000) {
        this.loadMoreCountries();
      }
    }
  }

  private loadMoreCountries(): void {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    
    if (start < this.allCountryData.length) {
      this.countryData = [
        ...this.countryData,
        ...this.allCountryData.slice(start, end)
      ];
      this.currentPage++;
      this.filterCountries();
    }
  }

  filterByName(): void {
    this.filterCountries();
  }

  filterByRegion(): void {
    this.filterCountries();
  }

  formatNumberWithCommas(number: number): string {
    // Convert the number to a string and split it into integer and decimal parts
    const [integerPart, decimalPart] = number.toString().split('.');

    // Add commas to the integer part
    const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // Combine the integer part and decimal part (if exists)
    const formattedNumber = decimalPart
        ? `${formattedIntegerPart}.${decimalPart}`
        : formattedIntegerPart;

    return formattedNumber;
  }

  extractDistinctRegions(): void {
    // Use a Set to store unique regions
    const uniqueRegions = new Set<string>();

    // Iterate through the countryData array and add each region to the Set
    this.countryData.forEach((country: any) => {
      if (country.region) {
        uniqueRegions.add(country.region);
      }
    });

    // Convert the Set back to an array and assign it to the regionData variable
    this.regionData = Array.from(uniqueRegions);
  }

  ngOnInit(): void {
    this.performanceMonitor.startMeasurement('fetchCountries');
    this.http.get<any[]>('https://restcountries.com/v3.1/all').pipe(
      finalize(() => this.performanceMonitor.endMeasurement('fetchCountries'))
    ).subscribe({
      next: (data: any[]) => {
        this.allCountryData = data;
        this.countryData = data;
        this.extractAvailableFilters();
        this.extractDistinctRegions();
        this.filterCountries();
      },
      error: (error) => {
        console.error('Error fetching country data:', error);
      }
    });
  }

  getTitle(): string {
    if (this.searchTerm) {
      return `Search results for "${this.searchTerm}"`;
    } else if (this.selectedRegion) {
      return `Countries in ${this.selectedRegion}`;
    }
    return 'All Countries';
  }

  openWikipedia(countryName: string): void {
    // Replace spaces with underscores and handle special characters
    const formattedName = countryName
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_]/g, '');
    
    // Construct Wikipedia URL
    const wikipediaUrl = `https://en.wikipedia.org/wiki/${formattedName}`;
    
    // Open in new tab
    window.open(wikipediaUrl, '_blank');
  }

  ngOnDestroy() {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (isPlatformBrowser(this.platformId)) {
      switch (event.key) {
        case 'ArrowRight':
          this.navigateCountries(1);
          break;
        case 'ArrowLeft':
          this.navigateCountries(-1);
          break;
        case 'ArrowUp':
          this.navigateCountries(-4);
          break;
        case 'ArrowDown':
          this.navigateCountries(4);
          break;
        case 'Enter':
          const selectedIndex = this.keyboardNav.getSelectedIndex();
          if (selectedIndex >= 0 && this.filteredCountryData[selectedIndex]) {
            this.openWikipedia(this.filteredCountryData[selectedIndex].name.official);
          }
          break;
        case 'Escape':
          this.clearFilters();
          break;
      }
    }
  }

  private navigateCountries(delta: number): void {
    const currentIndex = this.keyboardNav.getSelectedIndex();
    const newIndex = currentIndex + delta;
    
    if (newIndex >= 0 && newIndex < this.filteredCountryData.length) {
      this.keyboardNav.setSelectedIndex(newIndex);
      this.scrollToCountry(newIndex);
    }
  }

  private scrollToCountry(index: number): void {
    const countryCards = document.querySelectorAll('mat-card');
    if (countryCards[index]) {
      countryCards[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  public clearFilters(): void {
    this.searchTerm = '';
    this.selectedRegion = '';
    this.filterOptions = {
      populationRange: [],
      areaRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
      languages: [],
      currencies: [],
      regions: []
    };
    this.filterCountries();
  }

  private extractAvailableFilters(): void {
    const languages = new Set<string>();
    const currencies = new Set<string>();

    this.allCountryData.forEach(country => {
      // Extract languages
      if (country.languages) {
        Object.values(country.languages).forEach(lang => 
          languages.add(lang as string));
      }
      
      // Extract currencies
      if (country.currencies) {
        Object.keys(country.currencies).forEach(currency => 
          currencies.add(currency));
      }
    });

    this.availableLanguages = Array.from(languages).sort();
    this.availableCurrencies = Array.from(currencies).sort();
  }

  filterCountries(): void {
    const startTime = performance.now();
    
    this.filteredCountryData = this.countryData.filter(country => {
      // Region filter
      if (this.selectedRegion && country.region !== this.selectedRegion) {
        return false;
      }

      // Search term filter
      if (this.searchTerm) {
        const searchTermLower = this.searchTerm.toLowerCase();
        if (!country.name.official.toLowerCase().includes(searchTermLower)) {
          return false;
        }
      }

      // Population range filter
      const population = country.population || 0;
      if (this.filterOptions.populationRange.length > 0) {
        const matchesAnyRange = this.filterOptions.populationRange.some(range => 
          population >= range.min && population <= range.max
        );
        if (!matchesAnyRange) {
          return false;
        }
      }

      // Languages filter
      if (this.filterOptions.languages.length > 0) {
        const countryLanguages = country.languages ? 
          Object.values(country.languages) : [];
        if (!this.filterOptions.languages.some(lang => 
          countryLanguages.includes(lang))) {
          return false;
        }
      }

      // Currencies filter
      if (this.filterOptions.currencies.length > 0) {
        const countryCurrencies = country.currencies ? 
          Object.keys(country.currencies) : [];
        if (!this.filterOptions.currencies.some(curr => 
          countryCurrencies.includes(curr))) {
          return false;
        }
      }

      return true;
    });

    const endTime = performance.now();
    this.performanceMonitor.trackFiltering(endTime - startTime);
  }

  openCountryDetails(country: any): void {
    const dialogRef = this.dialog.open(CountryDetailsDialogComponent, {
      data: country,
      width: '80vw',
      maxWidth: '1200px'
    });

    dialogRef.afterClosed().subscribe(borderCode => {
      if (borderCode) {
        const borderCountry = this.allCountryData.find(c => c.cca3 === borderCode);
        if (borderCountry) {
          this.openCountryDetails(borderCountry);
        }
      }
    });
  }
}
