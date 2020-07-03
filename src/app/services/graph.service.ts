import {Injectable} from '@angular/core';
import {NeNetwork} from '../models/ne-network';
import * as cytoscape from 'cytoscape';
import {CytoscapeOptions} from 'cytoscape';

@Injectable({
  providedIn: 'root'
})
export class GraphService {

  constructor() {
  }

  render(container: HTMLElement, network: NeNetwork): cytoscape.Core {
    return cytoscape(this.interpretAsCytoscape(container, network));
  }

  interpretAsCytoscape(container: HTMLElement, network: NeNetwork): CytoscapeOptions {
    return {
      container,
      elements: network.elements,
      style: network.style,
      layout: {
        name: 'preset'
      }
    };
  }
}
