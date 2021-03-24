import {EventEmitter, Injectable} from '@angular/core';
import {NeNetwork} from '../models/ne-network';
import {NeMappingContinuous} from '../models/ne-mapping-continuous';
import {NeMappingDiscrete} from '../models/ne-mapping-discrete';
import {UtilityService} from './utility.service';
import {NeMappingsType} from '../models/ne-mappings-type';
import {NeAspect} from '../models/ne-aspect';
import {NeMappingPassthrough} from '../models/ne-mapping-passthrough';
import {LayoutService} from './layout.service';
import {NeThresholdMap} from '../models/ne-threshold-map';

@Injectable({
  providedIn: 'root'
})

/**
 * Service containing globally accessible data and providing manipulations
 */
export class DataService {

  constructor(
    private utilityService: UtilityService,
    private layoutService: LayoutService
  ) {

    layoutService.layoutEmitter.subscribe(layout => {
      this.triggerChartRedraw();
    });
  }

  /**
   * List of networks available to be rendered within the app
   */
  networksParsed: NeNetwork[] = [];
  /**
   * List of networks available in .cx file format
   */
  networksDownloaded: any[] = [];
  /**
   * Selected network of type {@link NeNetwork|NeNetwork}
   */
  selectedNetwork: NeNetwork;
  /**
   * Selected discrete mappings of type {@link NeMappingDiscrete}
   */
  selectedDiscreteMapping: NeMappingDiscrete[];
  /**
   * Selected continuous mapping of type {@link NeMappingContinuous}
   */
  selectedContinuousMapping: NeMappingContinuous;
  /**
   * Selected passthrough mapping of type {@link NeMappingPassthrough}
   */
  selectedPassthroughMapping: NeMappingPassthrough;
  /**
   * Selected discrete mapping property
   */
  selectedDiscreteMappingProperty: string;
  /**
   * Name of a property which is to be deleted
   */
  selectedForDeletion: string;
  /**
   * On selection of a mapping this typehint is set
   */
  selectedTypeHint: NeMappingsType;

  /**
   * Canvas used to display a network
   */
  canvas: HTMLElement;
  /**
   * The network ID increment
   */
  currentNetworkId = -1;
  /**
   * List of known color properties, mainly used for color previews within {@link MainMappingsNewComponent}
   */
  colorProperties: string[] = [
    'NETWORK_BACKGROUND_PAINT',
    'NODE_BORDER_PAINT',
    'NODE_FILL_COLOR',
    'NODE_LABEL_COLOR',
    'NODE_PAINT',
    'NODE_SELECTED_PAINT',
    'EDGE_LABEL_COLOR',
    'EDGE_PAINT',
    'EDGE_SELECTED_PAINT',
    'EDGE_SOURCE_ARROW_SELECTED_PAINT',
    'EDGE_SOURCE_ARROW_UNSELECTED_PAINT',
    'EDGE_STROKE_SELECTED_PAINT',
    'EDGE_STROKE_UNSELECTED_PAINT',
    'EDGE_TARGET_ARROW_SELECTED_PAINT',
    'EDGE_TARGET_ARROW_UNSELECTED_PAINT',
    'EDGE_UNSELECTED_PAINT'
  ];

