import {Pipe, PipeTransform} from '@angular/core';
import {NeEdge} from '../models/ne-edge';
import {NeNode} from '../models/ne-node';

@Pipe({name: 'attributeValueByElement'})
export class AttributeValueByElementPipe implements PipeTransform {
  transform(property: string, element: NeNode | NeEdge): string {
    if (element[property]) {
      return element[property];
    }
    return null;
  }
}
