import {Pipe, PipeTransform} from '@angular/core';
import {NeMappingDiscrete} from '../models/ne-mapping-discrete';
import {NeStyleMap} from '../models/ne-style-map';

@Pipe({name: 'stylePropertiesByCol'})
export class StylePropertiesByCol implements PipeTransform {
  transform(mappings: NeMappingDiscrete[], col: string): NeStyleMap[] {

    const styleProperties: NeStyleMap[] = [];

    for (const map of mappings) {
      if (map.col === col) {

        const newProperty: NeStyleMap = {
          attributeValues: map.keys as string[],
          cssKey: map.styleProperty,
          cssValues: map.values as string[],
          isColor: (map.values as string[]).filter(a => !a.startsWith('#')).length === 0
        };

        if (!styleProperties.includes(newProperty)) {
          styleProperties.push(newProperty);
        }
      }
    }

    return styleProperties;
  }

}