  /**
   * List of known node properties
   */
  nodeProperties = [
    'COMPOUND_NODE_PADDING',
    'COMPOUND_NODE_SHAPE',
    'NODE_BORDER_PAINT',
    'NODE_BORDER_STROKE',
    'NODE_BORDER_TRANSPARENCY',
    'NODE_BORDER_WIDTH',
    'NODE_CUSTOMGRAPHICS_1',
    'NODE_CUSTOMGRAPHICS_2',
    'NODE_CUSTOMGRAPHICS_3',
    'NODE_CUSTOMGRAPHICS_4',
    'NODE_CUSTOMGRAPHICS_5',
    'NODE_CUSTOMGRAPHICS_6',
    'NODE_CUSTOMGRAPHICS_7',
    'NODE_CUSTOMGRAPHICS_8',
    'NODE_CUSTOMGRAPHICS_9',
    'NODE_CUSTOMGRAPHICS_POSITION_1',
    'NODE_CUSTOMGRAPHICS_POSITION_2',
    'NODE_CUSTOMGRAPHICS_POSITION_3',
    'NODE_CUSTOMGRAPHICS_POSITION_4',
    'NODE_CUSTOMGRAPHICS_POSITION_5',
    'NODE_CUSTOMGRAPHICS_POSITION_6',
    'NODE_CUSTOMGRAPHICS_POSITION_7',
    'NODE_CUSTOMGRAPHICS_POSITION_8',
    'NODE_CUSTOMGRAPHICS_POSITION_9',
    'NODE_CUSTOMGRAPHICS_SIZE_1',
    'NODE_CUSTOMGRAPHICS_SIZE_2',
    'NODE_CUSTOMGRAPHICS_SIZE_3',
    'NODE_CUSTOMGRAPHICS_SIZE_4',
    'NODE_CUSTOMGRAPHICS_SIZE_5',
    'NODE_CUSTOMGRAPHICS_SIZE_6',
    'NODE_CUSTOMGRAPHICS_SIZE_7',
    'NODE_CUSTOMGRAPHICS_SIZE_8',
    'NODE_CUSTOMGRAPHICS_SIZE_9',
    'NODE_CUSTOMPAINT_1',
    'NODE_CUSTOMPAINT_2',
    'NODE_CUSTOMPAINT_3',
    'NODE_CUSTOMPAINT_4',
    'NODE_CUSTOMPAINT_5',
    'NODE_CUSTOMPAINT_6',
    'NODE_CUSTOMPAINT_7',
    'NODE_CUSTOMPAINT_8',
    'NODE_CUSTOMPAINT_9',
    'NODE_DEPTH',
    'NODE_FILL_COLOR',
    'NODE_HEIGHT',
    'NODE_LABEL_COLOR',
    'NODE_LABEL_FONT_FACE',
    'NODE_LABEL_FONT_SIZE',
    'NODE_LABEL_POSITION',
    'NODE_LABEL_TRANSPARENCY',
    'NODE_LABEL_WIDTH',
    'NODE_NESTED_NETWORK_IMAGE_VISIBLE',
    'NODE_PAINT',
    'NODE_SELECTED',
    'NODE_SELECTED_PAINT',
    'NODE_SHAPE',
    'NODE_SIZE',
    'NODE_TRANSPARENCY',
    'NODE_VISIBLE',
    'NODE_WIDTH',
    'NODE_X_LOCATION',
    'NODE_Y_LOCATION',
    'NODE_Z_LOCATION',
  ];
  /**
   * List of known edge properties
   */
  edgeProperties = [
    'EDGE_CURVED',
    'EDGE_LABEL_COLOR',
    'EDGE_LABEL_FONT_FACE',
    'EDGE_LABEL_FONT_SIZE',
    'EDGE_LABEL_TRANSPARENCY',
    'EDGE_LABEL_WIDTH',
    'EDGE_LINE_TYPE',
    'EDGE_PAINT',
    'EDGE_SELECTED',
    'EDGE_SELECTED_PAINT',
    'EDGE_SOURCE_ARROW_SELECTED_PAINT',
    'EDGE_SOURCE_ARROW_SHAPE',
    'EDGE_SOURCE_ARROW_SIZE',
    'EDGE_SOURCE_ARROW_UNSELECTED_PAINT',
    'EDGE_STROKE_SELECTED_PAINT',
    'EDGE_STROKE_UNSELECTED_PAINT',
    'EDGE_TARGET_ARROW_SELECTED_PAINT',
    'EDGE_TARGET_ARROW_SHAPE',
    'EDGE_TARGET_ARROW_SIZE',
    'EDGE_TARGET_ARROW_UNSELECTED_PAINT',
    'EDGE_TRANSPARENCY',
    'EDGE_UNSELECTED_PAINT',
    'EDGE_VISIBLE',
    'EDGE_WIDTH'
  ];

  /**
   * Toggle redraw of a chart
   */
  chartRedrawEmitter = new EventEmitter<boolean>();

  /**
   * Toggle flipping the layout
   */
  flipLayoutEmitter = new EventEmitter<boolean>();

  /**
   * Toggle rebuild of the network's core for rendering
   */
  networkChangedEmitter = new EventEmitter<NeNetwork>();

