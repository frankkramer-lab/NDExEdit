import {Pipe, PipeTransform} from '@angular/core';
import {NeEdge} from '../models/ne-edge';
import {NeNode} from '../models/ne-node';

@Pipe({name: 'attributesByElement'})
export class AttributesByElementPipe implements PipeTransform {

  transform(element: NeNode | NeEdge): string[] {
    const attributes: string[] = [];

    for (const key of Object.keys(element)) {
      if (!attributes.includes(key)) {
        attributes.push(key);
      }
    }

    return attributes;
  }

}
