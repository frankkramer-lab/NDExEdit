import {Pipe, PipeTransform} from '@angular/core';
import {NeMappingDiscrete} from '../models/ne-mapping-discrete';

@Pipe({name: 'styleValueByColAndKey'})
export class StyleValueByColAndKeyPipe implements PipeTransform {

  transform(mappings: NeMappingDiscrete[], col: string, style: string, is: string): string {

    if (!mappings) {
      return '';
    }

    for (const map of mappings) {
      if (map.col === col && map.styleProperty === style) {

        const keyIndex = map.keys.indexOf(is);

        if (!!map.values[keyIndex]
          && map.useValue[keyIndex]) {
          return map.values[keyIndex];
        }
        return null;
      }
    }
  }

}
