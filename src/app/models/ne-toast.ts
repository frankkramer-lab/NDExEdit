import {TemplateRef} from '@angular/core';
import {ToastType} from '../services/utility.service';

export interface NeToast {
  delay: number;
  needsConfirmation: boolean;
  type: ToastType;
  textOrTpl: TemplateRef<any>;
}
