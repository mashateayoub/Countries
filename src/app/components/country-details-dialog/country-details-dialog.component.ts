import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-country-details-dialog',
  templateUrl: './country-details-dialog.component.html',
  styleUrls: ['./country-details-dialog.component.scss']
})
export class CountryDetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CountryDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  getLanguages(): string[] {
    return Object.values(this.data.languages || {});
  }

  getCurrencies(): string[] {
    return Object.entries(this.data.currencies || {}).map(
      ([code, currency]: [string, any]) => `${currency.name} (${currency.symbol})`
    );
  }

  getNativeNames(): string[] {
    return Object.values(this.data.name.nativeName || {}).map(
      (name: any) => name.official
    );
  }

  onClose(): void {
    this.dialogRef.close();
  }

  openGoogleMaps(): void {
    const url = `https://www.google.com/maps/place/${this.data.name.official}`;
    window.open(url, '_blank');
  }
} 