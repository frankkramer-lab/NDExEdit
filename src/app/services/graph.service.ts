import {Injectable} from '@angular/core';
import {NeNetwork} from '../models/ne-network';
import * as cytoscape from 'cytoscape';
import {CytoscapeOptions} from 'cytoscape';
import {NeCyGraphSettings} from '../models/ne-cy-graph-settings';
import {ParseService} from './parse.service';

@Injectable({
  providedIn: 'root'
})
export class GraphService {

  private core: cytoscape.Core;
  private flashDuration = 2000;

  constructor(private parseService: ParseService) {
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
    this.core.elements(selector).flashClass('custom_highlight_color', this.flashDuration);
  }

  setHighlightColorAndDuration(hexColorNodes: string, hexColorEdges: string, duration: number): void {
    const styleJson = this.core.style().json();

    for (const style of styleJson) {
      if (style.selector === '.custom_highlight_color') {
        style.style = {
          'background-color': hexColorNodes,
          'line-color': hexColorEdges
        };
      }
    }

    this.flashDuration = duration;
    this.core.style(styleJson);

    document.getElementById('test').className = 'alert alert-success alert-dismissible visible';

  }

}
