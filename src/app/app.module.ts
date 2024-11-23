import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CountryDetailsDialogComponent } from './components/country-details-dialog/country-details-dialog.component';
import { FooterComponent } from './components/footer/footer.component';
import { LazyLoadDirective } from './directives/lazy-load.directive';
import { ImageOptimizationService } from './services/image-optimization.service';
import { KeyboardNavigationService } from './services/keyboard-navigation.service';
import { PerformanceMonitorService } from './services/performance-monitor.service';

@NgModule({
  declarations: [
    AppComponent,
    LazyLoadDirective,
    FooterComponent,
    CountryDetailsDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatListModule,
    MatChipsModule
  ],
  providers: [
    ImageOptimizationService,
    PerformanceMonitorService,
    KeyboardNavigationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }




