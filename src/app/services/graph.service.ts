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

/**
 * Service responsible for displaying a graph
 */
export class GraphService {

  /**
   * Collection of selected nodes or edges whose information are to be displayed within the sidebar
   */
  selectedElements: NeSelection = {
    nodes: [],
    edges: []
  };
  /**
   * Core belonging to the selected network
   * @private
   */
  private core: cytoscape.Core;
  /**
   * Duration of highlighting elements in milliseconds
   * @private
   */
  private flashDuration = 2000;

  constructor() {
  }

  /**
   * Renders the selected network
   * @param container DOM element where to render the graph
   * @param network network to be rendered
   */
  render(container: HTMLElement, network: NeNetwork): cytoscape.Core {
    this.unsubscribeFromCoreEvents();
    this.core = cytoscape(this.interpretAsCytoscape(container, network));
    this.core.elements('.custom_highlight_color').toggleClass('custom_highlight_color', false);
    this.subscribeToCoreEvents();
    return this.core;
  }

  /**
   * Makes a network and the chosen container a valid input for the cytoscape constructor
   * @param container DOM element where to render the graph
   * @param network selected network
   */
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

  /**
   * Toggles the application internal CSS class on elements with the given selector
   *
   * @param selector selector by which elements are to be highlighted
   */
  highlightBySelector(selector: string): void {
    if (selector) {
      this.core.elements(selector).flashClass('custom_highlight_color', this.flashDuration);
    }
  }

  /**
   * Toggles the application internal CSS clas on specific elements
   *
   * @param id the element's id
   */
  highlightByElementId(id: string): void {
    if (id) {
      this.core.getElementById(id).flashClass('custom_highlight_color', this.flashDuration);
    }
  }

  /**
   * Adjusts the color and duration of higlhighting an elements by selector or ID
   * @param hexColorNodes new highlight color for nodes
   * @param hexColorEdges new highlight color for edges
   * @param duration highlight duration in milliseconds
   */
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

  /**
   * Toggles labels
   * @param show current status of labels
   */
  toggleLabels(show: boolean): void {
    this.core.elements().toggleClass('hide_label', !show);
  }

  /**
   * Fits the graph to the screen width
   */
  fitGraph(): void {
    this.core.fit();
  }

  /**
   * Called on component init, defines which cytoscape core events are handled
   * @private
   */
  private subscribeToCoreEvents(): void {
    if (this.core) {
      this.core.ready(() => {
        this.core.on('select unselect', event => {
          this.handleEvent(event);
        });
      });
    }
  }

  /**
   * Handles cytoscape core events
   * @param event the triggered event
   * @private
   */
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

  /**
   * On component destruction unsubscribing the core events to prevent memory leaks
   * @private
   */
  private unsubscribeFromCoreEvents(): void {
    if (this.core) {
      this.core.removeListener('click');
    }
  }

}
