import {Injectable} from '@angular/core';
import {NeNetwork} from '../models/ne-network';
import * as cytoscape from 'cytoscape';
import {EventObject} from 'cytoscape';
import {NeNode} from '../models/ne-node';
import {NeEdge} from '../models/ne-edge';
import {NeSelection} from '../models/ne-selection';

import {UtilityService} from './utility.service';
import {DataService} from './data.service';
import {NeStyle} from '../models/ne-style';
import {ParseService} from './parse.service';

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
   * Duration of highlighting elements in milliseconds
   * @private
   */
  private flashDuration = 2000;

  constructor(private utilityService: UtilityService,
              private dataService: DataService,
              private parseService: ParseService) {
  }

  /**
   * Renders the selected network
   * @param container DOM element where to render the graph
   * @param network network to be rendered
   */
  render(container: HTMLElement, network: NeNetwork): Promise<NeNetwork> {
    this.unsubscribeFromCoreEvents();

    return this.parseService.rebuildCoreForNetwork(network, container)
      .then(rendered => {
        const renderedNetwork = rendered;
        renderedNetwork.core.fit();
        this.subscribeToCoreEvents();
        return renderedNetwork;
      })
      .catch(e => {
        console.error(e);
        this.subscribeToCoreEvents();
        return network;
      });

  }

  /**
   * Toggles the application internal CSS class on elements with the given selector
   *
   * @param selector selector by which elements are to be highlighted
   */
  highlightBySelector(selector: string): void {
    if (selector) {
      console.log(selector);
      this.dataService.networkSelected.core.elements(selector).flashClass('custom_highlight_color', this.flashDuration);
    }
  }

  /**
   * Toggles the application internal CSS clas on specific elements
   *
   * @param id the element's id
   */
  highlightByElementId(id: string): void {
    if (id) {
      console.log(id);
      this.dataService.networkSelected.core.getElementById(id).flashClass('custom_highlight_color', this.flashDuration);
    }
  }

  /**
   * Adjusts the color and duration of higlhighting an elements by selector or ID
   * @param hexColorNodes new highlight color for nodes
   * @param hexColorEdges new highlight color for edges
   * @param duration highlight duration in milliseconds
   */
  setHighlightColorAndDuration(hexColorNodes: string, hexColorEdges: string, duration: number): void {
    const styleJson = this.dataService.networkSelected.core.style().json();
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
    this.dataService.networkSelected.core.style(styleJson);

  }

  /**
   * Toggles labels
   * @param show current status of labels
   */
  toggleLabels(show: boolean): void {
    this.dataService.networkSelected.core.elements().toggleClass('hide_label', !show);
  }

  /**
   * Fits the graph to the screen width
   */
  fitGraph(): void {
    this.dataService.networkSelected.core.fit();
  }

  /**
   * Called on component init, defines which cytoscape core events are handled
   * @private
   */
  private subscribeToCoreEvents(): void {
    if (this.dataService.networkSelected.core) {
      this.dataService.networkSelected.core.ready(() => {
        this.dataService.networkSelected.core.on('select unselect', event => {
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
    // if (this.core) {
    //   this.core.removeListener('click');
    // }
  }


  private addUtilitySelectors(core: cytoscape.Core): cytoscape.Core {

    const styleJson: NeStyle[] = core.style().json();

    for (const s of styleJson) {
      s.priority = UtilityService.utilFindPriorityBySelector(s.selector);
    }

    const styleHighlight: NeStyle = {
      selector: '.custom_highlight_color',
      style: {
        'background-color': '#ff0000',
        'line-color': '#ff0000',
        'target-arrow-color': '#ff0000',
        'source-arrow-color': '#ff0000'
      },
      priority: 4
    };

    const styleLabel: NeStyle = {
      selector: '.hide_label',
      style: {
        label: ''
      },
      priority: 4
    };

    const orderedStyle: any[] = UtilityService
      .utilOrderStylesByPriority(styleJson.concat([styleHighlight].concat([styleLabel])));

    core.style(orderedStyle);
    core.elements().addClass('custom_highlight_color hide_label');
    core.elements().toggleClass('custom_highlight_color', false);
    core.elements().toggleClass('hide_label', (core.elements('node').length > 300));
    return core;
  }

}
