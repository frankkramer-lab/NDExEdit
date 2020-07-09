import {Injectable} from '@angular/core';
import {NeNetwork} from '../models/ne-network';
import * as cytoscape from 'cytoscape';
import {CytoscapeOptions, ElementDefinition} from 'cytoscape';
import {NeCyGraphSettings} from '../models/ne-cy-graph-settings';
import {NeStyle} from '../models/ne-style';

@Injectable({
  providedIn: 'root'
})
export class GraphService {

  private core: cytoscape.Core;

  constructor() {
  }

  render(container: HTMLElement, network: NeNetwork): cytoscape.Core {
    this.core = cytoscape(this.interpretAsCytoscape(container, network));
    return this.core;
  }

  interpretAsCytoscape(container: HTMLElement, network: NeNetwork, overrideSettings: NeCyGraphSettings = {}): CytoscapeOptions {
    return {
      container,
      elements: network.elements,
      style: network.style,
      layout: overrideSettings.layout || {
        name: 'preset'
      },
    };
  }

  highlightBySelector(selectedNetwork: NeNetwork, style: NeStyle): void {
    // const subset: ElementDefinition[] = [];
    // for (const element of style.appliedTo) {
    //   subset.push(selectedNetwork.elements.find(x => String(x.data.id) === element.id));
    // }
    // console.log(subset);

    // this.core.elements(style.selector).toggleClass('select_custom_color');

    // console.log(this.core);
    // this.core.elements(style.selector).toggleClass(style.selector);
    // console.log(this.core);
  }
}
