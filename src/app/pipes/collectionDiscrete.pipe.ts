import {Pipe, PipeTransform} from '@angular/core';
import {NeMappingDiscrete} from '../models/ne-mapping-discrete';
import {NeMappingDiscreteAggregation} from '../models/ne-mapping-discrete-aggregation';

@Pipe({name: 'collectionDiscrete'})
export class CollectionDiscretePipe implements PipeTransform {

  transform(mappings: NeMappingDiscrete[]): NeMappingDiscreteAggregation {

    const object: NeMappingDiscreteAggregation = {
      keys: [],
    };

    for (const mapping of mappings) {
      for (const key of mapping.keys) {
        if (!object.keys.includes(key)) {
          object.keys.push(key);
          object[key] = [];
        }
      }
    }

    // Collecting values overall mappings
    // With respect to useValue property (assigned, but hidden values)
    for (const key of object.keys) {
      for (const mapping of mappings) {
        const useValueIndex = Object.keys(mapping.mapObject).findIndex(a => a === key);
        if (!!mapping.mapObject[key] && useValueIndex > -1 && mapping.useValue[useValueIndex]) {
          object[key].push(mapping.mapObject[key]);
        } else {
          object[key].push(null);
        }
      }
    }

    const validObject: NeMappingDiscreteAggregation = {
      keys: []
    };

    outer: for (const key of object.keys) {

      for (const item of object[key]) {
        if (item !== null) {
          validObject.keys.push(key);
          validObject[key] = object[key];
          continue outer;
        }
      }
    }
    return validObject;
  }
}
