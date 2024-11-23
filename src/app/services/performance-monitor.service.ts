import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PerformanceMonitorService {
  private metrics: { [key: string]: number[] } = {};

  startMeasurement(name: string) {
    performance.mark(`${name}-start`);
  }

  endMeasurement(name: string) {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const measure = performance.getEntriesByName(name).pop();
    if (measure) {
      if (!this.metrics[name]) {
        this.metrics[name] = [];
      }
      this.metrics[name].push(measure.duration);
    }
  }

  getAverageMetric(name: string): number {
    const measurements = this.metrics[name];
    if (!measurements || measurements.length === 0) return 0;
    return measurements.reduce((a, b) => a + b, 0) / measurements.length;
  }

  trackImageLoading(duration: number) {
    if (!this.metrics['imageLoading']) {
      this.metrics['imageLoading'] = [];
    }
    this.metrics['imageLoading'].push(duration);
  }

  trackFiltering(duration: number) {
    if (!this.metrics['filtering']) {
      this.metrics['filtering'] = [];
    }
    this.metrics['filtering'].push(duration);
  }

  clearMetrics() {
    this.metrics = {};
  }
} 