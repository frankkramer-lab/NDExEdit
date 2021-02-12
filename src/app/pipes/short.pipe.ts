import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'short'})
export class ShortPipe implements PipeTransform {

  transform(input: string): string {

    const prefix = ['NODE_', 'EDGE_'];

    for (const p of prefix) {
      if (input.startsWith(p)) {
        return input.substr(p.length);
      }
    }
    return input;
  }

}
