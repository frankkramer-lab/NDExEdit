import {NeElement} from './ne-element';

export interface NeStyle {
  selector: string;
  style: any;
  appliedTo?: NeElement[];
}