  /**
   * Builds the definition string for a discrete mapping
   * @param mapping Discrete mapping to be condensed into a string
   * @private
   */
  private static buildDiscreteMappingDefinition(mapping: NeMappingDiscrete): string {
    let definition = 'COL=' + mapping.col + ',T=' + mapping.type || 'string';

    for (let i = 0; i < mapping.keys.length; i++) {

      // only add a key-value-pair if both sides are defined and value is not empty
      if (mapping.keys[i] !== null && mapping.values[i] !== null && mapping.values[i] !== '') {

        if (mapping.styleProperty === 'NODE_LABEL_FONT_FACE' || mapping.styleProperty === 'EDGE_LABEL_FONT_FACE') {
          mapping.values[i] += ',,plain,,14';
        }

        definition += ',K=' + i + '=' + mapping.keys[i];
        definition += ',V=' + i + '=' + mapping.values[i];
      }
    }
    return definition;
  }

  /**
   * Builds the definition string for a continuous mapping
   * @param mapping Continuous mapping to be condensed into a string
   * @private
   */
  private static buildContinuousMappingDefinition(mapping: NeMappingContinuous): string {
    let definition = 'COL=' + mapping.col + ',T=' + mapping.type;

    for (let i = 0; i < mapping.thresholds.length; i++) {
      definition += ',L=' + i + '=' + mapping.lowers[i];
      definition += ',E=' + i + '=' + mapping.equals[i];
      definition += ',G=' + i + '=' + mapping.greaters[i];
      definition += ',OV=' + i + '=' + mapping.thresholds[i];
    }
    return definition;
  }

  /**
   * Builds the definition string for a passthrough mapping
   * @param mapping Passthrough mapping to be condensed into a string
   * @private
   */
  private static buildPassthroughMappingDefinition(mapping: NeMappingPassthrough): string {
    return 'COL=' + mapping.col + ',T=string';
  }

  /**
   * Selecting a network
   *
   * @param networkId
   */
  selectNetwork(networkId: number): void {
    this.selectedNetwork = this.networksParsed.find(x => x.id === networkId);
  }

  /**
   * Returns the currently selected network
   */
  getSelectedNetwork(): NeNetwork {
    return this.selectedNetwork;
  }

  /**
   * Returns the default canvas
   */
  getCanvas(): HTMLElement {
    return this.canvas;
  }

  /**
   * Fetches a network by its id
   * @param id The network's id
   */
  getNetworkById(id: number): NeNetwork {
    return this.networksParsed.find(x => x.id === id);
  }

  /**
   * Removes a mapping completely
   */
  removeMapping(): void {

    let col: string;
    let styleProperty: string;
    const isDiscrete = this.selectedTypeHint.nd || this.selectedTypeHint.ed;
    const isContinuous = this.selectedTypeHint.nc || this.selectedTypeHint.ec;
    const isNode = this.selectedTypeHint.nd || this.selectedTypeHint.nc || this.selectedTypeHint.np;

    if (isDiscrete) {
      col = this.selectedDiscreteMapping[0].col;
    } else if (isContinuous) {
      col = this.selectedContinuousMapping.col;
      styleProperty = this.selectedContinuousMapping.styleProperty;
    } else {
      col = this.selectedPassthroughMapping.col;
      styleProperty = this.selectedPassthroughMapping.styleProperty;
    }

    for (const fd of this.selectedNetwork.cx) {
      if (fd.cyVisualProperties) {
        for (const cvp of fd.cyVisualProperties) {
          if (isNode && cvp.properties_of === 'nodes:default' && cvp.mappings) {

            for (const key of Object.keys(cvp.mappings)) {

              const keyCol = this.utilityService.utilExtractColByMappingString(cvp.mappings[key].definition);
              if (keyCol === col) {

                if ((!isDiscrete && styleProperty === key) || isDiscrete) {
                  delete cvp.mappings[key];
                }
              }
            }

          } else if (!isNode && cvp.properties_of === 'edges:default' && cvp.mappings) {
            for (const key of Object.keys(cvp.mappings)) {

              const keyCol = this.utilityService.utilExtractColByMappingString(cvp.mappings[key].definition);
              if (keyCol === col) {

                if ((!isDiscrete && styleProperty === key) || isDiscrete) {
                  delete cvp.mappings[key];
                }
              }
            }
          }
        }
      }
    }

    this.triggerNetworkCoreBuild();
    if (isDiscrete) {
      this.selectedDiscreteMapping = null;
      this.selectedDiscreteMappingProperty = null;
    } else if (isContinuous) {
      this.selectedContinuousMapping = null;
    } else {
      this.selectedPassthroughMapping = null;
    }
  }

