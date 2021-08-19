import {Pipe, PipeTransform} from '@angular/core';
import {NeMapping} from '../models/ne-mapping';

@Pipe({name: 'uniqueCols'})
export class UniqueColsPipe implements PipeTransform {
  transform(list: NeMapping[]): string[] {

    const result: string[] = [];
    for (const item of list) {

      if (!result.includes(item.col)) {
        result.push(item.col);
      }
    }
    return result.sort((a, b) => (a < b ? 1 : 0));
  }
}
