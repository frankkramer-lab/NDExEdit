import {Injectable} from '@angular/core';
import {NeNetwork} from '../models/ne-network';
import * as cytoscape from 'cytoscape';
import {CytoscapeOptions, EventObject} from 'cytoscape';
import {NeCyGraphSettings} from '../models/ne-cy-graph-settings';
import {NeNode} from '../models/ne-node';
import {NeEdge} from '../models/ne-edge';

@Injectable({
  providedIn: 'root'
})
export class GraphService {

  private core: cytoscape.Core;
  private flashDuration = 2000;

  private selectedNodes: NeNode[] = [];
  private selectedEdges: NeEdge[] = [];

  public selectedElements = {
    nodes: this.selectedNodes,
    edges: this.selectedEdges
  };

  constructor() {
  }

  render(container: HTMLElement, network: NeNetwork): cytoscape.Core {
    this.unsubscribeFromCoreEvents();
    this.core = cytoscape(this.interpretAsCytoscape(container, network));
    this.core.elements('.custom_highlight_color').toggleClass('custom_highlight_color', false);
    this.subscribeToCoreEvents();
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

  }

  toggleLabels(show: boolean): void {
    this.core.elements().toggleClass('hide_label', !show);
  }

  private subscribeToCoreEvents(): void {
    if (this.core) {
      this.core.ready(() => {
        // todo define all events here
        this.core.on('click', event => {
          this.handleEvent(event);
        });
      });
    }
  }

  private handleEvent(event: EventObject): void {
    console.log(event);
  }

  private unsubscribeFromCoreEvents(): void {
    if (this.core) {
      this.core.removeListener('click');
    }
  }

}