  /**
   * Returns ID of a discrete mapping, which suits the specified property
   * @param mappings
   * @param property
   */
  findDiscreteMappingForProperty(mappings: NeMappingDiscrete[], property: NeAspect): number {
    for (let i = 0; i < mappings.length; i++) {
      const map = mappings[i];
      if (map.col === property.name) {
        // this.dataService.selectMapping(this.mapType + i); // can only be selected, if mapping was inserted!
        return mappings.indexOf(map);
      }
    }
    return null;
  }

  /**
   * Adds a discrete mapping to the selected network
   *
   * @param mapping New mapping
   * @param typeHint Type of newly created mapping
   */
  addMappingDiscrete(mapping: NeMappingDiscrete, typeHint: NeMappingsType): void {

    if (typeHint.nc || typeHint.ec || typeHint.np || typeHint.ep) {
      console.log('Continuous or passthrough mapping cannot be added as a discrete mapping');
      return;
    }

    const nameOfProperty = mapping.styleProperty;

    for (const entry of this.selectedNetwork.cx) {
      if (entry.cyVisualProperties) {
        for (const item of entry.cyVisualProperties) {

          if (!item.mappings && item.properties_of !== 'network') {
            item.mappings = {};
            continue;
          }

          if (item.mappings && !item.mappings[nameOfProperty]
            && ((typeHint.nd && (item.properties_of === 'nodes' || item.properties_of === 'nodes:default'))
              || (typeHint.ed && (item.properties_of === 'edges' || item.properties_of === 'edges:default')))
          ) {
            item.mappings[nameOfProperty] = {
              definition: DataService.buildDiscreteMappingDefinition(mapping),
              type: 'DISCRETE'
            };
          }
        }
      }
    }
    this.triggerNetworkCoreBuild();

  }

  /**
   * Adds a continuous mapping to the selected network
   *
   * @param mapping New mapping
   * @param styleProperty Mapped style property
   * @param typeHint Type of newly created mapping
   */
  addMappingContinuous(mapping: NeMappingContinuous, styleProperty: string, typeHint: NeMappingsType): void {
    if (typeHint.nd || typeHint.ed || typeHint.np || typeHint.ep) {
      console.log('Discrete or passthrough mapping cannot be added as a continuous mapping');
      return;
    }

    for (const entry of this.selectedNetwork.cx) {
      if (entry.cyVisualProperties) {
        for (const item of entry.cyVisualProperties) {

          if (!item.mappings && item.properties_of !== 'network') {
            item.mappings = {};
            continue;
          }

          if (item.mappings && !item.mappings[styleProperty]
            && ((typeHint.nc && (item.properties_of === 'nodes' || item.properties_of === 'nodes:default'))
              || (typeHint.ec && (item.properties_of === 'edges' || item.properties_of === 'edges:default')))
          ) {
            item.mappings[styleProperty] = {
              definition: DataService.buildContinuousMappingDefinition(mapping),
              type: 'CONTINUOUS'
            };
          }
        }
      }
    }
    this.triggerNetworkCoreBuild();

  }

