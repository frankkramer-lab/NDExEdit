import {Injectable} from '@angular/core';
import {NeNetwork} from '../models/ne-network';
import * as cytoscape from 'cytoscape';
import {CytoscapeOptions} from 'cytoscape';
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
    this.core.elements('.custom_highlight_color').toggleClass('custom_highlight_color', false);
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

  highlightBySelector(selector: string): void {
    this.core.elements(selector).flashClass('custom_highlight_color', 2000);
  }

  // setHighlightColorAndDuration(hexColorNodes: string, hexColorEdges: string, duration: number): void {
  //
  // }

}
