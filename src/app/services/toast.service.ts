import {Injectable} from '@angular/core';
import {NeToast} from '../models/ne-toast';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  toasts: NeToast[] = [];

  constructor() { }

  show(toast: NeToast): void {
    this.toasts.splice(0, 0, toast);
  }

  remove(toast: NeToast): void {
    this.toasts = this.toasts.filter(t => t !== toast);
  }

}
