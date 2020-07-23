import {Injectable} from '@angular/core';
import {NeNetwork} from '../models/ne-network';
import {NeElement} from '../models/ne-element';
import {NeElementAttribute} from '../models/ne-element-attribute';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  networksParsed: NeNetwork[] = [];
  networksDownloaded: NeNetwork[] = [];

  constructor() {
  }

}
