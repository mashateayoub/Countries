import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ImageOptimizationService {
  private cache = new Map<string, string>();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  constructor(private http: HttpClient) {}

  optimizeAndCacheImage(url: string): Observable<string> {
    if (this.cache.has(url)) {
      return of(this.cache.get(url)!);
    }

    return this.http.get(url, { responseType: 'blob' }).pipe(
      switchMap(blob => from(this.blobToDataUrl(blob))),
      map(dataUrl => {
        this.cache.set(url, dataUrl);
        
        // Clear cache after duration
        setTimeout(() => {
          this.cache.delete(url);
        }, this.CACHE_DURATION);

        return dataUrl;
      }),
      catchError(() => of(url))
    );
  }

  private blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
} 