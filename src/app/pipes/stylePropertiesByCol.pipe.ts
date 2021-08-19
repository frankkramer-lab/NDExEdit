import {Pipe, PipeTransform} from '@angular/core';
import {NeMapping} from '../models/ne-mapping';

@Pipe({name: 'stylePropertiesByCol'})
export class StylePropertiesByCol implements PipeTransform {
  transform(mappings: NeMapping[], col: string): string[] {

    const styleProperties: string[] = [];

    for (const map of mappings) {
      if (map.col === col) {

        if (!styleProperties.includes(map.styleProperty)) {
          styleProperties.push(map.styleProperty);
        }
      }
    }
    return styleProperties;
  }

}
