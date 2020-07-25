import {Injectable} from '@angular/core';
import {NeNetwork} from '../models/ne-network';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  networksParsed: NeNetwork[] = [];
  networksDownloaded: NeNetwork[] = [];

  constructor() {
  }

}
