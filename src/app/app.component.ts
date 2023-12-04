import { HttpClient } from '@angular/common/http';
import { Component, HostBinding, effect, signal } from '@angular/core';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']

})


export class AppComponent {
  constructor(private http: HttpClient) {
    effect(() => {
      window.localStorage.setItem('darkMode', JSON.stringify(this.darkMode()));
    });
  }

  darkMode = signal<boolean>(
    JSON.parse(window.localStorage.getItem('darkMode') ?? 'false')
  );


  @HostBinding('class.dark') get mode() {
    return this.darkMode();
  }

  countryData: any;
  regionData: any;
  selectedRegion: String = "";
  searchTerm: String = "";
  filteredCountryData: any

  filterByRegion(): void {
    console.log("Selected Region ==> ", this.selectedRegion)
    // Update filteredCountryData based on the selected region
    if (this.selectedRegion) {
      this.filteredCountryData = (this.countryData as any[]).filter(country => country.region === this.selectedRegion);
    } else {
      // If no region is selected, show all countries
      this.filteredCountryData = [...(this.countryData as any[])];
    }
  }

  filterByName(): void {
    if (this.searchTerm) {
      console.log(this.searchTerm)
      // Convert search term to lowercase for case-insensitive matching
      if (this.searchTerm == "") {
        this.filterByRegion();
      } else {
        this.filteredCountryData = (this.filteredCountryData as any[]).filter(country => {
          let searchTermLower = (this.searchTerm as String).toLowerCase();
          return (
            country.name &&
            country.name.official &&
            (country.name.official as String).toLowerCase().includes(searchTermLower)
          )
        });
      }
      console.log(this.filteredCountryData);
    } else {
      this.filterByRegion();
    }
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
    // Replace 'https://restcountries.com/v2/all' with the actual API endpoint
    this.http.get('https://restcountries.com/v3.1/all').subscribe(
      (data) => {
        console.log('fetching country data');
        this.countryData = data;
        this.filteredCountryData = data
        this.extractDistinctRegions();
        console.log(data);
      },
      (error) => {
        console.error('Error fetching country data:', error);
      }
    );
  }



}
