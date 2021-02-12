import {Pipe, PipeTransform} from '@angular/core';
import {NeMappingDiscrete} from '../models/ne-mapping-discrete';

@Pipe({name: 'styleValueByColAndKey'})
export class StyleValueByColAndKeyPipe implements PipeTransform {

  transform(mappings: NeMappingDiscrete[], col: string, style: string, is: string): string {
    for (const map of mappings) {
      if (map.col === col && map.styleProperty === style) {
        console.log(map, is);

        const keyIndex = map.keys.indexOf(is);

        if (map.values[keyIndex] !== null) {
          return map.values[keyIndex];
        }
        return null;
      }
    }
  }

}
