import {Injectable} from '@angular/core';
import {NeNetwork} from '../models/ne-network';
import {EventObject} from 'cytoscape';
import {NeNode} from '../models/ne-node';
import {NeEdge} from '../models/ne-edge';
import {NeSelection} from '../models/ne-selection';

import {UtilityService} from './utility.service';
import {DataService} from './data.service';
import {ParseService} from './parse.service';
import {NeAspect} from '../models/ne-aspect';
import {NeElement} from '../models/ne-element';

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
    nodeProperties: [],
    edges: [],
    edgeProperties: []
  };

  /**
   * Duration of highlighting elements in milliseconds
   * @private
   */
  private flashDuration = 2000;

  constructor(
    private utilityService: UtilityService,
    private dataService: DataService,
    private parseService: ParseService
  ) {
    dataService.networkChangedEmitter.subscribe(network => {
      this.render(network)
        .then()
        .catch(e => console.error(e));
    });
  }

  /**
   * Renders the selected network
   * @param network network to be rendered
   */
  render(network: NeNetwork): Promise<NeNetwork> {
    this.unsubscribeFromCoreEvents();
    return this.parseService.rebuildCoreForNetwork(network)
      .then(rendered => {
        const renderedNetwork = rendered;
        renderedNetwork.core.fit();
        renderedNetwork.showLabels = this.utilityService.utilShowLabels(renderedNetwork.core);
        this.subscribeToCoreEvents();
        return renderedNetwork;
      })
      .catch(e => {
        console.error(e);
        console.log('Not subscribing to core events due to errors!');
        return network;
      });

  }

  /**
   * Flashes the application internal style class on specific elements
   *
   * @param id the element's id
   */
  highlightByElementId(id: string): void {
    if (id) {
      const selection = this.dataService.selectedNetwork.core.filter('#' + id);
      selection.flashClass('custom_highlight_color', this.flashDuration);
    }
  }

  /**
   * Flashes the application internal style class on specific elements,
   * if they have a property with values in the given range
   *
   * @param type string indicating if this filter is applied to nodes or edges
   * @param property Property, an element needs to have in order to be highlighted
   * @param lower lower bound for the elements to be highlighted
   * @param upper upper bound for the elements to be highlighted
   */
  highlightByElementRange(type: string, property: NeAspect, lower: number, upper: number): void {

    if (lower > upper) {
      console.log('Invalid bounds! Highlighting empty set');
      return;
    }

    let prefix;
    if (type === 'node') {
      prefix = 'node[';
    } else {
      prefix = 'edge[';
    }

    const first = prefix + this.parseService.attributeNameMap[property.name.toLowerCase()] + ' >= ' + lower + ']';
    const second = prefix + this.parseService.attributeNameMap[property.name.toLowerCase()] + ' <= ' + upper + ']';

    const selection = this.dataService.selectedNetwork.core.elements(first + second);
    selection.flashClass('custom_highlight_color', this.flashDuration);
  }

  /**
   * Flashes the application internal style class on specific elements,
   * if they have a property with values in the given range
   *
   * @param type string indicating if this filter is applied to nodes or edges
   * @param property Property, an element needs to have in order to be highlighted
   * @param sameAs value the element's property needs to have in order to be highlighted
   */
  highlightByElementSameAs(type: string, property: NeAspect, sameAs: string): void {

    let prefix;
    if (type === 'node') {
      prefix = 'node[';
    } else {
      prefix = 'edge[';
    }

    let definition;
    if (property.datatype === 'boolean' && sameAs === 'true') {
      definition = prefix + '?' + this.parseService.attributeNameMap[property.name.toLowerCase()] + ']';
    } else if (property.datatype === 'boolean' && sameAs === 'false') {
      definition = prefix + '!' + this.parseService.attributeNameMap[property.name.toLowerCase()] + ']';
    } else {
      definition = prefix + this.parseService.attributeNameMap[property.name.toLowerCase()] + ' = "' + sameAs + '"]';
    }
    const selection = this.dataService.selectedNetwork.core.elements(definition);
    selection.flashClass('custom_highlight_color', this.flashDuration);
  }

  /**
   * Adjusts the color and duration of higlhighting an elements by selector or ID
   * @param hexColorNodes new highlight color for nodes
   * @param hexColorEdges new highlight color for edges
   * @param duration highlight duration in milliseconds
   */
  setHighlightColorAndDuration(hexColorNodes: string, hexColorEdges: string, duration: number): void {
    const styleJson = this.dataService.selectedNetwork.core.style().json();
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
    this.dataService.selectedNetwork.core.style(styleJson);

  }

  /**
   * Toggles labels
   * @param show current status of labels
   */
  toggleLabels(show: boolean): void {
    this.dataService.selectedNetwork.core.elements().toggleClass('hide_label', !show);
  }

  /**
   * Fits the graph to the screen width
   */
  fitGraph(): void {
    this.dataService.selectedNetwork.core.fit();
  }

  /**
   * Called on component init, defines which cytoscape core events are handled
   * @private
   */
  private subscribeToCoreEvents(): void {
    if (this.dataService.selectedNetwork.core) {
      this.dataService.selectedNetwork.core.ready(() => {
        this.dataService.selectedNetwork.core.on('select unselect', event => {
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

    this.selectedElements.nodeProperties = this.gatherPropertiesForSelection(this.selectedElements.nodes);
    this.selectedElements.edgeProperties = this.gatherPropertiesForSelection(this.selectedElements.edges);
  }

  gatherPropertiesForSelection(elements: NeElement[]): string[] {
    const properties: string[] = [];
    for (const e of elements) {
      for (const key of Object.keys(e)) {
        if (!properties.includes(key)) {
          properties.push(key);
        }
      }
    }
    return properties;
  }

  /**
   * On component destruction unsubscribing the core events to prevent memory leaks
   * @private
   */
  private unsubscribeFromCoreEvents(): void {
    if (this.dataService.selectedNetwork.core) {
      this.dataService.selectedNetwork.core.removeListener('click');
    }
  }

}
