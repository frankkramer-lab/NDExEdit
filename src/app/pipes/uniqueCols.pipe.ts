import {Pipe, PipeTransform} from '@angular/core';
import {NeMappingDiscrete} from "../models/ne-mapping-discrete";

@Pipe({name: 'uniqueCols'})
export class UniqueColsPipe implements PipeTransform {
  transform(list: NeMappingDiscrete[]): string[] {
    const result: string[] = [];
    for (const item of list) {
      if (!result.includes(item.col)) {
        result.push(item.col);
      }
    }
    return result.sort((a, b) => (a < b ? 1 : 0));
  }
}