  /**
   * Adds a passthrough mapping to the selected network
   *
   * @param mappingPassthrough New mapping
   * @param typeHint Type of newly created mapping
   */
  addMappingPassthrough(mappingPassthrough: NeMappingPassthrough, typeHint: NeMappingsType): void {

    if (typeHint.nd || typeHint.ed || typeHint.nc || typeHint.ec) {
      console.log('Discrete or continuous mapping cannot be added as a passthrough mapping');
      return;
    }

    console.log(this.selectedNetwork.mappings.nodesPassthrough);
    console.log(mappingPassthrough);

    const mappingDefinition = DataService.buildPassthroughMappingDefinition(mappingPassthrough);

    if (typeHint.np) {

      if (this.selectedNetwork.mappings.nodesPassthrough.some(a => a.col === mappingPassthrough.col
        && a.styleProperty === mappingPassthrough.styleProperty)) {

        console.log('This combination of col and style property exists for a passthrough node mapping!');
        return;

      } else {

        for (const fd of this.selectedNetwork.cx) {
          if (fd.cyVisualProperties) {
            for (const cy of fd.cyVisualProperties) {
              console.log(cy);
              if (cy.properties_of === 'nodes:default') {
                if (!cy.mappings) {
                  cy.mappings = {};
                }

                if (cy.mappings[mappingPassthrough.styleProperty]) {
                  console.log('Overriding existing properties is not intended. Aborting ...');
                  return;
                }

                cy.mappings[mappingPassthrough.styleProperty] = {
                  type: 'PASSTHROUGH',
                  definition: mappingDefinition
                };

              }
            }
          }
        }
      }

    } else if (typeHint.ep) {

      if (this.selectedNetwork.mappings.edgesPassthrough.some(a => a.col === mappingPassthrough.col
        && a.styleProperty === mappingPassthrough.styleProperty)) {
        console.log('This combination of col and style property exists for a passthrough node mapping!');
        return;

      } else {

        for (const fd of this.selectedNetwork.cx) {
          if (fd.cyVisualProperties) {
            for (const cy of fd.cyVisualProperties) {
              if (cy.properties_of === 'edges:default') {
                if (!cy.mappings) {
                  cy.mappings = {};
                }
                if (!cy.mappings[mappingPassthrough.styleProperty]) {
                  cy.mappings[mappingPassthrough.styleProperty] = {
                    type: 'PASSTHROUGH',
                    definition: mappingDefinition
                  };
                }
              }
            }
          }
        }
      }
    }
    this.triggerNetworkCoreBuild();

  }

  /**
   * Removing a property from an existing mapping can only be executed for discrete mappings.
   * It works directly on the cx data and triggers the core rebuild.
   */
  removePropertyFromMapping(): void {
    const isNode = this.selectedTypeHint.nd;

    for (const fd of this.selectedNetwork.cx) {
      if (fd.cyVisualProperties) {
        for (const cvp of fd.cyVisualProperties) {
          if (isNode && cvp.properties_of === 'nodes:default' && cvp.mappings) {
            if (cvp.mappings[this.selectedForDeletion]) {
              delete cvp.mappings[this.selectedForDeletion];
              break;
            }

          } else if (!isNode && cvp.properties_of === 'edges:default' && cvp.mappings) {
            if (cvp.mappings[this.selectedForDeletion]) {
              delete cvp.mappings[this.selectedForDeletion];
              break;
            }
          }
        }
      }
    }
    this.selectPropertyForDeletion();
    this.triggerNetworkCoreBuild();

  }

  /**
   * Edits an existing mapping, usable for both discrete and contiuous mappings
   */
  editMappingDiscrete(typeHint: NeMappingsType, mapping: NeMappingDiscrete, discretePropertyPointer: number = null): void {

    if (typeHint.nd || typeHint.ed) {
      this.selectPropertyForDeletion(discretePropertyPointer);
      this.removePropertyFromMapping();
      this.addMappingDiscrete(mapping, typeHint);
      this.selectPropertyForDeletion();

    }

  }

  editMappingContinuous(typeHint: NeMappingsType, thresholds: NeThresholdMap[]): void {
    const typeLiteral = this.utilityService.utilGetTypeLiteralByTypeHint(typeHint);
    const defLower = thresholds[0];
    const defGreater = thresholds[1];
    thresholds = thresholds.filter(a => a.value !== null).sort((a, b) => a.value > b.value ? 1 : -1);

    console.log(thresholds);

    const mapThresholds = thresholds.map(a => a.value);
    const equals = thresholds.map(a => a.propertyValue);
    const lowers: string[] = thresholds.map(a => a.propertyValue);
    const greaters: string[] = thresholds.map(a => a.propertyValue);
    lowers[0] = defLower.propertyValue;
    greaters[greaters.length - 1] = defGreater.propertyValue;

    const newMapping: NeMappingContinuous = this.selectedContinuousMapping;
    newMapping.equals = equals;
    newMapping.lowers = lowers;
    newMapping.greaters = greaters;
    newMapping.thresholds = mapThresholds;

    console.log(newMapping);
    this.removeMapping();
    this.addMappingContinuous(newMapping, newMapping.styleProperty, typeHint);
  }

  /**
   * Emits a value to trigger redrawing of a displayed chart
   * Avoids unpretty distortions of charts
   */
  triggerChartRedraw(): void {
    this.chartRedrawEmitter.emit(true);
  }

  /**
   * Incrementing the network ID increment and returning it.
   */
  nextId(): number {
    return ++this.currentNetworkId;
  }

