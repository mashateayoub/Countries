import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KeyboardNavigationService {
  private selectedIndex = -1;
  private keyboardEvent = new Subject<KeyboardEvent>();
  keyboardEvent$ = this.keyboardEvent.asObservable();

  setSelectedIndex(index: number) {
    this.selectedIndex = index;
  }

  getSelectedIndex(): number {
    return this.selectedIndex;
  }

  emitKeyboardEvent(event: KeyboardEvent) {
    this.keyboardEvent.next(event);
  }
} 