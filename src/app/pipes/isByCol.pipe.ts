import {Pipe, PipeTransform} from '@angular/core';
import {NeMappingDiscrete} from '../models/ne-mapping-discrete';

@Pipe({name: 'isByCol'})
export class IsByColPipe implements PipeTransform {

  transform(mappings: NeMappingDiscrete[], col: string): string[] {
    const is: string[] = [];

    for (const map of mappings) {
      if (map.col === col) {
        for (const key of map.keys) {
          if (!is.includes(key as string)) {
            is.push(key as string);
          }
        }
      }
    }
    return is;
  }
}