  /**
   * Returns a mapping based on its ID and the currently selected network
   * @param index string literal, e.g. 'nd0' for nodes discrete at index 0 of the current network
   */
  findMappingById(index: string): NeMappingContinuous | NeMappingDiscrete {
    const typeHint = this.utilityService.utilGetTypeHintByString(index.substr(0, 2));
    const i = index.substr(2);

    if (typeHint.nd) {
      return this.selectedNetwork.mappings.nodesDiscrete[i];
    } else if (typeHint.ed) {
      return this.selectedNetwork.mappings.edgesDiscrete[i];
    } else if (typeHint.nc) {
      return this.selectedNetwork.mappings.nodesContinuous[i];
    } else if (typeHint.ec) {
      return this.selectedNetwork.mappings.edgesContinuous[i];
    } else {
      console.log('no matching mapping found');
      return null;
    }
  }

  /**
   * Selects a discrete or continuous mapping based on a typehint
   * @param mapHint [DISCRETE] hint containing typehint
   * @param col [DISCRETE] property needs to be specified when selecting a discrete mapping
   * @param mapId [CONTINUOUS|PASSTHROUGH] string containing both typehint and id for continuous mappings
   */
  selectMapping(mapHint: string = null, col: string = null, mapId: string = null): void {

    if (mapId !== null) {
      // continuous or passthrough mapping do not need property
      this.selectedTypeHint = this.utilityService.utilGetTypeHintByString(mapId.substr(0, 2));
      const pointer = Number(mapId.substr(2));

      if (this.selectedTypeHint.nc) {
        this.selectedContinuousMapping = this.selectedNetwork.mappings.nodesContinuous[pointer];
        this.selectedPassthroughMapping = null;
      } else if (this.selectedTypeHint.ec) {
        this.selectedContinuousMapping = this.selectedNetwork.mappings.edgesContinuous[pointer];
        this.selectedPassthroughMapping = null;
      } else if (this.selectedTypeHint.np) {
        this.selectedPassthroughMapping = this.selectedNetwork.mappings.nodesPassthrough[pointer];
        this.selectedContinuousMapping = null;
      } else if (this.selectedTypeHint.ep) {
        this.selectedPassthroughMapping = this.selectedNetwork.mappings.edgesPassthrough[pointer];
        this.selectedContinuousMapping = null;
      }

      this.selectedDiscreteMapping = null;
      this.selectedDiscreteMappingProperty = null;

    } else {

      this.selectedTypeHint = this.utilityService.utilGetTypeHintByString(mapHint);
      const selectedDiscrete: NeMappingDiscrete[] = [];

      if (this.selectedTypeHint.nd) {
        for (const nd of this.selectedNetwork.mappings.nodesDiscrete) {
          if (nd.col === col && !selectedDiscrete.includes(nd)) {
            if (this.selectedDiscreteMappingProperty !== nd.col) {
              this.selectedDiscreteMappingProperty = nd.col;
            }
            selectedDiscrete.push(nd);
          }
        }
      } else if (this.selectedTypeHint.ed) {
        for (const ed of this.selectedNetwork.mappings.edgesDiscrete) {
          if (ed.col === col && !selectedDiscrete.includes(ed)) {
            if (this.selectedDiscreteMappingProperty !== ed.col) {
              this.selectedDiscreteMappingProperty = ed.col;
            }
            selectedDiscrete.push(ed);
          }
        }
      }
      this.selectedDiscreteMapping = selectedDiscrete;
      this.selectedContinuousMapping = null;
      this.selectedPassthroughMapping = null;
    }
  }

  /**
   * Selects a property within a discrete mapping for deletion.
   * A discrete mapping has to be active for this to work
   * @param propertyId points to the id within the discrete mapping to be deleted
   */
  selectPropertyForDeletion(propertyId: number = null): void {
    if (propertyId === null) {
      this.selectedForDeletion = null;
      return;
    }

    if (!this.selectedDiscreteMapping) {
      console.log('No discrete mapping selected to delete property with ID: ' + propertyId);
      return;
    }
    this.selectedForDeletion = this.selectedDiscreteMapping[propertyId].styleProperty;
  }

  /**
   * Resets a selected discrete mapping property
   */
  resetDiscreteMappingPropertySelection(): void {
    this.selectedDiscreteMappingProperty = null;
  }

