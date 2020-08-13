import {Injectable} from '@angular/core';
import {NeNetwork} from '../models/ne-network';
import * as cytoscape from 'cytoscape';
import {CytoscapeOptions, EventObject} from 'cytoscape';
import {NeNode} from '../models/ne-node';
import {NeEdge} from '../models/ne-edge';
import {NeSelection} from '../models/ne-selection';

@Injectable({
  providedIn: 'root'
})
export class GraphService {

  private core: cytoscape.Core;
  private flashDuration = 2000;

  public selectedElements: NeSelection = {
    nodes: [],
    edges: []
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


  interpretAsCytoscape(container: HTMLElement, network: NeNetwork): CytoscapeOptions {
    return {
      container,
      elements: network.elements,
      style: network.style,
      layout: {
        name: 'preset'
      },
    };
  }

  highlightBySelector(selector: string): void {
    if (selector !== undefined) {
      this.core.elements(selector).flashClass('custom_highlight_color', this.flashDuration);
    }
  }

  highlightByElementId(id: string): void {
    if (id !== undefined) {
      this.core.getElementById(id).flashClass('custom_highlight_color', this.flashDuration);
    }
  }

  setHighlightColorAndDuration(hexColorNodes: string, hexColorEdges: string, duration: number): void {
    const styleJson = this.core.style().json();

    for (const style of styleJson) {
      if (style.selector === '.custom_highlight_color') {
        style.style = {
          'background-color': hexColorNodes,
          'line-color': hexColorEdges,
          'target-arrow-color': hexColorEdges,
          'source-arrow-color': hexColorEdges
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
        this.core.on('select unselect', event => {
          this.handleEvent(event);
        });
      });
    }
  }

  private handleEvent(event: EventObject): void {
    switch (event.type as string) {
      case 'select':
        if (event.target.isNode()) {
          this.selectedElements.nodes.push(event.target.data() as NeNode);
        } else if (event.target.isEdge()) {
          this.selectedElements.edges.push(event.target.data() as NeEdge);
        }
        break;
      case 'unselect':
        if (event.target.isNode()) {
          this.selectedElements.nodes = this.selectedElements.nodes.filter(x => x.id !== event.target.data().id);
        } else if (event.target.isEdge()) {
          this.selectedElements.edges = this.selectedElements.edges.filter(x => x.id !== event.target.data().id);
        }
        break;
    }
  }

  private unsubscribeFromCoreEvents(): void {
    if (this.core) {
      this.core.removeListener('click');
    }
  }

  fitGraph(): void {
    this.core.fit();
  }

}