  /**
   * Resets continuous and discrete mapping selection
   */
  resetAnyMappingSelection(): void {
    this.selectedDiscreteMapping = null;
    this.selectedContinuousMapping = null;
    this.selectedTypeHint = null;
  }

  /**
   * Emits the currently changed network
   * @private
   */
  private triggerNetworkCoreBuild(): void {
    this.networkChangedEmitter.emit(this.selectedNetwork);
  }

  /**
   * Defines the canvas to be used to render a network
   * @param nativeElement HTML element used as canvas
   */
  setCanvas(nativeElement: any): void {
    if (nativeElement) {
      this.canvas = nativeElement;
    }
  }

  /**
   * Returns the mapping belonging to this typehint with id, e.g. 'nd0' returns the discrete node mapping on index 0
   * @param hintWithId string containing both typehint and id
   */
  getMappingByHintAndId(hintWithId: string): NeMappingDiscrete | NeMappingContinuous {
    const hintString = hintWithId.substring(0, 2);
    const id = hintWithId.substring(2);
    const typeHint = this.utilityService.utilGetTypeHintByString(hintString);
    if (typeHint.nd) {
      return this.selectedNetwork.mappings.nodesDiscrete[id];
    } else if (typeHint.nc) {
      return this.selectedNetwork.mappings.nodesContinuous[id];
    } else if (typeHint.ed) {
      return this.selectedNetwork.mappings.edgesDiscrete[id];
    } else if (typeHint.ec) {
      return this.selectedNetwork.mappings.edgesContinuous[id];
    } else if (typeHint.np) {
      return this.selectedNetwork.mappings.nodesPassthrough[id];
    } else if (typeHint.ep) {
      return this.selectedNetwork.mappings.edgesPassthrough[id];
    }
  }

  /**
   * Returns an aspects minimum based on a specific mapping. The mapping belongs to the currently selected network.
   * @param mapping Has to be of type {@link NeMappingContinuous}, because other mappings do not have a minimum
   * @param typeHint Indicating which type of mapping is given
   */
  getPropertyMinByMapping(mapping: NeMappingContinuous, typeHint: NeMappingsType): number {
    const aspect = this.getPropertyByMapping(mapping, typeHint);
    return aspect.min;
  }

  /**
   * Returns an aspects maximum based on a specific mapping. The mapping belongs to the currently selected network.
   * @param mapping Has to be of type {@link NeMappingContinuous}, because other mappings do not have a maximum
   * @param typeHint Indicating which type of mapping is given
   */
  getPropertyMaxByMapping(mapping: NeMappingContinuous, typeHint: NeMappingsType): number {
    const aspect = this.getPropertyByMapping(mapping, typeHint);
    return aspect.max;
  }

  /**
   * Returns a nodeProperty or edgeProperty of type {@link NeAspect}
   * based on the currently selected network.
   * @param mapping Can either be of type
   * {@link NeMappingContinuous}, {@link NeMappingDiscrete} or {@link NeMappingPassthrough}
   * @param typeHint Indicating which type of aspect is to be searched for the matching property
   */
  getPropertyByMapping(
    mapping: NeMappingContinuous | NeMappingPassthrough | NeMappingDiscrete,
    typeHint: NeMappingsType
  ): NeAspect {

    if (typeHint.nd || typeHint.nc || typeHint.np) {
      for (const n of this.selectedNetwork.aspectKeyValuesNodes) {
        if (n.name === mapping.col) {
          return n;
        }
      }
    } else {
      for (const e of this.selectedNetwork.aspectKeyValuesEdges) {
        if (e.name === mapping.col) {
          return e;
        }
      }
    }

  }

  /**
   * Returns the number of elements for each type of mapping for the currently selected network
   * @param type string indicating type of mapping, e.g. 'nd'
   */
  countMappingsByHint(type: string): number {
    switch (type) {
      case 'nd':
        return this.selectedNetwork.mappings.nodesDiscrete.length;
      case'nc':
        return this.selectedNetwork.mappings.nodesContinuous.length;
      case 'np':
        return this.selectedNetwork.mappings.nodesPassthrough.length;
      case 'ed':
        return this.selectedNetwork.mappings.edgesDiscrete.length;
      case 'ec':
        return this.selectedNetwork.mappings.edgesContinuous.length;
      case 'ep':
        return this.selectedNetwork.mappings.edgesPassthrough.length;
    }
  }
}
